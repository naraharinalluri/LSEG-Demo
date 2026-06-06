import { FDC3_CHANNELS } from '../data/wealth-data';

interface ChannelPickerProps {
  currentChannelId: string;
  onChange: (id: string) => void;
}

export function ChannelPicker({ currentChannelId, onChange }: ChannelPickerProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-halo-border bg-halo-elevated/40">
      <span className="panel-header pr-1 text-halo-dim">CHANNEL</span>
      {FDC3_CHANNELS.map((ch) => (
        <button
          key={ch.id}
          onClick={() => onChange(ch.id)}
          title={ch.displayMetadata.name}
          className={`w-3 h-3 rounded-full transition-all ${
            ch.id === currentChannelId ? 'scale-125 ring-1 ring-white/40' : 'opacity-60 hover:opacity-100'
          }`}
          style={{ background: ch.displayMetadata.color }}
        />
      ))}
    </div>
  );
}
