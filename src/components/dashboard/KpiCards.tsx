import type { Kpi } from '../../types';
import { fmtPnl, fmtPct, fmtHoldTime, fmtUsdt } from '../../utils/format';

interface Props { kpi: Kpi | null; loading: boolean; }

export default function KpiCards({ kpi, loading }: Props) {
  if (loading) {
    return (
      <div className="kpi-grid">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="kpi-card" style={{ opacity: 0.4 }}>
            <div className="kpi-label">불러오는 중...</div>
            <div className="kpi-value">—</div>
          </div>
        ))}
      </div>
    );
  }

  const k = kpi;
  const pnlClass = !k ? '' : k.total_net_pnl >= 0 ? 'positive' : 'negative';
  const retClass = !k ? '' : k.return_pct   >= 0 ? 'positive' : 'negative';
  const pfClass  = !k ? '' : k.profit_factor >= 1 ? 'positive' : 'negative';

  return (
    <div className="kpi-grid">
      {/* 총 순손익 */}
      <div className="kpi-card" style={{ '--accent': 'var(--green)' } as React.CSSProperties}>
        <div className="kpi-label">총 순손익</div>
        <div className={`kpi-value ${pnlClass}`}>
          {k ? fmtPnl(k.total_net_pnl) : '—'}
        </div>
        <div className="kpi-sub">USDT</div>
      </div>

      {/* 수익률 */}
      <div className="kpi-card" style={{ '--accent': 'var(--cyan)' } as React.CSSProperties}>
        <div className="kpi-label">수익률</div>
        <div className={`kpi-value ${retClass}`}>
          {k ? fmtPct(k.return_pct) : '—'}
        </div>
        <div className="kpi-sub">
          {k ? `기준: ${fmtUsdt(k.period_start_equity)} USDT` : '기간 시작 자산'}
        </div>
      </div>

      {/* 승률 */}
      <div className="kpi-card" style={{ '--accent': 'var(--gold)' } as React.CSSProperties}>
        <div className="kpi-label">승률</div>
        <div className="kpi-value gold">
          {k ? `${k.win_rate.toFixed(1)}%` : '—'}
        </div>
        <div className="kpi-sub">
          {k ? `${k.winning_trades}승 / ${k.losing_trades}패 / 총 ${k.total_trades}` : '—'}
        </div>
      </div>

      {/* 손익비 */}
      <div className="kpi-card" style={{ '--accent': 'var(--purple)' } as React.CSSProperties}>
        <div className="kpi-label">손익비 (Profit Factor)</div>
        <div className={`kpi-value ${pfClass}`}>
          {k ? k.profit_factor.toFixed(2) : '—'}
        </div>
        <div className="kpi-sub">
          {k ? `평균 이익: ${fmtPnl(k.avg_win, 1)} / 평균 손실: ${fmtPnl(k.avg_loss, 1)}` : '—'}
        </div>
      </div>

      {/* 평균 보유시간 */}
      <div className="kpi-card" style={{ '--accent': 'var(--cyan-dim)' } as React.CSSProperties}>
        <div className="kpi-label">평균 보유시간</div>
        <div className="kpi-value accent">
          {k ? fmtHoldTime(k.avg_hold_time_sec) : '—'}
        </div>
        <div className="kpi-sub">거래당 평균</div>
      </div>
    </div>
  );
}
