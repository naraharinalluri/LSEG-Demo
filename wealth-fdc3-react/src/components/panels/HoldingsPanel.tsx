import { useMemo, useState } from 'react';
import { CLIENTS, INSTRUMENT_DEFS } from '../../data/wealth-data';
import { useContactContext, useFdc3Agent, useInstrumentContext } from '../../fdc3/hooks';
import { formatMoney, formatPct } from '../../utils/format';
import type { ContextMenuItem, WealthState } from '../../types';
import { ContextMenu } from '../ContextMenu';
import { Panel } from '../Panel';

type SortKey = 'symbol' | 'weight' | 'dayChg' | 'unrPnl';

export function HoldingsPanel({ state }: { state: WealthState }) {
  const { agent, channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const instrument = useInstrumentContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const cs = state.clients[client.id];
  const selectedTicker = instrument?.id.ticker;
  const [sortKey, setSortKey] = useState<SortKey>('weight');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [menu, setMenu] = useState<{ x: number; y: number; symbol: string; name: string } | null>(
    null,
  );

  const rows = useMemo(() => {
    if (!cs) return [];
    return cs.holdings.map((h) => {
      const inst = state.instruments[h.symbol];
      const def = INSTRUMENT_DEFS[h.symbol as keyof typeof INSTRUMENT_DEFS];
      const price = inst?.price ?? 0;
      const mv = h.qty * price;
      const weight = cs.totalMv > 0 ? (mv / cs.totalMv) * 100 : 0;
      const dayChg = inst ? ((inst.price - inst.startPrice) / inst.startPrice) * 100 : 0;
      const unrPnl = inst && def ? h.qty * (inst.price - inst.costBasis) : 0;
      return {
        symbol: h.symbol,
        name: inst?.name ?? h.symbol,
        assetClass: inst?.assetClass ?? 'CASH',
        qty: h.qty,
        price,
        mv,
        weight,
        dayChg,
        unrPnl,
      };
    });
  }, [cs, state.instruments]);

  const sorted = useMemo(() => {
    const mul = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      let d = 0;
      if (sortKey === 'symbol') d = a.symbol.localeCompare(b.symbol);
      else if (sortKey === 'weight') d = a.weight - b.weight;
      else if (sortKey === 'dayChg') d = a.dayChg - b.dayChg;
      else d = a.unrPnl - b.unrPnl;
      return d * mul;
    });
  }, [rows, sortKey, sortDir]);

  const broadcastInstrument = (symbol: string, name: string) => {
    agent.broadcast({ type: 'fdc3.instrument', id: { ticker: symbol }, name });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'symbol' ? 'asc' : 'desc');
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (
      <span className="text-halo-accent ml-0.5">{sortDir === 'asc' ? '▲' : '▼'}</span>
    ) : null;

  const menuItems: ContextMenuItem[] = menu
    ? [
        {
          label: `View Quote & Research · ${menu.symbol}`,
          onClick: () => {
            broadcastInstrument(menu.symbol, menu.name);
            agent
              .raiseIntent('ViewQuote', {
                type: 'fdc3.instrument',
                id: { ticker: menu.symbol },
                name: menu.name,
              })
              .catch(() => {});
          },
        },
        { divider: true, label: '' },
        { label: 'Trade', disabled: true, hint: 'not implemented' },
        { label: 'Set Alert', disabled: true, hint: 'not implemented' },
        { label: 'View Tax Lots', disabled: true, hint: 'not implemented' },
      ]
    : [];

  if (!cs) return <Panel title="PORTFOLIO HOLDINGS" scroll><div /></Panel>;

  return (
    <>
      <Panel
        title={`PORTFOLIO HOLDINGS · ${client.name}`}
        channelColor={channelColor}
        scroll
        right={
          <span className="text-2xs text-halo-muted">
            {cs.holdings.length} positions
            <span className="text-halo-dim ml-1.5 italic">· Right-click for actions</span>
          </span>
        }
      >
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-halo-panel z-10">
            <tr className="text-halo-dim uppercase text-2xs tracking-wider">
              <th className="text-left font-medium px-2 py-1.5 cursor-pointer" onClick={() => toggleSort('symbol')}>
                Symbol{sortIndicator('symbol')}
              </th>
              <th className="text-left font-medium px-1 py-1.5">Name</th>
              <th className="text-left font-medium px-1 py-1.5">Class</th>
              <th className="text-right font-medium px-1 py-1.5">Qty</th>
              <th className="text-right font-medium px-1 py-1.5">Price</th>
              <th className="text-right font-medium px-1 py-1.5">Mkt Value</th>
              <th className="text-right font-medium px-1 py-1.5 cursor-pointer" onClick={() => toggleSort('weight')}>
                Wgt %{sortIndicator('weight')}
              </th>
              <th className="text-right font-medium px-1 py-1.5 cursor-pointer" onClick={() => toggleSort('dayChg')}>
                Day Chg{sortIndicator('dayChg')}
              </th>
              <th className="text-right font-medium px-2 py-1.5 cursor-pointer" onClick={() => toggleSort('unrPnl')}>
                Unr P&L{sortIndicator('unrPnl')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const flash =
                state.instruments[row.symbol]?.lastChange === 1
                  ? 'flash-up'
                  : state.instruments[row.symbol]?.lastChange === -1
                    ? 'flash-down'
                    : '';
              const highlighted = selectedTicker === row.symbol;
              return (
                <tr
                  key={row.symbol}
                  onClick={() => broadcastInstrument(row.symbol, row.name)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenu({ x: e.clientX, y: e.clientY, symbol: row.symbol, name: row.name });
                  }}
                  className={`cursor-pointer border-b border-halo-border/30 hover:bg-white/[0.03] ${flash} ${
                    highlighted ? 'bg-halo-accent/10 border-l-2 border-l-halo-accent' : ''
                  }`}
                >
                  <td className="px-2 py-1 num font-medium text-halo-text">{row.symbol}</td>
                  <td className="px-1 py-1 text-halo-muted truncate max-w-[120px]">{row.name}</td>
                  <td className="px-1 py-1 text-2xs text-halo-dim">{row.assetClass}</td>
                  <td className="px-1 py-1 text-right num">{row.qty.toLocaleString()}</td>
                  <td className="px-1 py-1 text-right num">{row.price.toFixed(2)}</td>
                  <td className="px-1 py-1 text-right num">{formatMoney(row.mv)}</td>
                  <td className="px-1 py-1 text-right num">{row.weight.toFixed(1)}%</td>
                  <td
                    className={`px-1 py-1 text-right num ${row.dayChg >= 0 ? 'text-halo-up' : 'text-halo-down'}`}
                  >
                    {formatPct(row.dayChg, 1)}
                  </td>
                  <td
                    className={`px-2 py-1 text-right num ${row.unrPnl >= 0 ? 'text-halo-up' : 'text-halo-down'}`}
                  >
                    {formatMoney(row.unrPnl)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </>
  );
}
