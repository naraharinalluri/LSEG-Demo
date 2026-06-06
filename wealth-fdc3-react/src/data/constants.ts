export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  BUY: '#26d97f',
  SELL: '#ff4757',
  DIV: '#4a90d9',
  DEP: '#4a90d9',
  WD: '#efaa50',
  FEE: '#8b95a7',
  EMAIL: '#9b6dc7',
  CALL: '#efaa50',
  NOTE: '#8b95a7',
  REVIEW: '#fa6400',
};

export const TICK_MS = 400;
export const CYCLE_MS = 120000;
export const PERF_POINTS = 252;

export const CALL_TYPES = [
  { value: 'Q Review', label: 'Q Review' },
  { value: 'Onboarding', label: 'Onboarding' },
  { value: 'Tax Planning', label: 'Tax Planning' },
  { value: 'Ad-hoc', label: 'Ad-hoc' },
] as const;
