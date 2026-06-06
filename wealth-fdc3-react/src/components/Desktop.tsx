import { useEffect, useState } from 'react';
import { getFdc3Agent } from '../fdc3/agent';
import type { Client, WealthState } from '../types';
import type { WealthDriver } from '../driver/wealth-driver';
import { ScheduleCallModal } from './ScheduleCallModal';
import { ActivityPanel } from './panels/ActivityPanel';
import { ClientBookPanel } from './panels/ClientBookPanel';
import { ClientSummaryPanel } from './panels/ClientSummaryPanel';
import { HoldingsPanel } from './panels/HoldingsPanel';
import { NewsPanel } from './panels/NewsPanel';
import { PerformancePanel } from './panels/PerformancePanel';
import { ResearchPanel } from './panels/ResearchPanel';

interface ModalState {
  id: string;
  client: Client;
  x: number;
  y: number;
}

interface Props {
  state: WealthState;
  driver: WealthDriver;
}

export function Desktop({ state, driver }: Props) {
  const [modals, setModals] = useState<ModalState[]>([]);

  useEffect(() => {
    const agent = getFdc3Agent();
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    agent
      .addIntentListener('StartCall', async (ctx) => {
        const id = ctx.id as { FDS_ID?: string };
        const clientId = id.FDS_ID;
        if (!clientId) return;
        const cs = state.clients[clientId];
        const client = cs?.client;
        if (!client) return;
        setModals((m) => [
          ...m,
          {
            id: `SC${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            client,
            x: Math.max(120, window.innerWidth / 2 - 180) + (m.length % 5) * 28,
            y: Math.max(80, window.innerHeight / 2 - 220) + (m.length % 5) * 28,
          },
        ]);
      })
      .then((s) => {
        if (cancelled) s.unsubscribe();
        else sub = s;
      });
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, [state.clients]);

  const raiseScheduleCall = (client: Client) => {
    getFdc3Agent()
      .raiseIntent('StartCall', {
        type: 'fdc3.contact',
        id: { FDS_ID: client.id },
        name: client.name,
      })
      .catch((e) => console.warn(e));
  };

  const onModalSubmit = (clientId: string, headline: string) => {
    driver.addActivity({
      id: `live-${Date.now()}`,
      clientId,
      type: 'CALL',
      time: 0,
      headline,
      detail: 'Scheduled via desk',
    });
  };

  return (
    <div
      className="grid grid-cols-12 grid-rows-12 gap-1.5 p-1.5 h-full min-h-0"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="col-start-1 col-span-3 row-start-1 row-span-12 min-h-0">
        <ClientBookPanel state={state} onScheduleCall={raiseScheduleCall} />
      </div>
      <div className="col-start-4 col-span-6 row-start-1 row-span-2 min-h-0">
        <ClientSummaryPanel state={state} />
      </div>
      <div className="col-start-4 col-span-6 row-start-3 row-span-6 min-h-0">
        <HoldingsPanel state={state} />
      </div>
      <div className="col-start-4 col-span-6 row-start-9 row-span-4 min-h-0">
        <PerformancePanel state={state} />
      </div>
      <div className="col-start-10 col-span-3 row-start-1 row-span-4 min-h-0">
        <ActivityPanel state={state} onScheduleCall={raiseScheduleCall} />
      </div>
      <div className="col-start-10 col-span-3 row-start-5 row-span-4 min-h-0">
        <ResearchPanel state={state} />
      </div>
      <div className="col-start-10 col-span-3 row-start-9 row-span-4 min-h-0">
        <NewsPanel state={state} />
      </div>
      {modals.map((m) => (
        <ScheduleCallModal
          key={m.id}
          id={m.id}
          client={m.client}
          initialX={m.x}
          initialY={m.y}
          onClose={(id) => setModals((ms) => ms.filter((x) => x.id !== id))}
          onSubmit={onModalSubmit}
        />
      ))}
    </div>
  );
}
