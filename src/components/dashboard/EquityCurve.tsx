import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { EquityPoint } from '../../types';
import { fmtDate, fmtPnl } from '../../utils/format';

interface Props { data: EquityPoint[]; loading: boolean; }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: EquityPoint }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPos = d.pnl_cum_usdt >= 0;
  return (
    <div style={{
      background: 'var(--bg-panel)', border: '1px solid var(--border-light)',
      borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{fmtDate(d.ts_ms)}</div>
      <div style={{ color: isPos ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
        {fmtPnl(d.pnl_cum_usdt)} USDT
      </div>
    </div>
  );
};

export default function EquityCurve({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="chart-panel">
        <div className="panel-header">
          <span className="panel-title">자산 곡선</span>
        </div>
        <div className="loading-overlay" style={{ height: 200 }}>차트 불러오는 중...</div>
      </div>
    );
  }

  const isPositive = data.length === 0 || data[data.length - 1]?.pnl_cum_usdt >= 0;
  const color = isPositive ? 'var(--green)' : 'var(--red)';
  const gradId = isPositive ? 'grad-pos' : 'grad-neg';
  const formatted = data.map(d => ({ ...d, date: fmtDate(d.ts_ms) }));

  return (
    <div className="chart-panel">
      <div className="panel-header">
        <span className="panel-title">자산 곡선 (누적 순손익)</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          {data.length}개 데이터
        </span>
      </div>

      {data.length === 0 ? (
        <div className="loading-overlay" style={{ height: 200 }}>
          선택 기간에 거래 데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v >= 0 ? '+' : ''}${v.toFixed(0)}`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--border-light)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="pnl_cum_usdt" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, fill: color, stroke: 'var(--bg-card)', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
