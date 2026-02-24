import { useState, useEffect, useCallback } from 'react';

export interface SchedulerSnapshot {
  auto_sync: boolean;
  interval_secs: number;
  last_sync_ms: number;
  next_sync_ms: number;
  sync_count: number;
}

const STORAGE_KEY = 'ltu_scheduler';

function loadScheduler(): SchedulerSnapshot {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) return JSON.parse(item);
  } catch {}
  return {
    auto_sync: false,
    interval_secs: 300,
    last_sync_ms: 0,
    next_sync_ms: Date.now() + 300000,
    sync_count: 0,
  };
}

function saveScheduler(s: SchedulerSnapshot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useScheduler() {
  const [status, setStatus] = useState<SchedulerSnapshot | null>(null);

  const fetch = useCallback(async () => {
    setStatus(loadScheduler());
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 5000);
    return () => clearInterval(id);
  }, [fetch]);

  const setAutoSync = async (enabled: boolean) => {
    const s = loadScheduler();
    s.auto_sync = enabled;
    saveScheduler(s);
    await fetch();
  };

  const setInterval_ = async (seconds: number) => {
    const s = loadScheduler();
    s.interval_secs = seconds;
    saveScheduler(s);
    await fetch();
  };

  const secondsUntilNext = status
    ? Math.max(0, Math.round((status.next_sync_ms - Date.now()) / 1000))
    : null;

  return { status, setAutoSync, setInterval: setInterval_, secondsUntilNext, refresh: fetch };
}
