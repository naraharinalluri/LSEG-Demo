import { useState } from 'react';
import { CLIENTS, RISK_STYLES } from '../../data/wealth-data';
import { useFdc3Agent } from '../../fdc3/hooks';
import { formatAum } from '../../utils/format';
import type { Client, ContextMenuItem, WealthState } from '../../types';
import { ContextMenu } from '../ContextMenu';
import { Panel } from '../Panel';

interface Props {
  state: WealthState;
  onScheduleCall: (client: Client) => void;
}

export function ClientBookPanel({ state, onScheduleCall }: Props) {
  const { agent, channelColor } = useFdc3Agent();
  const [menu, setMenu] = useState<{ x: number; y: number; client: Client } | null>(null);

  const broadcast = (client: Client) => {
    agent.broadcast({
      type: 'fdc3.contact',
      id: { FDS_ID: client.id, email: `${client.id.toLowerCase()}@wealth.example.com` },
      name: client.name,
    });
  };

  const activeId = menu?.client.id;

  const menuItems: ContextMenuItem[] = menu
    ? [
        {
          label: `Schedule Call · ${menu.client.name}`,
          onClick: () => {
            broadcast(menu.client);
            onScheduleCall(menu.client);
          },
        },
        { label: `Set as Active · ${menu.client.name}`, onClick: () => broadcast(menu.client) },
        { divider: true, label: '' },
        { label: 'Send Secure Message', disabled: true, hint: 'not implemented' },
        { label: 'Add to Call List', disabled: true, hint: 'not implemented' },
      ]
    : [];

  return (
    <>
      <Panel title="CLIENT BOOK" scroll channelColor={channelColor}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-halo-panel z-10">
            <tr className="text-halo-dim uppercase text-2xs tracking-wider">
              <th className="text-left font-medium px-2 py-2">Client</th>
              <th className="text-right font-medium px-1 py-2">AUM</th>
              <th className="text-center font-medium px-2 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((client) => {
              const cs = state.clients[client.id];
              const risk = RISK_STYLES[client.risk];
              const selected = activeId === client.id;
              return (
                <tr
                  key={client.id}
                  onClick={() => broadcast(client)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenu({ x: e.clientX, y: e.clientY, client });
                  }}
                  className={`cursor-pointer border-b border-halo-border/30 hover:bg-white/[0.03] ${
                    selected ? 'bg-halo-accent/10 border-l-2 border-l-halo-accent' : ''
                  }`}
                >
                  <td className="px-2 py-2">
                    <div className="text-halo-text font-medium leading-snug">{client.name}</div>
                    <div className="text-2xs text-halo-dim">{client.segment}</div>
                  </td>
                  <td className="text-right px-1 py-2 num text-halo-text">
                    {cs ? formatAum(cs.totalMv) : '—'}
                  </td>
                  <td className="text-center px-2 py-2">
                    <span
                      className="text-2xs font-bold tracking-wider rounded px-1 py-0.5"
                      style={{ background: risk.bg, color: risk.color }}
                    >
                      {client.risk}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-2 py-1 text-2xs text-halo-dim italic border-t border-halo-border/30">
          Right-click for actions
        </div>
      </Panel>
      {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}
    </>
  );
}
