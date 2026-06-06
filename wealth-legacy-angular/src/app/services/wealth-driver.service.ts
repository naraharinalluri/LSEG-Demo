import { Injectable, OnDestroy, signal } from '@angular/core';
import {
  CLIENTS,
  HOLDINGS_BY_CLIENT,
  INITIAL_ACTIVITY,
  INITIAL_NEWS,
  INSTRUMENT_DEFS,
  MANDATE_EQUITY_TARGETS,
  TIMED_ACTIVITY,
  TIMED_NEWS,
} from '../data/wealth-data';
import { TICK_MS, CYCLE_MS, PERF_POINTS } from '../data/constants';
import type {
  ActivityItem,
  Client,
  ClientState,
  LiveInstrument,
  NewsItem,
  WealthState,
} from '../types';

class SeededRng {
  private s: number;
  constructor(seed: number) {
    this.s = seed;
  }
  next() {
    this.s = (this.s * 9301 + 49297) % 233280;
    return this.s / 233280;
  }
  norm() {
    return (this.next() + this.next() + this.next() + this.next() - 2) * 0.5;
  }
}

@Injectable({ providedIn: 'root' })
export class WealthDriverService implements OnDestroy {
  private readonly listeners = new Set<(s: WealthState) => void>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private readonly rng = new SeededRng(101);
  private startMs = 0;
  private readonly firedActivityIds = new Set<string>();
  private readonly firedNewsIds = new Set<string>();

  readonly stateSignal: ReturnType<typeof signal<WealthState>>;
  private state: WealthState;

