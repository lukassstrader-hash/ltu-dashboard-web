import { useState } from 'react';
import type { Trade } from '../../types';
import { fmtDateTime, fmtPrice, fmtHoldTime, fmtPnl } from '../../utils/format';
import * as api from '../../utils/tauri';
import { useStore } from '../../store';

interface Props {
  trades: Trade[];
  loading: boolean;
  fromMs?: number;
  toMs?: number;
}

const LIMIT_OPTIONS = [20, 50, 100] as const;

export default function TradeTable({ trades, loading, fromMs, toMs }: Props) {
  useStore();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'done' | 'error'>('idle');
  const [copyLimit, setCopyLimit] = useState<number>(50);

  const handleCopy = async () => {
    setCopyStatus('copying');
    try {
      const text = await api.copyTradesMarkdown(fromMs, toMs, copyLimit);
      await navigator.clipboard.writeText(text);
      setCopyStatus('done');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  const copyLabel = {
    idle:    '📋 ChatGPT에 복사',
    copying: '⏳ 생성 중...',
    done:    '✅ 복사 완료!',
    error:   '❌ 실패',
  }[copyStatus];

  return (
    <div className="trade-panel">
      <div className="panel-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="panel-title">매매 내역</span>
          <span className="badge badge-cyan">{trades.length}건</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>복사 건수</span>
            {LIMIT_OPTIONS.map(lim => (
              <button key={lim} className={`filter-btn ${copyLimit === lim ? 'active' : ''}`} onClick={() => setCopyLimit(lim)}>
                {lim}
              </button>
            ))}
          </div>
          <button className="btn btn-copy" onClick={handleCopy} disabled={copyStatus === 'copying' || trades.length === 0}>
            {copyLabel}
          </button>
        </div>
      </div>

      <div className="trade-table-wrapper scrollbar-thin">
        {loading ? (
          <div className="loading-overlay">매매 내역 불러오는 중...</div>
        ) : trades.length === 0 ? (
          <div className="loading-overlay">선택 기간에 종료된 거래가 없습니다</div>
        ) : (
          <table className="trade-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>종목</th>
                <th>방향</th>
                <th>진입 (KST)</th>
                <th>청산 (KST)</th>
                <th>진입가</th>
                <th>청산가</th>
                <th>수량</th>
                <th>총손익</th>
                <th>수수료</th>
                <th>순손익</th>
                <th>보유시간</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => {
                const netPos = (t.net_pnl ?? 0) >= 0;
                return (
                  <tr key={t.trade_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.inst_id}</td>
                    <td className={t.side === 'long' ? 'side-long' : 'side-short'}>
                      {t.side === 'long' ? '▲ 롱' : '▼ 숏'}
                    </td>
                    <td>{fmtDateTime(t.open_ts_ms)}</td>
                    <td>{fmtDateTime(t.close_ts_ms)}</td>
                    <td>{fmtPrice(t.avg_entry)}</td>
                    <td>{fmtPrice(t.avg_exit)}</td>
                    <td>{t.qty.toFixed(4)}</td>
                    <td className={t.gross_pnl != null ? (t.gross_pnl >= 0 ? 'pnl-pos' : 'pnl-neg') : ''}>
                      {fmtPnl(t.gross_pnl)}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.fee.toFixed(2)}</td>
                    <td className={netPos ? 'pnl-pos' : 'pnl-neg'} style={{ fontWeight: 600 }}>
                      {fmtPnl(t.net_pnl)}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmtHoldTime(t.hold_time_sec)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
