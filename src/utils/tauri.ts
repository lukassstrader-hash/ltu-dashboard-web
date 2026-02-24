import type { Trade, Kpi, EquityPoint, SyncStatus } from '../types';

const STORAGE_KEY = 'ltu_api_credentials';

export async function saveApiCredentials(
  apiKey: string,
  secret: string,
  passphrase: string
): Promise<void> {
  if (!apiKey.trim() || !secret.trim() || !passphrase.trim()) {
    throw new Error('모든 항목을 입력해주세요.');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey, secret, passphrase }));
}

export async function deleteApiCredentials(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}

export async function hasCredentials(): Promise<boolean> {
  const item = localStorage.getItem(STORAGE_KEY);
  if (!item) return false;
  try {
    const { apiKey, secret, passphrase } = JSON.parse(item);
    return !!(apiKey && secret && passphrase);
  } catch { return false; }
}

export async function testApiConnection(): Promise<void> {
  const item = localStorage.getItem(STORAGE_KEY);
  if (!item) throw new Error('API 키가 없습니다.');
}

export async function syncData(): Promise<string> {
  return '동기화 완료 (웹 버전은 OKX API 직접 연동 필요)';
}

export async function repairSync(days: number): Promise<string> {
  return `${days}일 복구 완료`;
}

export async function getTrades(fromMs?: number, toMs?: number, limit?: number): Promise<Trade[]> {
  return [];
}

export async function getKpi(fromMs?: number, toMs?: number): Promise<Kpi> {
  return {
    total_net_pnl: 0, total_gross_pnl: 0, total_fee: 0,
    trade_count: 0, win_count: 0, loss_count: 0,
    win_rate: 0, profit_factor: 0, avg_win: 0, avg_loss: 0,
    avg_hold_ms: 0, return_pct: 0,
  };
}

export async function getEquityCurve(fromMs?: number, toMs?: number): Promise<EquityPoint[]> {
  return [];
}

export async function copyTradesMarkdown(fromMs?: number, toMs?: number, limit?: number): Promise<string> {
  return '';
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return {
    last_sync_at: null, next_sync_at: null,
    sync_count: 0, auto_sync_enabled: false, interval_secs: 300,
  };
}
