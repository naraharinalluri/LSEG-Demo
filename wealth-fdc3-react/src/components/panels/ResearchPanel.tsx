import { useEffect, useMemo, useState } from 'react';
import { CLIENTS, RESEARCH_ITEMS } from '../../data/wealth-data';
import { getFdc3Agent } from '../../fdc3/agent';
import { useContactContext, useFdc3Agent, useInstrumentContext } from '../../fdc3/hooks';
import type { ContextMenuItem, WealthState } from '../../types';
import { ContextMenu } from '../ContextMenu';
import { Panel } from '../Panel';

export function ResearchPanel({ state }: { state: WealthState }) {
  const { channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const instrument = useInstrumentContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const cs = state.clients[client.id];
  const ticker = instrument?.id.ticker;
  const [pulseKey, setPulseKey] = useState(0);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    getFdc3Agent()
      .addIntentListener('ViewQuote', async () => {
        if (!cancelled) setPulseKey((k) => k + 1);
      })
      .then((s) => {
        if (cancelled) s.unsubscribe();
        else sub = s;
      });
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);

  const holdingSymbols = useMemo(() => {
    const s = new Set<string>();
    if (cs) for (const h of cs.holdings) s.add(h.symbol);
    return s;
  }, [cs]);

  const filtered = useMemo(() => {
    return RESEARCH_ITEMS.filter((r) => {
      if (r.tickers.length === 0) return true;
      if (ticker) return (r.tickers as readonly string[]).includes(ticker);
      return r.tickers.some((t) => holdingSymbols.has(t));
    });
  }, [holdingSymbols, ticker]);

  const menuItems: ContextMenuItem[] = [
    { label: 'Open PDF', disabled: true, hint: 'not implemented' },
    { label: 'Show Preview', disabled: true, hint: 'not implemented' },
    { divider: true, label: '' },
    { label: 'Email to Client', disabled: true, hint: 'not implemented' },
  ];

  const filterLabel = ticker ? `${ticker} · ${client.name} holdings` : `${client.name} holdings`;

  return (
    <>
      <Panel
        title="RESEARCH"
        channelColor={channelColor}
        scroll
        pulseKey={pulseKey}
        right={
          <span className="text-2xs text-halo-muted">
            {filtered.length}/{RESEARCH_ITEMS.length}
            <span className="text-halo-dim ml-1">· {filterLabel}</span>
          </span>
        }
      >
        {filtered.length === 0 ? (
          <div className="p-3 text-2xs text-halo-dim italic">No research for this filter.</div>
        ) : (
          <ul className="divide-y divide-halo-border/30">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="px-2.5 py-1.5 hover:bg-white/[0.03] cursor-context-menu"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY });
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-2xs font-bold tracking-wider text-halo-muted">LSEG</span>
                  {r.tag && (
                    <span className="text-2xs font-semibold px-1 py-0 rounded bg-halo-muted/20 text-halo-muted tracking-wider">
                      {r.tag}
                    </span>
                  )}
                  <span className="ml-auto text-2xs text-halo-dim num">{r.pages}p</span>
                </div>
                <div className="text-xs text-halo-text mt-0.5 leading-snug">{r.title}</div>
                {r.tickers.length > 0 && (
                  <div className="text-2xs text-halo-muted num mt-0.5">{r.tickers.join(' · ')}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </>
  );
}
