import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar,
} from 'recharts';
import type { Trade } from '../../types';
import { fmtPnl } from '../../utils/format';

interface Props { trades: Trade[] }

const SYMBOL_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
  DOGE: '#C2A633', XRP: '#346AA9', ADA: '#0D1E2D', AVAX: '#E84142',
};

function getColor(inst: string): string {
  for (const [key, color] of Object.entries(SYMBOL_COLORS)) {
    if (inst.includes(key)) return color;
  }
  return '#00d4ff';
}

function shortSymbol(inst: string): string {
  return inst.replace('-USDT-FUTURES', '').replace('-USDT-SWAP', '').replace('-USDT', '');
}

export default function SymbolCharts({ trades }: Props) {
  const symbolMap: Record<string, { wins: number; losses: number; netPnl: number; trades: number }> = {};

  for (const t of trades) {
    const sym = shortSymbol(t.inst_id);
    if (!symbolMap[sym]) symbolMap[sym] = { wins: 0, losses: 0, netPnl: 0, trades: 0 };
    symbolMap[sym].trades += 1;
    symbolMap[sym].netPnl += t.net_pnl ?? 0;
    if ((t.net_pnl ?? 0) >= 0) symbolMap[sym].wins += 1;
    else symbolMap[sym].losses += 1;
  }

  const symbolData = Object.entries(symbolMap).map(([sym, d]) => ({
    symbol: sym,
    trades: d.trades,
    wins: d.wins,
    losses: d.losses,
    winRate: d.trades > 0 ? Math.round((d.wins / d.trades) * 100) : 0,
    netPnl: +d.netPnl.toFixed(2),
    color: getColor(sym),
  })).sort((a, b) => b.netPnl - a.netPnl);

  const buckets: Record<string, number> = {
    '-20이하': 0, '-20~-10': 0, '-10~-5': 0, '-5~0': 0,
    '0~5': 0, '5~10': 0, '10~20': 0, '20이상': 0,
  };
  for (const t of trades) {
    const v = t.net_pnl ?? 0;
    if      (v < -20) buckets['-20이하']++;
    else if (v < -10) buckets['-20~-10']++;
    else if (v < -5)  buckets['-10~-5']++;
    else if (v < 0)   buckets['-5~0']++;
    else if (v < 5)   buckets['0~5']++;
    else if (v < 10)  buckets['5~10']++;
    else if (v < 20)  buckets['10~20']++;
    else              buckets['20이상']++;
  }
  const distData = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        <div style={{ color: 'var(--text-primary)' }}>{payload[0].value}건</div>
      </div>
    );
  };

  if (trades.length === 0) {
    return (
      <div className="chart-panel">
        <div className="loading-overlay">선택 기간에 거래 데이터가 없습니다</div>
      </div>
    );
  }

  return (
    <>
      {/* 종목별 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        {symbolData.map(s => (
          <div key={s.symbol} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: s.color }}>{s.symbol}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.trades}건</span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.winRate}%`, background: s.winRate >= 50 ? 'var(--green)' : 'var(--red)', borderRadius: 2 }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              <span style={{ color: s.winRate >= 50 ? 'var(--green)' : 'var(--red)' }}>승률 {s.winRate}%</span>
              <span style={{ color: s.netPnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{fmtPnl(s.netPnl, 1)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* 종목별 순손익 */}
        <div className="chart-panel">
          <div className="panel-header">
            <span className="panel-title">종목별 순손익 (USDT)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={symbolData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="symbol" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={44} tickFormatter={v => `${v > 0 ? '+' : ''}${v}`} />
              <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }} formatter={(v: number) => [`${fmtPnl(v)} USDT`, '순손익']} />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                {symbolData.map((s, i) => <Cell key={i} fill={s.netPnl >= 0 ? 'var(--green)' : 'var(--red)'} fillOpacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 종목별 승률 */}
        <div className="chart-panel">
          <div className="panel-header">
            <span className="panel-title">종목별 승률 (%)</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart innerRadius={18} outerRadius={75} data={symbolData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="winRate" cornerRadius={4} label={{ position: 'insideStart', fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                {symbolData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </RadialBar>
              <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }} formatter={(v: number) => [`${v}%`, '승률']} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
            {symbolData.map(s => (
              <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>{s.symbol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 손익 분포 */}
      <div className="chart-panel">
        <div className="panel-header">
          <span className="panel-title">손익 분포 (USDT / 거래당)</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>총 {trades.length}건</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={distData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} width={22} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distData.map((d, i) => (
                <Cell key={i}
                  fill={d.range.includes('이하') || d.range.startsWith('-') ? 'var(--red)' : 'var(--green)'}
                  fillOpacity={0.6}
                  stroke={d.range.includes('이하') || d.range.startsWith('-') ? 'var(--red)' : 'var(--green)'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
