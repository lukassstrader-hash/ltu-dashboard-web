import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface SchedulerSnapshot {
  auto_sync: boolean;
  interval_secs: number;
  last_sync_ms: number;
  next_sync_ms: number;
  sync_count: number;
}

export function useScheduler() {
  const [status, setStatus] = useState<SchedulerSnapshot | null>(null);

  const fetch = useCallback(async () => {
    try {
      const s = await invoke<SchedulerSnapshot>('get_scheduler_status');
      setStatus(s);
    } catch { /* silently ignore if backend not ready */ }
  }, []);

  // Poll every 5 seconds to keep countdown fresh
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 5000);
    return () => clearInterval(id);
  }, [fetch]);

  const setAutoSync = async (enabled: boolean) => {
    await invoke('set_auto_sync', { enabled });
    await fetch();
  };

  const setInterval_ = async (seconds: number) => {
    await invoke('set_sync_interval', { seconds });
    await fetch();
  };

  // Compute seconds until next sync
  const secondsUntilNext = status
    ? Math.max(0, Math.round((status.next_sync_ms - Date.now()) / 1000))
    : null;

  return { status, setAutoSync, setInterval: setInterval_, secondsUntilNext, refresh: fetch };
}
