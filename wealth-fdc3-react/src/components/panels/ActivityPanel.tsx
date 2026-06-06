import { useState } from 'react';
import { ACTIVITY_TYPE_COLORS } from '../../data/constants';
import { CLIENTS } from '../../data/wealth-data';
import { getFdc3Agent } from '../../fdc3/agent';
import { useContactContext, useFdc3Agent } from '../../fdc3/hooks';
import { formatRelativeTime } from '../../utils/format';
import type { ActivityItem, Client, ContextMenuItem, WealthState } from '../../types';
import { ContextMenu } from '../ContextMenu';
import { Panel } from '../Panel';

interface Props {
  state: WealthState;
  onScheduleCall: (client: Client) => void;
}

export function ActivityPanel({ state, onScheduleCall }: Props) {
  const { channelColor } = useFdc3Agent();
  const contact = useContactContext();
  const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const [menu, setMenu] = useState<{ x: number; y: number; item: ActivityItem } | null>(null);

  const items = state.activity
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => b.time - a.time);

  const scheduleFromActivity = () => {
    if (!menu) return;
    const c = CLIENTS.find((x) => x.id === menu.item.clientId);
    if (!c) return;
    getFdc3Agent().broadcast({
      type: 'fdc3.contact',
      id: { FDS_ID: c.id },
      name: c.name,
    });
    onScheduleCall(c);
  };

  const menuItems: ContextMenuItem[] = menu
    ? [{ label: 'Schedule Call', onClick: scheduleFromActivity }]
    : [];

  return (
    <>
      <Panel
        title={`ACTIVITY · ${client.name}`}
        channelColor={channelColor}
        scroll
        right={<span className="text-2xs text-halo-dim italic">Right-click to schedule call</span>}
      >
        {items.length === 0 ? (
          <div className="p-3 text-2xs text-halo-dim italic">No activity for this client.</div>
        ) : (
          <ul className="divide-y divide-halo-border/30">
            {items.map((item) => (
              <li
                key={item.id}
                className="px-2.5 py-1.5 hover:bg-white/[0.03] cursor-context-menu"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.clientX, y: e.clientY, item });
                }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xs font-bold tracking-wider"
                    style={{ color: ACTIVITY_TYPE_COLORS[item.type] }}
                  >
                    {item.type}
                  </span>
                  <span className="text-2xs text-halo-dim num ml-auto">{formatRelativeTime(item.time)}</span>
                </div>
                <div className="text-xs text-halo-text mt-0.5 leading-snug">{item.headline}</div>
                {item.detail && (
                  <div className="text-2xs text-halo-muted leading-snug mt-0.5">{item.detail}</div>
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
