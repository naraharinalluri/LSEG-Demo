export type RiskLevel = 'HIGH' | 'MED' | 'LOW';
export type AssetClass = 'EQUITY' | 'ETF' | 'FIXED_INC' | 'CASH' | 'ALT';
export type ActivityType =
  | 'BUY'
  | 'SELL'
  | 'DIV'
  | 'DEP'
  | 'WD'
  | 'FEE'
  | 'EMAIL'
  | 'CALL'
  | 'NOTE'
  | 'REVIEW';

export interface Client {
  id: string;
  name: string;
  household: string;
  segment: string;
  risk: RiskLevel;
  mandate: string;
  rm: string;
  inceptionDate: string;
  nextReview: string;
  benchmark: string;
  baselineReturnPct: number;
}

export interface HoldingRow {
  symbol: string;
  qty: number;
}

export interface InstrumentDef {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  priceSeed: number;
  startPrice: number;
  vol: number;
  costFactor: number;
}

export interface LiveInstrument {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  startPrice: number;
  lastChange: -1 | 0 | 1;
  costBasis: number;
}

export interface PerformancePoint {
  t: number;
  portfolio: number;
  benchmark: number;
}

export interface ClientState {
  client: Client;
  holdings: HoldingRow[];
  totalMv: number;
  dayPnl: number;
  dayPnlPct: number;
  allocation: Record<AssetClass, number>;
  performanceSeries: PerformancePoint[];
  totalReturnPct: number;
  benchmarkReturnPct: number;
  equityDrift: number;
}

export interface ActivityItem {
  id: string;
  clientId: string;
  type: ActivityType;
  time: number;
  headline: string;
  detail?: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  tickers: string[];
  time: number;
  tag?: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  tickers: string[];
  pages: number;
  tag?: string;
}

export interface WealthState {
  t: number;
  instruments: Record<string, LiveInstrument>;
  clients: Record<string, ClientState>;
  activity: ActivityItem[];
  news: NewsItem[];
}

export interface Fdc3ContactContext {
  type: 'fdc3.contact';
  id: { FDS_ID: string; email?: string };
  name: string;
}

export interface Fdc3InstrumentContext {
  type: 'fdc3.instrument';
  id: { ticker: string };
  name?: string;
}

export type Fdc3Context = Fdc3ContactContext | Fdc3InstrumentContext;

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  hint?: string;
  divider?: boolean;
}
