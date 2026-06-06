export function formatMoney(e: number): string {
  if (e < 0) {
    return `-$${Math.abs(e).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${e.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatAum(e: number): string {
  const t = Math.abs(e);
  const n = e < 0 ? '-' : '';
  if (t >= 1e9) return `${n}$${(t / 1e9).toFixed(1)}B`;
  if (t >= 1e6) return `${n}$${(t / 1e6).toFixed(t >= 1e7 ? 0 : 1)}M`;
  if (t >= 1e3) return `${n}$${(t / 1e3).toFixed(0)}K`;
  return `${n}$${t.toFixed(0)}`;
}

export function formatPct(e: number, digits = 2): string {
  return `${e >= 0 ? '+' : ''}${e.toFixed(digits)}%`;
}

export function formatReviewDate(e: string): string {
  return new Date(e).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(e: number): string {
  const t = Math.abs(e);
  if (e < 0) {
    if (t < 6 * 3600 * 1000) {
      const i = 32400 + Math.floor(e / 1000);
      const a = Math.floor(i / 3600) % 24;
      const o = Math.floor(i / 60) % 60;
      return `${String(a).padStart(2, '0')}:${String(o).padStart(2, '0')}`;
    }
    if (t < 24 * 3600 * 1000) return 'Today';
    const n = Math.floor(t / (86400 * 1000));
    if (n === 1) return 'Yesterday';
    if (n < 7) return `${n}d ago`;
    if (n < 30) return `${Math.floor(n / 7)}w ago`;
    if (n < 365) return `${Math.floor(n / 30)}mo ago`;
    return `${Math.floor(n / 365)}y ago`;
  }
  return 'now';
}
