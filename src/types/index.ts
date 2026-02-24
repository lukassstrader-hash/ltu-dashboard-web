export interface Trade {
  trade_id: string;
  inst_id: string;
  side: 'long' | 'short';
  open_ts_ms: number;
  close_ts_ms: number | null;
  avg_entry: number | null;
  avg_exit: number | null;
  qty: number;
  gross_pnl: number | null;
  fee: number;
  funding: number;
  net_pnl: number | null;
  hold_time_sec: number | null;
  status: 'open' | 'closed';
}

export interface Kpi {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_net_pnl: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
  avg_hold_time_sec: number;
  period_start_equity: number;
  return_pct: number;
}

export interface EquityPoint {
  ts_ms: number;
  equity_usdt: number;
  pnl_cum_usdt: number;
}

export interface SyncStatus {
  fills_cursor: string | null;
  bills_cursor: string | null;
  last_sync_ms: number | null;
  trade_count: number;
  last_sync_at: number | null;
  next_sync_at: number | null;
  sync_count: number;
  auto_sync_enabled: boolean;
  interval_secs: number;
}

export type DatePreset = '7d' | '30d' | '90d' | 'all' | 'custom';

export interface DateRange {
  preset: DatePreset;
  from_ms: number | null;
  to_ms: number | null;
}
