import { useState } from 'react';
import { CALL_TYPES } from '../data/constants';
import type { Client } from '../types';

interface ScheduleCallModalProps {
  id: string;
  client: Client;
  initialX: number;
  initialY: number;
  onClose: (id: string) => void;
  onSubmit: (clientId: string, headline: string) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xs text-halo-dim uppercase tracking-wider mb-0.5">{label}</div>
      {children}
    </div>
  );
}

export function ScheduleCallModal({
  id,
  client,
  initialX,
  initialY,
  onClose,
  onSubmit,
}: ScheduleCallModalProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [drag, setDrag] = useState<{ ox: number; oy: number } | null>(null);
  const [callType, setCallType] = useState('Q Review');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [attendees, setAttendees] = useState(client.rm);
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState('');

  const onMouseDown = (e: React.MouseEvent) => {
    setDrag({ ox: e.clientX - pos.x, oy: e.clientY - pos.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (drag) setPos({ x: e.clientX - drag.ox, y: e.clientY - drag.oy });
  };

  const submit = () => {
    const headline = `Scheduled call · ${date || 'TBD'} ${time} · ${callType}`;
    onSubmit(client.id, headline);
    setDone('SCHEDULED');
    setTimeout(() => onClose(id), 1200);
  };

  return (
    <div
      className="fixed z-50 w-[360px] bg-halo-panel border-2 border-ch-blue shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDrag(null)}
      onMouseLeave={() => setDrag(null)}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-halo-border cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold tracking-wider text-ch-blue">SCHEDULE CALL</span>
          <span className="text-sm font-medium text-halo-text">{client.name}</span>
        </div>
        <button
          onClick={() => onClose(id)}
          className="w-7 h-7 flex items-center justify-center text-halo-muted hover:text-halo-text hover:bg-white/[0.08] rounded"
        >
          ✕
        </button>
      </div>
      <div className="p-3 space-y-3">
        <Field label="CLIENT">
          <div className="px-2 py-1 bg-halo-bg border border-halo-border text-halo-text text-sm">
            {client.name}
          </div>
        </Field>
        <Field label="CALL TYPE">
          <div className="grid grid-cols-4 gap-1">
            {CALL_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setCallType(ct.value)}
                className={`py-1 text-2xs font-semibold tracking-wider transition-colors ${
                  callType === ct.value
                    ? 'bg-ch-blue/20 text-ch-blue border border-ch-blue'
                    : 'border border-halo-border text-halo-muted hover:text-halo-text'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="DATE">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-halo-bg border border-halo-border px-2 py-1 text-sm focus:outline-none focus:border-ch-blue"
            />
          </Field>
          <Field label="TIME">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-halo-bg border border-halo-border px-2 py-1 text-sm focus:outline-none focus:border-ch-blue"
            />
          </Field>
        </div>
        <Field label="ATTENDEES">
          <input
            type="text"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            className="w-full bg-halo-bg border border-halo-border px-2 py-1 text-sm focus:outline-none focus:border-ch-blue"
          />
        </Field>
        <Field label="AGENDA NOTES">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Q2 portfolio review, tax-loss harvesting opportunities"
            rows={3}
            className="w-full bg-halo-bg border border-halo-border px-2 py-1 text-sm focus:outline-none focus:border-ch-blue resize-none"
          />
        </Field>
        <button
          onClick={submit}
          disabled={!!done}
          className={`w-full py-2 text-xs font-bold tracking-wider transition-all ${
            done ? 'bg-ch-blue/20 text-ch-blue' : 'bg-ch-blue text-halo-bg hover:opacity-90'
          }`}
        >
          {done ? `✓ SCHEDULED · ${done}` : 'SCHEDULE CALL'}
        </button>
      </div>
    </div>
  );
}
