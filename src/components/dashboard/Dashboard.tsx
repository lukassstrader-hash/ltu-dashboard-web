import { useStore } from '../../store';
import KpiCards from './KpiCards';
import EquityCurve from './EquityCurve';
import TradeTable from './TradeTable';
import SymbolCharts from './SymbolCharts';
import { presetToRange } from '../../utils/format';
import type { DatePreset } from '../../types';
import { useScheduler } from '../../hooks/useScheduler';
import { useState } from 'react';

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: '7일',  value: '7d'  },
  { label: '30일', value: '30d' },
  { label: '90일', value: '90d' },
  { label: '전체', value: 'all' },
];

type SubTab = 'overview' | 'symbols';

export default function Dashboard() {
  const {
    kpi, trades, equityCurve, loading, syncLoading,
    dateRange, setDateRange, error, syncMessage,
    syncData, hasCredentials,
  } = useStore();

  const { status: schedStatus, secondsUntilNext } = useScheduler();
  const [subTab, setSubTab] = useState<SubTab>('overview');

  const range = dateRange.preset === 'custom'
    ? { from_ms: dateRange.from_ms, to_ms: dateRange.to_ms }
    : presetToRange(dateRange.preset);

  const handlePreset = (preset: DatePreset) => {
    const r = presetToRange(preset);
    setDateRange({ preset, from_ms: r.from_ms, to_ms: r.to_ms });
  };

  const fmtCountdown = (sec: number | null) => {
    if (sec === null) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="page-title">성과 대시보드</span>
          <div className="date-filter">
            <button className={`filter-btn ${subTab === 'overview' ? 'active' : ''}`} onClick={() => setSubTab('overview')}>개요</button>
            <button className={`filter-btn ${subTab === 'symbols' ? 'active' : ''}`} onClick={() => setSubTab('symbols')}>종목별</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="date-filter">
            {PRESETS.map(p => (
              <button key={p.value} className={`filter-btn ${dateRange.preset === p.value ? 'active' : ''}`} onClick={() => handlePreset(p.value)}>
                {p.label}
              </button>
            ))}
          </div>

          {schedStatus?.auto_sync && secondsUntilNext !== null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: secondsUntilNext < 30 ? 'var(--gold)' : 'var(--text-muted)' }}>
              ⟳ {fmtCountdown(secondsUntilNext)}
            </span>
          )}

          {hasCredentials && (
            <button className="btn btn-green" onClick={syncData} disabled={syncLoading}>
              {syncLoading ? <><span className="spin">⟳</span> 동기화 중...</> : '⟳ 동기화'}
            </button>
          )}

          {!hasCredentials && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              ⚠ API 키를 설정해주세요
            </span>
          )}
        </div>
      </div>

      {error    && <div className="alert alert-error"   style={{ marginBottom: 16 }}>⚠ {error}</div>}
      {syncMessage && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ {syncMessage}</div>}

      <KpiCards kpi={kpi} loading={loading} />

      {subTab === 'overview' && (
        <>
          <EquityCurve data={equityCurve} loading={loading} />
          <TradeTable trades={trades} loading={loading} fromMs={range.from_ms ?? undefined} toMs={range.to_ms ?? undefined} />
        </>
      )}

      {subTab === 'symbols' && <SymbolCharts trades={trades} />}
    </div>
  );
}
