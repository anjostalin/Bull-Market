export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'TRADER' | 'VIEWER';
}

export interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  changePercent: number;
  market: 'IN' | 'US';
  currency: string;
  marketOpen: boolean;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderView {
  id: number;
  stockId: number;
  symbol: string;
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  direction: 'BUY' | 'SELL';
  quantity: number;
  limitPrice: number | null;
  stopPrice: number | null;
  executedPrice: number | null;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  paper: boolean;
  rejectReason: string | null;
  createdAt: string;
}

export interface Wallet {
  id: number;
  userId: number;
  balanceInr: number;
  balanceUsd: number;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL';
  amount: number;
  balanceAfter: number;
  currency: string;
  note: string;
  createdAt: string;
}

export interface HoldingView {
  stockId: number;
  symbol: string;
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  currency: string;
}

export interface AllocationSlice {
  symbol: string;
  value: number;
  percent: number;
}

export interface CurrencySummary {
  currency: string;
  totalInvested: number;
  totalCurrentValue: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  totalRealizedPnl: number;
  walletBalance: number;
  holdings: HoldingView[];
  allocation: AllocationSlice[];
}

export interface PortfolioSummary {
  sections: CurrencySummary[];
}

export interface SnapshotPoint {
  time: string;
  value: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface SignalView {
  stockId: number;
  symbol: string;
  currentPrice: number;
  sma7: number;
  sma14: number;
  rsi14: number;
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  riskScore: number;
  rationale: string;
}

export interface WatchlistItemView {
  id: number;
  stockId: number;
  symbol: string;
  companyName: string;
  currentPrice: number;
  changePercent: number;
}

export interface WatchlistView {
  id: number;
  name: string;
  items: WatchlistItemView[];
}

export interface AlertView {
  id: number;
  stockId: number;
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  threshold: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
