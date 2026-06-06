import { useEffect, type CSSProperties } from 'react';
import type { ContextMenuItem } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
    };
  }, [onClose]);

  const style: CSSProperties = {
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 200),
  };

  return (
    <div
      className="fixed z-[60] min-w-[200px] bg-halo-elevated border border-halo-border shadow-2xl py-1"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-halo-border" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
                onClose();
              }
            }}
            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 ${
              item.disabled
                ? 'text-halo-dim cursor-not-allowed'
                : 'text-halo-text hover:bg-white/[0.05] hover:text-halo-accent'
            }`}
          >
            <span>{item.label}</span>
            {item.hint && <span className="text-2xs text-halo-dim italic">{item.hint}</span>}
          </button>
        ),
      )}
    </div>
  );
}
