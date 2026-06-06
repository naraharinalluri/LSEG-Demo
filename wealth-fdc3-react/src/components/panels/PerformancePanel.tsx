import { ALLOC_COLORS, ALLOC_LABELS, CLIENTS } from '../../data/wealth-data';
import { useContactContext, useFdc3Agent } from '../../fdc3/hooks';
import { formatPct } from '../../utils/format';
import type { AssetClass, WealthState } from '../../types';
import { AllocationDonut } from '../AllocationDonut';
import { Panel } from '../Panel';
import { PerformanceChart } from '../PerformanceChart';

export function PerformancePanel({ state }: { state: WealthState }) {
  const { channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const cs = state.clients[client.id];
  if (!cs) return <Panel title="PERFORMANCE · ALLOCATION" channelColor={channelColor}><div /></Panel>;

  const allocEntries = (Object.keys(cs.allocation) as AssetClass[])
    .map((key) => ({ key, value: cs.allocation[key] }))
    .filter((e) => e.value > 0.001);

  return (
    <Panel title={`PERFORMANCE · ALLOCATION · ${client.name}`} channelColor={channelColor}>
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col" style={{ flex: '1.5 1 0', minWidth: 0 }}>
          <div className="flex items-baseline justify-between px-3 pt-2 pb-1 border-b border-halo-border/30">
            <div className="text-2xs text-halo-dim uppercase tracking-wider">12-month performance</div>
            <div className="text-2xs num text-halo-muted">
              {formatPct(cs.totalReturnPct, 1)} vs {formatPct(cs.benchmarkReturnPct, 1)} bench
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-1">
              <PerformanceChart data={cs.performanceSeries} />
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-halo-border/40" style={{ flex: '1 1 0', minWidth: 0 }}>
          <div className="text-2xs text-halo-dim uppercase tracking-wider px-3 pt-2 pb-1 border-b border-halo-border/30">
            Allocation
          </div>
          <div className="flex flex-1 items-center gap-3 px-3 py-2 min-h-0">
            <AllocationDonut entries={allocEntries} />
            <div className="flex flex-col gap-1 min-w-0">
              {allocEntries.map((e) => (
                <div key={e.key} className="flex items-center gap-2 text-2xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ALLOC_COLORS[e.key] }} />
                  <span className="text-halo-muted truncate">{ALLOC_LABELS[e.key]}</span>
                  <span className="num text-halo-text ml-auto">{(e.value * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
