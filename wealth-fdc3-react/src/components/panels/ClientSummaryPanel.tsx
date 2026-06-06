import { CLIENTS, RISK_STYLES } from '../../data/wealth-data';
import { useContactContext, useFdc3Agent } from '../../fdc3/hooks';
import { formatAum, formatMoney, formatPct, formatReviewDate } from '../../utils/format';
import type { WealthState } from '../../types';
import { Panel } from '../Panel';

function SummaryField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xs text-halo-dim uppercase tracking-wider mb-1">{label}</div>
      {children}
    </div>
  );
}

export function ClientSummaryPanel({ state }: { state: WealthState }) {
  const { channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const cs = state.clients[client.id];
  if (!cs) return <Panel title="CLIENT SUMMARY" channelColor={channelColor}><div /></Panel>;

  const risk = RISK_STYLES[client.risk];
  const drift = cs.equityDrift;
  const driftColor = Math.abs(drift) > 3 ? (drift > 0 ? '#efaa50' : '#ff7383') : '#26d97f';
  const driftLabel =
    Math.abs(drift) < 0.1 ? 'In line with IPS' : `Equity ${drift >= 0 ? '+' : ''}${drift.toFixed(1)}% vs target`;

  return (
    <Panel title={`CLIENT SUMMARY · ${client.name}`} channelColor={channelColor}>
      <div
        className="px-3 py-2 grid gap-3"
        style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr' }}
      >
        <SummaryField label="Household">
          <div className="text-halo-text font-medium text-sm leading-snug">{client.name}</div>
          <div className="text-halo-muted text-2xs mt-0.5 leading-snug">{client.household}</div>
        </SummaryField>
        <SummaryField label="Total AUM">
          <div className="num text-halo-text font-semibold text-base">{formatAum(cs.totalMv)}</div>
          <div className={`text-2xs num mt-0.5 ${cs.dayPnl >= 0 ? 'text-halo-up' : 'text-halo-down'}`}>
            {cs.dayPnl >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(cs.dayPnl))} ({formatPct(cs.dayPnlPct)})
          </div>
        </SummaryField>
        <SummaryField label="Mandate · Risk">
          <div className="text-halo-text text-xs">{client.mandate}</div>
          <div className="mt-1">
            <span
              className="text-2xs font-bold tracking-wider rounded px-1.5 py-0.5"
              style={{ background: risk.bg, color: risk.color }}
            >
              {risk.label}
            </span>
          </div>
        </SummaryField>
        <SummaryField label="Drift vs IPS">
          <div className="text-xs" style={{ color: driftColor }}>
            {driftLabel}
          </div>
          <div className="text-2xs text-halo-dim mt-0.5">
            Target {Math.round((cs.allocation.EQUITY + cs.allocation.ETF - drift / 100) * 100)}% equity
          </div>
        </SummaryField>
        <SummaryField label="RM · Next Review">
          <div className="text-halo-text text-xs">{client.rm}</div>
          <div className="text-2xs text-halo-accent mt-0.5">Due {formatReviewDate(client.nextReview)}</div>
        </SummaryField>
      </div>
    </Panel>
  );
}
