import { create } from 'zustand';
import type { Trade, Kpi, EquityPoint, SyncStatus, DateRange } from '../types';
import * as api from '../utils/tauri';
import { presetToRange } from '../utils/format';

type Page = 'dashboard' | 'settings';

interface AppState {
  page: Page;
  setPage: (p: Page) => void;

  hasCredentials: boolean;
  checkCredentials: () => Promise<void>;

  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;

  trades: Trade[];
  kpi: Kpi | null;
  equityCurve: EquityPoint[];
  syncStatus: SyncStatus | null;

  loading: boolean;
  syncLoading: boolean;
  error: string | null;
  syncMessage: string | null;

  loadDashboard: () => Promise<void>;
  syncData: () => Promise<void>;
  repairSync: (days: number) => Promise<void>;
  fetchSyncStatus: () => Promise<void>;
}

const DEFAULT_KPI: Kpi = {
  total_trades: 0,
  winning_trades: 0,
  losing_trades: 0,
  win_rate: 0,
  total_net_pnl: 0,
  avg_win: 0,
  avg_loss: 0,
  profit_factor: 0,
  avg_hold_time_sec: 0,
  period_start_equity: 0,
  return_pct: 0,
};

export const useStore = create<AppState>((set, get) => ({
  page: 'dashboard',
  setPage: (p) => set({ page: p }),

  hasCredentials: false,
  checkCredentials: async () => {
    const has = await api.hasCredentials().catch(() => false);
    set({ hasCredentials: has });
  },

  dateRange: { preset: '30d', from_ms: Date.now() - 30 * 86400000, to_ms: Date.now() },
  setDateRange: (r) => {
    set({ dateRange: r });
    get().loadDashboard();
  },

  trades: [],
  kpi: null,
  equityCurve: [],
  syncStatus: null,
  loading: false,
  syncLoading: false,
  error: null,
  syncMessage: null,

  loadDashboard: async () => {
    const { dateRange } = get();
    const range = dateRange.preset === 'custom'
      ? { from_ms: dateRange.from_ms, to_ms: dateRange.to_ms }
      : presetToRange(dateRange.preset);

    set({ loading: true, error: null });
    try {
      const [trades, kpi, curve] = await Promise.all([
        api.getTrades(range.from_ms ?? undefined, range.to_ms ?? undefined),
        api.getKpi(range.from_ms ?? undefined, range.to_ms ?? undefined),
        api.getEquityCurve(range.from_ms ?? undefined, range.to_ms ?? undefined),
      ]);
      set({ trades, kpi, equityCurve: curve });
    } catch (e: unknown) {
      set({ error: String(e), kpi: DEFAULT_KPI });
    } finally {
      set({ loading: false });
    }
  },

  fetchSyncStatus: async () => {
    const status = await api.getSyncStatus().catch(() => null);
    set({ syncStatus: status });
  },

  syncData: async () => {
    set({ syncLoading: true, syncMessage: null, error: null });
    try {
      const msg = await api.syncData();
      set({ syncMessage: msg });
      await get().loadDashboard();
      await get().fetchSyncStatus();
    } catch (e: unknown) {
      set({ error: String(e) });
    } finally {
      set({ syncLoading: false });
    }
  },

  repairSync: async (days: number) => {
    set({ syncLoading: true, syncMessage: null, error: null });
    try {
      const msg = await api.repairSync(days);
      set({ syncMessage: msg });
      await get().loadDashboard();
    } catch (e: unknown) {
      set({ error: String(e) });
    } finally {
      set({ syncLoading: false });
    }
  },
}));
