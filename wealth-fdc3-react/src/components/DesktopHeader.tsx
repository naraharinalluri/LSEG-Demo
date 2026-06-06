import { ChannelPicker } from './ChannelPicker';

interface DesktopHeaderProps {
  currentChannel: string;
  onChannelChange: (id: string) => void;
}

export function DesktopHeader({ currentChannel, onChannelChange }: DesktopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-halo-border bg-halo-panel/80 backdrop-blur flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-sm flex items-center justify-center font-bold text-halo-bg"
            style={{ background: '#fa6400' }}
          >
            W
          </div>
          <span className="text-sm font-semibold tracking-tight">Wealth Manager Desktop</span>
          <span className="text-2xs text-halo-dim uppercase tracking-wider hidden md:inline">
            Prototype · FDC3 2.2
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center text-2xs uppercase tracking-wider">
          <span className="text-halo-up">
            <span className="mr-1.5">●</span> Apps share context via FDC3
          </span>
        </div>
        <div className="inline-flex border border-halo-border rounded overflow-hidden">
          <span className="px-3 py-1 text-2xs font-semibold tracking-wider bg-halo-accent text-halo-bg">
            NEW · REACT + FDC3
          </span>
        </div>
        <ChannelPicker currentChannelId={currentChannel} onChange={onChannelChange} />
      </div>
    </header>
  );
}
