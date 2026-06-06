import { useMemo } from 'react';
import { CLIENTS, NEWS_SOURCE_COLORS } from '../../data/wealth-data';
import { useContactContext, useFdc3Agent, useInstrumentContext } from '../../fdc3/hooks';
import { formatRelativeTime } from '../../utils/format';
import type { WealthState } from '../../types';
import { Panel } from '../Panel';

export function NewsPanel({ state }: { state: WealthState }) {
  const { channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const instrument = useInstrumentContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const cs = state.clients[client.id];
  const ticker = instrument?.id.ticker;

  const holdingSymbols = useMemo(() => {
    const s = new Set<string>();
    if (cs) for (const h of cs.holdings) s.add(h.symbol);
    return s;
  }, [cs]);

  const filtered = useMemo(() => {
    return state.news.filter((n) => {
      if (n.tickers.length === 0) return true;
      if (ticker) return n.tickers.includes(ticker);
      return n.tickers.some((t) => holdingSymbols.has(t));
    });
  }, [state.news, holdingSymbols, ticker]);

  const filterLabel = ticker ? `${ticker} · ${client.name}` : client.name;

  return (
    <Panel
      title="NEWS"
      channelColor={channelColor}
      scroll
      right={
        <span className="text-2xs text-halo-muted">
          {filtered.length}/{state.news.length}
          <span className="text-halo-dim ml-1">· {filterLabel}</span>
        </span>
      }
    >
      <ul className="divide-y divide-halo-border/30">
        {filtered.map((n) => (
          <li key={n.id} className="px-2.5 py-1.5 hover:bg-white/[0.03]">
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xs font-bold tracking-wider"
                style={{ color: NEWS_SOURCE_COLORS[n.source as keyof typeof NEWS_SOURCE_COLORS] ?? '#8b95a7' }}
              >
                {n.source}
              </span>
              {n.tag && (
                <span className="text-2xs font-semibold px-1 py-0 rounded bg-halo-muted/20 text-halo-muted tracking-wider">
                  {n.tag}
                </span>
              )}
              <span className="ml-auto text-2xs text-halo-dim num">
                {n.time >= 0 ? 'now' : formatRelativeTime(n.time)}
              </span>
            </div>
            <div className="text-xs text-halo-text mt-0.5 leading-snug">{n.headline}</div>
            {n.tickers.length > 0 && (
              <div className="text-2xs text-halo-muted num mt-0.5">{n.tickers.join(' · ')}</div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
