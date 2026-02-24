import { invoke as tauriInvoke } from '@tauri-apps/api/core';
import type { Trade, Kpi, EquityPoint, SyncStatus } from '../types';

// Type-safe wrappers around Tauri commands.
// The frontend NEVER handles API keys/secrets/signatures.

export async function saveApiCredentials(
  apiKey: string,
  secret: string,
  passphrase: string
): Promise<void> {
  return tauriInvoke('save_api_credentials', { input: { api_key: apiKey, secret, passphrase } });
}

export async function deleteApiCredentials(): Promise<void> {
  return tauriInvoke('delete_api_credentials');
}

export async function hasCredentials(): Promise<boolean> {
  return tauriInvoke('has_credentials');
}

export async function testApiConnection(): Promise<void> {
  return tauriInvoke('test_api_connection');
}

export async function syncData(): Promise<string> {
  return tauriInvoke('sync_data');
}

export async function repairSync(days: number): Promise<string> {
  return tauriInvoke('repair_sync', { days });
}

export async function getTrades(fromMs?: number, toMs?: number, limit?: number): Promise<Trade[]> {
  return tauriInvoke('get_trades', {
    input: { from_ms: fromMs ?? null, to_ms: toMs ?? null, limit: limit ?? null },
  });
}

export async function getKpi(fromMs?: number, toMs?: number): Promise<Kpi> {
  return tauriInvoke('get_kpi', {
    input: { from_ms: fromMs ?? null, to_ms: toMs ?? null, limit: null },
  });
}

export async function getEquityCurve(fromMs?: number, toMs?: number): Promise<EquityPoint[]> {
  return tauriInvoke('get_equity_curve', {
    input: { from_ms: fromMs ?? null, to_ms: toMs ?? null, limit: null },
  });
}

export async function copyTradesMarkdown(fromMs?: number, toMs?: number, limit?: number): Promise<string> {
  return tauriInvoke('copy_trades_markdown', {
    input: { from_ms: fromMs ?? null, to_ms: toMs ?? null, limit: limit ?? null },
  });
}

export async function getSyncStatus(): Promise<SyncStatus> {
  return tauriInvoke('get_sync_status');
}
