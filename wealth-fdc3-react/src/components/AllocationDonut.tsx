import { ALLOC_COLORS } from '../data/wealth-data';
import type { AssetClass } from '../types';

interface Entry {
  key: AssetClass;
  value: number;
}

export function AllocationDonut({ entries }: { entries: Entry[] }) {
  const r = 35;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={84} height={84} viewBox="0 0 84 84" style={{ flexShrink: 0 }}>
      <circle cx={42} cy={42} r={r} fill="none" stroke="#1c212c" strokeWidth={14} />
      {entries.map((e) => {
        const dash = e.value * circumference;
        const strokeDashoffset = -offset * circumference;
        offset += e.value;
        return (
          <circle
            key={e.key}
            cx={42}
            cy={42}
            r={r}
            fill="none"
            stroke={ALLOC_COLORS[e.key]}
            strokeWidth={14}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 42 42)"
          />
        );
      })}
    </svg>
  );
}
