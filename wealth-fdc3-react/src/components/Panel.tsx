import { useEffect, useState, type ReactNode } from 'react';

interface PanelProps {
  title: string;
  right?: ReactNode;
  channelColor?: string;
  pulseKey?: number;
  scroll?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({
  title,
  right,
  channelColor,
  pulseKey,
  scroll = false,
  className = '',
  children,
}: PanelProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (pulseKey !== undefined && pulseKey > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2400);
      return () => clearTimeout(t);
    }
  }, [pulseKey]);

  return (
    <div className={`panel ${pulse ? 'pulse' : ''} ${className}`}>
      <div className="panel-chrome">
        <div className="flex items-center gap-2 min-w-0">
          {channelColor && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: channelColor }}
              title="Joined channel"
            />
          )}
          <span className="panel-header truncate">{title}</span>
        </div>
        {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
      </div>
      <div className={`panel-body ${scroll ? 'overflow-auto' : ''}`}>{children}</div>
    </div>
  );
}