  constructor() {
    this.state = this.buildInitialState();
    this.stateSignal = signal<WealthState>(this.state);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private buildInitialState(): WealthState {
    const instruments: Record<string, LiveInstrument> = {};
    for (const [symbol, def] of Object.entries(INSTRUMENT_DEFS)) {
      instruments[symbol] = {
        symbol,
        name: def.name,
        assetClass: def.assetClass,
        price: def.startPrice,
        startPrice: def.startPrice,
        lastChange: 0,
        costBasis: def.startPrice * def.costFactor,
      };
    }
    const clients: Record<string, ClientState> = {};
    for (const client of CLIENTS) {
      clients[client.id] = this.computeClientState(client, instruments);
    }
    return {
      t: 0,
      instruments,
      clients,
      activity: [...INITIAL_ACTIVITY] as ActivityItem[],
      news: [...INITIAL_NEWS].map((n) => ({ ...n, tickers: [...n.tickers] })) as NewsItem[],
    };
  }

  private computeClientState(
    client: Client,
    instruments: Record<string, LiveInstrument>,
  ): ClientState {
    const holdings = [...(HOLDINGS_BY_CLIENT[client.id as keyof typeof HOLDINGS_BY_CLIENT] ?? [])];
    let totalMv = 0;
    let dayPnl = 0;
    const allocRaw: Record<string, number> = {
      EQUITY: 0,
      ETF: 0,
      FIXED_INC: 0,
      CASH: 0,
      ALT: 0,
    };
    for (const h of holdings) {
      const inst = instruments[h.symbol];
      if (!inst) continue;
      const mv = h.qty * inst.price;
      totalMv += mv;
      dayPnl += h.qty * (inst.price - inst.startPrice);
      allocRaw[inst.assetClass] += mv;
    }
    const dayPnlPct = totalMv > 0 ? (dayPnl / (totalMv - dayPnl)) * 100 : 0;
    const allocation = {
      EQUITY: totalMv > 0 ? allocRaw['EQUITY'] / totalMv : 0,
      ETF: totalMv > 0 ? allocRaw['ETF'] / totalMv : 0,
      FIXED_INC: totalMv > 0 ? allocRaw['FIXED_INC'] / totalMv : 0,
      CASH: totalMv > 0 ? allocRaw['CASH'] / totalMv : 0,
      ALT: totalMv > 0 ? allocRaw['ALT'] / totalMv : 0,
    };
    const performanceSeries = this.seedPerformanceSeries(client);
    const totalReturnPct = performanceSeries[performanceSeries.length - 1].portfolio - 100;
    const benchmarkReturnPct = performanceSeries[performanceSeries.length - 1].benchmark - 100;
    const equityPct = allocation.EQUITY + allocation.ETF;
    const target =
      MANDATE_EQUITY_TARGETS[client.mandate as keyof typeof MANDATE_EQUITY_TARGETS] ?? 0.6;
    const equityDrift = (equityPct - target) * 100;
    return {
      client,
      holdings,
      totalMv,
      dayPnl,
      dayPnlPct,
      allocation,
      performanceSeries,
      totalReturnPct,
      benchmarkReturnPct,
      equityDrift,
    };
  }

  private seedPerformanceSeries(client: Client) {
    const rng = new SeededRng(client.baselineReturnPct * 1000 + client.id.charCodeAt(2));
    const series = [];
    let portfolio = 100;
    let benchmark = 100;
    const endP = 100 + client.baselineReturnPct;
    const endB = 100 + client.baselineReturnPct - (1.5 + rng.next() * 2);
    const stepP = (endP - 100) / PERF_POINTS;
    const stepB = (endB - 100) / PERF_POINTS;
    const vol = client.risk === 'HIGH' ? 1.2 : client.risk === 'MED' ? 0.8 : 0.5;
    for (let f = 0; f < PERF_POINTS; f++) {
      portfolio += stepP + rng.norm() * vol;
      benchmark += stepB + rng.norm() * vol * 0.85;
      series.push({ t: f, portfolio, benchmark });
    }
    return series;
  }

  start(): void {
    if (this.interval === null) {
      this.startMs = Date.now();
      this.interval = setInterval(() => this.tick(), TICK_MS);
    }
  }

  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  subscribe(listener: (s: WealthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): WealthState {
    return this.state;
  }

  addActivity(item: ActivityItem): void {
    this.state = { ...this.state, activity: [item, ...this.state.activity].slice(0, 200) };
    this.emit();
  }

  private emit(): void {
    this.stateSignal.set(this.state);
    for (const l of this.listeners) l(this.state);
  }

  private tick(): void {
    const t = (Date.now() - this.startMs) % CYCLE_MS;
    if (t < this.state.t) {
      this.firedActivityIds.clear();
      this.firedNewsIds.clear();
    }
    const instruments: Record<string, LiveInstrument> = {};
    for (const [symbol, inst] of Object.entries(this.state.instruments)) {
      const def = INSTRUMENT_DEFS[symbol as keyof typeof INSTRUMENT_DEFS];
      if (!def || def.assetClass === 'CASH') {
        instruments[symbol] = inst;
        continue;
      }
      const delta = this.rng.norm() * inst.price * def.vol;
      const price = Math.max(inst.price * 0.01, inst.price + delta);
      const lastChange = price > inst.price ? 1 : price < inst.price ? -1 : 0;
      instruments[symbol] = { ...inst, price, lastChange: lastChange as -1 | 0 | 1 };
    }
    const clients: Record<string, ClientState> = {};
    for (const client of CLIENTS) {
      clients[client.id] = this.recomputeClientLightweight(
        this.state.clients[client.id],
        instruments,
      );
    }
    let activity = this.state.activity;
    for (const item of TIMED_ACTIVITY) {
      if (t >= item.time && !this.firedActivityIds.has(item.id)) {
        activity = [item as ActivityItem, ...activity].slice(0, 200);
        this.firedActivityIds.add(item.id);
      }
    }
    let news = this.state.news;
    for (const item of TIMED_NEWS) {
      if (t >= item.time && !this.firedNewsIds.has(item.id)) {
        news = [{ ...item, tickers: [...item.tickers] } as NewsItem, ...news].slice(0, 80);
        this.firedNewsIds.add(item.id);
      }
    }
    this.state = { t, instruments, clients, activity, news };
    this.emit();
  }

  private recomputeClientLightweight(
    cs: ClientState,
    instruments: Record<string, LiveInstrument>,
  ): ClientState {
    let totalMv = 0;
    let dayPnl = 0;
    const allocRaw: Record<string, number> = {
      EQUITY: 0,
      ETF: 0,
      FIXED_INC: 0,
      CASH: 0,
      ALT: 0,
    };
    for (const h of cs.holdings) {
      const inst = instruments[h.symbol];
      if (!inst) continue;
      const mv = h.qty * inst.price;
      totalMv += mv;
      dayPnl += h.qty * (inst.price - inst.startPrice);
      allocRaw[inst.assetClass] += mv;
    }
    const dayPnlPct = totalMv > 0 ? (dayPnl / (totalMv - dayPnl)) * 100 : 0;
    const allocation = {
      EQUITY: totalMv > 0 ? allocRaw['EQUITY'] / totalMv : 0,
      ETF: totalMv > 0 ? allocRaw['ETF'] / totalMv : 0,
      FIXED_INC: totalMv > 0 ? allocRaw['FIXED_INC'] / totalMv : 0,
      CASH: totalMv > 0 ? allocRaw['CASH'] / totalMv : 0,
      ALT: totalMv > 0 ? allocRaw['ALT'] / totalMv : 0,
    };
    const equityPct = allocation.EQUITY + allocation.ETF;
    const target =
      MANDATE_EQUITY_TARGETS[cs.client.mandate as keyof typeof MANDATE_EQUITY_TARGETS] ?? 0.6;
    const equityDrift = (equityPct - target) * 100;
    return { ...cs, totalMv, dayPnl, dayPnlPct, allocation, equityDrift };
  }
}
