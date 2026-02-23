import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from "recharts";

// ── 목업 데이터 ─────────────────────────────────────────────────────
const MOCK_TRADES = [
  { id:1,  symbol:"BTC-USDT",  side:"long",  open:"02-01 09:15", close:"02-01 21:40", entry:42100, exit:42650, qty:0.02, gross:11.0,  fee:-1.1, net:9.9,   hold:"12시간 25분" },
  { id:2,  symbol:"ETH-USDT",  side:"short", open:"02-03 14:10", close:"02-04 08:12", entry:2320,  exit:2270,  qty:0.30, gross:15.0,  fee:-2.4, net:12.6,  hold:"18시간 02분" },
  { id:3,  symbol:"SOL-USDT",  side:"long",  open:"02-05 10:00", close:"02-05 16:30", entry:98.5,  exit:95.2,  qty:5.00, gross:-16.5, fee:-1.8, net:-18.3, hold:"6시간 30분" },
  { id:4,  symbol:"BTC-USDT",  side:"long",  open:"02-07 08:00", close:"02-07 23:55", entry:43200, exit:44100, qty:0.02, gross:18.0,  fee:-1.2, net:16.8,  hold:"15시간 55분" },
  { id:5,  symbol:"ETH-USDT",  side:"long",  open:"02-09 11:20", close:"02-10 09:00", entry:2410,  exit:2380,  qty:0.20, gross:-6.0,  fee:-1.5, net:-7.5,  hold:"21시간 40분" },
  { id:6,  symbol:"BTC-USDT",  side:"short", open:"02-11 15:00", close:"02-11 22:10", entry:44500, exit:43800, qty:0.01, gross:7.0,   fee:-0.9, net:6.1,   hold:"7시간 10분" },
  { id:7,  symbol:"DOGE-USDT", side:"long",  open:"02-13 07:30", close:"02-13 14:20", entry:0.082, exit:0.079, qty:2000, gross:-6.0,  fee:-0.8, net:-6.8,  hold:"6시간 50분" },
  { id:8,  symbol:"SOL-USDT",  side:"short", open:"02-15 13:00", close:"02-16 10:30", entry:102.0, exit:96.5,  qty:3.00, gross:16.5,  fee:-2.1, net:14.4,  hold:"21시간 30분" },
  { id:9,  symbol:"ETH-USDT",  side:"long",  open:"02-17 09:45", close:"02-17 19:00", entry:2450,  exit:2520,  qty:0.25, gross:17.5,  fee:-2.0, net:15.5,  hold:"9시간 15분" },
  { id:10, symbol:"BTC-USDT",  side:"long",  open:"02-19 06:00", close:"02-20 04:00", entry:46000, exit:45200, qty:0.01, gross:-8.0,  fee:-0.8, net:-8.8,  hold:"22시간 00분" },
  { id:11, symbol:"SOL-USDT",  side:"long",  open:"02-21 10:10", close:"02-21 18:00", entry:95.0,  exit:99.8,  qty:4.00, gross:19.2,  fee:-1.9, net:17.3,  hold:"7시간 50분" },
  { id:12, symbol:"BTC-USDT",  side:"short", open:"02-22 20:00", close:"02-23 07:30", entry:45800, exit:45200, qty:0.02, gross:12.0,  fee:-1.1, net:10.9,  hold:"11시간 30분" },
];

const EQUITY_CURVE = [
  {date:"02-01",pnl:9.9},{date:"02-04",pnl:22.5},{date:"02-05",pnl:4.2},
  {date:"02-07",pnl:21.0},{date:"02-10",pnl:13.5},{date:"02-11",pnl:19.6},
  {date:"02-13",pnl:12.8},{date:"02-16",pnl:27.2},{date:"02-17",pnl:42.7},
  {date:"02-20",pnl:33.9},{date:"02-21",pnl:51.2},{date:"02-23",pnl:62.1},
];

const SYMBOL_STATS = [
  {symbol:"BTC", trades:5, wins:3, winRate:60, netPnl:34.9, color:"#F7931A"},
  {symbol:"ETH", trades:3, wins:2, winRate:67, netPnl:20.6, color:"#627EEA"},
  {symbol:"SOL", trades:3, wins:2, winRate:67, netPnl:13.4, color:"#9945FF"},
  {symbol:"DOGE",trades:1, wins:0, winRate:0,  netPnl:-6.8, color:"#C2A633"},
];

const PNL_DIST = [
  {range:"-20↓",count:0},{range:"-20~-10",count:1},{range:"-10~-5",count:0},
  {range:"-5~0",count:3},{range:"0~5",count:2},{range:"5~10",count:2},
  {range:"10~20",count:4},{range:"20↑",count:0},
];

const wins    = MOCK_TRADES.filter(t=>t.net>0);
const losses  = MOCK_TRADES.filter(t=>t.net<0);
const totalNet= +MOCK_TRADES.reduce((s,t)=>s+t.net,0).toFixed(2);
const avgWin  = wins.reduce((s,t)=>s+t.net,0)/wins.length;
const avgLoss = Math.abs(losses.reduce((s,t)=>s+t.net,0)/losses.length);
const pf      = avgWin/avgLoss;

// ── 아이콘 ──────────────────────────────────────────────────────────
const Icon = ({name,size=15,color="currentColor"}) => {
  const d = {
    grid:    <><rect x="3" y="3" width="7" height="7" rx="1.5" fill={color}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={color}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={color}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={color}/></>,
    trend:   <><polyline points="3,17 9,11 13,15 21,7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="15,7 21,7 21,13" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    gear:    <><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" fill="none"/></>,
    sync:    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    copy:    <><rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="2" fill="none"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/></>,
    eyeoff:  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>,
    logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0,display:"block"}}>{d[name]}</svg>;
};

// ── 로고 컴포넌트 ────────────────────────────────────────────────────
const Logo = ({size=32}) => (
  <div style={{
    width:size, height:size, borderRadius:"50%",
    background:"linear-gradient(145deg,#080e1c,#0c1c38)",
    border:"1.5px solid rgba(255,255,255,0.5)",
    boxShadow:"0 0 0 1px rgba(20,60,140,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  }}>
    <span style={{
      fontSize:size*0.44, fontWeight:700, color:"#c9a84c",
      textShadow:"0 0 10px rgba(201,168,76,0.5)",
      fontFamily:"'DM Sans',sans-serif", lineHeight:1,
    }}>L</span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════
// 온보딩 화면 (API 키 입력)
// ══════════════════════════════════════════════════════════════════════
function OnboardingScreen({ onComplete }) {
  const [step,       setStep]       = useState(1); // 1=환영, 2=API입력
  const [apiKey,     setApiKey]     = useState("");
  const [secret,     setSecret]     = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showSec,    setShowSec]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleConnect = () => {
    if (!apiKey.trim() || !secret.trim() || !passphrase.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    // 실제 서비스에서는 여기서 OKX API 검증
    setTimeout(() => {
      setLoading(false);
      onComplete({ apiKey, secret, passphrase });
    }, 1800);
  };

  const inputStyle = {
    width:"100%", background:"#0d1117", border:"1px solid #21293a",
    borderRadius:10, padding:"11px 14px", color:"#e6edf3",
    fontFamily:"'DM Mono',monospace", fontSize:13, outline:"none",
    transition:"border-color .15s",
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#080c12",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans','Pretendard',sans-serif",
      padding:"20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
        .inp:focus { border-color: #3b5bdb !important; }
        .inp::placeholder { color: #3d4f63; }
      `}</style>

      {step === 1 && (
        <div style={{ textAlign:"center", animation:"fadeUp .4s ease", maxWidth:420 }}>
          <Logo size={56} />
          <div style={{ marginTop:22, marginBottom:8 }}>
            <h1 style={{ fontSize:28, fontWeight:700, color:"#e6edf3", letterSpacing:"-0.03em" }}>LTU</h1>
            <p style={{ fontSize:14, color:"#58a6ff", fontWeight:500, marginTop:4 }}>코인선물 매매분석</p>
          </div>
          <p style={{ fontSize:13, color:"#8b949e", lineHeight:1.8, marginTop:16, marginBottom:32 }}>
            OKX 선물 거래 내역을 자동으로 분석하고<br/>성과를 한눈에 확인하세요.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:36 }}>
            {[
              { icon:"trend",  label:"실시간 분석" },
              { icon:"shield", label:"브라우저 저장" },
              { icon:"grid",   label:"종목별 통계" },
            ].map(f => (
              <div key={f.label} style={{ background:"#0d1117", border:"1px solid #161b22", borderRadius:12, padding:"16px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <Icon name={f.icon} size={18} color="#58a6ff"/>
                <span style={{ fontSize:11, color:"#8b949e", fontWeight:500 }}>{f.label}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{
            width:"100%", padding:"13px", borderRadius:12,
            background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
            border:"none", color:"#fff", fontSize:14, fontWeight:600,
            cursor:"pointer", letterSpacing:"-0.01em",
            boxShadow:"0 4px 20px rgba(29,78,216,0.35)",
          }}>
            시작하기
          </button>
          <p style={{ fontSize:11, color:"#3d4f63", marginTop:14 }}>
            OKX 읽기 전용 API 키가 필요합니다
          </p>
        </div>
      )}

      {step === 2 && (
        <div style={{ width:"100%", maxWidth:420, animation:"fadeUp .3s ease" }}>
          {/* 헤더 */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
            <Logo size={36} />
            <div>
              <div style={{ fontSize:16, fontWeight:600, color:"#e6edf3" }}>OKX API 연결</div>
              <div style={{ fontSize:11, color:"#3d4f63", marginTop:1 }}>읽기 전용 키를 입력하세요</div>
            </div>
          </div>

          {/* 안내 박스 */}
          <div style={{ background:"#0a1628", border:"1px solid #1d3557", borderRadius:10, padding:"12px 14px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
            <Icon name="shield" size={14} color="#58a6ff"/>
            <div style={{ fontSize:11, color:"#8b949e", lineHeight:1.7 }}>
              API 키는 <span style={{color:"#e6edf3",fontWeight:500}}>브라우저에만 저장</span>되며 외부로 전송되지 않습니다.<br/>
              반드시 <span style={{color:"#f59e0b",fontWeight:500}}>읽기 전용(Read Only)</span> 권한으로 발급하세요.
            </div>
          </div>

          {/* 입력 필드 */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
            <div>
              <label style={{ fontSize:11, color:"#8b949e", fontWeight:500, display:"block", marginBottom:6 }}>API Key</label>
              <input className="inp" style={inputStyle} type="text"
                placeholder="OKX API Key를 입력하세요"
                value={apiKey} onChange={e=>setApiKey(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8b949e", fontWeight:500, display:"block", marginBottom:6 }}>Secret Key</label>
              <div style={{ position:"relative" }}>
                <input className="inp" style={inputStyle} type={showSec?"text":"password"}
                  placeholder="Secret Key"
                  value={secret} onChange={e=>setSecret(e.target.value)} />
                <button onClick={()=>setShowSec(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#3d4f63", display:"flex" }}>
                  <Icon name={showSec?"eyeoff":"eye"} size={15} color="#3d4f63"/>
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#8b949e", fontWeight:500, display:"block", marginBottom:6 }}>Passphrase</label>
              <div style={{ position:"relative" }}>
                <input className="inp" style={inputStyle} type={showPass?"text":"password"}
                  placeholder="Passphrase"
                  value={passphrase} onChange={e=>setPassphrase(e.target.value)} />
                <button onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex" }}>
                  <Icon name={showPass?"eyeoff":"eye"} size={15} color="#3d4f63"/>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ fontSize:12, color:"#f87171", background:"#2d1117", border:"1px solid #5c2020", borderRadius:8, padding:"9px 12px", marginBottom:12 }}>
              {error}
            </div>
          )}

          <button onClick={handleConnect} disabled={loading} style={{
            width:"100%", padding:"13px", borderRadius:12,
            background: loading ? "#1a2a4a" : "linear-gradient(135deg,#1d4ed8,#2563eb)",
            border:"none", color: loading ? "#3d5a8a" : "#fff",
            fontSize:14, fontWeight:600, cursor: loading ? "default" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all .2s",
          }}>
            {loading
              ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}><Icon name="sync" size={15} color="#3d5a8a"/></span> 연결 중...</>
              : "연결하기"
            }
          </button>

          <button onClick={()=>setStep(1)} style={{ width:"100%", marginTop:10, padding:"10px", background:"none", border:"none", color:"#3d4f63", fontSize:12, cursor:"pointer" }}>
            뒤로 가기
          </button>

          {/* OKX 가이드 링크 */}
          <div style={{ marginTop:20, padding:"12px 14px", background:"#0d1117", border:"1px solid #161b22", borderRadius:10 }}>
            <div style={{ fontSize:11, color:"#3d4f63", marginBottom:6 }}>API 키 발급 방법</div>
            <div style={{ fontSize:11, color:"#8b949e", lineHeight:1.8 }}>
              OKX → 내 계정 → API 관리 → API 생성<br/>
              권한: <span style={{color:"#f59e0b"}}>읽기(Read)</span>만 체크 · 출금 권한 절대 금지
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 메인 대시보드
// ══════════════════════════════════════════════════════════════════════
function Dashboard({ credentials, onLogout }) {
  const [tab,       setTab]       = useState("dashboard");
  const [subTab,    setSubTab]    = useState("개요");
  const [period,    setPeriod]    = useState("30일");
  const [syncing,   setSyncing]   = useState(false);
  const [syncDone,  setSyncDone]  = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [autoSync,  setAutoSync]  = useState(true);
  const [countdown, setCountdown] = useState(287);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoSync) return;
    timerRef.current = setInterval(() => setCountdown(n => n > 0 ? n-1 : 299), 1000);
    return () => clearInterval(timerRef.current);
  }, [autoSync]);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSyncDone(true); setTimeout(()=>setSyncDone(false), 2500); }, 1600);
  };

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const Tip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    const v = payload[0].value;
    return (
      <div style={{background:"#161b22",border:"1px solid #21293a",borderRadius:8,padding:"8px 12px",fontSize:11}}>
        <div style={{color:"#3d4f63",marginBottom:2}}>{label}</div>
        <div style={{color:v>=0?"#34d399":"#f87171",fontWeight:600}}>{v>=0?"+":""}{typeof v==="number"?v.toFixed(2):v} USDT</div>
      </div>
    );
  };

  const maskedKey = credentials.apiKey
    ? credentials.apiKey.slice(0,6) + "••••••••" + credentials.apiKey.slice(-4)
    : "";

  return (
    <div style={{display:"flex",height:"100vh",background:"#0d1117",fontFamily:"'DM Sans','Pretendard',sans-serif",color:"#c9d1d9",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#21293a;border-radius:4px}
        .tr:hover td{background:#111820!important;color:#e6edf3!important}
        .nav-btn{background:none;border:none;cursor:pointer;width:100%;text-align:left;}
      `}</style>

      {/* ── 사이드바 ── */}
      <aside style={{width:200,background:"#080c12",borderRight:"1px solid #161b22",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"20px 18px 16px",borderBottom:"1px solid #161b22"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Logo size={30}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#e6edf3",letterSpacing:"-0.01em"}}>LTU</div>
              <div style={{fontSize:10,color:"#3d4f63",marginTop:1}}>코인선물 매매분석</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,padding:"12px 10px"}}>
          {[
            {id:"dashboard",label:"대시보드",icon:"grid"},
            {id:"symbols",  label:"종목별",  icon:"trend"},
            {id:"settings", label:"설정",    icon:"gear"},
          ].map(item => {
            const active = tab===item.id;
            return (
              <button key={item.id} className="nav-btn" onClick={()=>setTab(item.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",borderRadius:8,marginBottom:2,transition:"all .15s",
                  background:active?"#161b22":"transparent",
                  color:active?"#58a6ff":"#3d4f63"}}>
                <Icon name={item.icon} size={14} color={active?"#58a6ff":"#3d4f63"}/>
                <span style={{fontSize:13,fontWeight:active?500:400,color:active?"#58a6ff":"#8b949e"}}>{item.label}</span>
                {active && <div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:"#58a6ff"}}/>}
              </button>
            );
          })}
        </nav>

        {/* 연결 상태 */}
        <div style={{padding:"12px 14px",borderTop:"1px solid #161b22"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 5px #34d39977",flexShrink:0}}/>
            <span style={{fontSize:11,color:"#8b949e"}}>연결됨</span>
          </div>
          <div style={{fontSize:10,color:"#3d4f63",fontFamily:"'DM Mono',monospace",marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {maskedKey}
          </div>
          <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#3d4f63",fontSize:11,padding:0,transition:"color .15s"}}>
            <Icon name="logout" size={12} color="#3d4f63"/>
            API 키 변경
          </button>
        </div>
      </aside>

      {/* ── 메인 ── */}
      <main style={{flex:1,overflow:"auto",background:"#0d1117"}}>

        {/* ════ 대시보드 탭 ════ */}
        {tab==="dashboard" && (
          <div style={{padding:"24px 28px",animation:"fadeUp .2s ease"}}>
            {/* 헤더 */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div>
                  <h1 style={{fontSize:18,fontWeight:600,color:"#e6edf3",letterSpacing:"-0.02em"}}>성과 대시보드</h1>
                  <p style={{fontSize:11,color:"#3d4f63",marginTop:2}}>2026년 2월 · OKX 선물 (USDT)</p>
                </div>
                <div style={{display:"flex",background:"#161b22",borderRadius:8,padding:3,gap:2}}>
                  {["개요","종목별"].map(t=>(
                    <button key={t} onClick={()=>setSubTab(t)} style={{
                      padding:"5px 13px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:subTab===t?500:400,transition:"all .15s",
                      background:subTab===t?"#21293a":"transparent",
                      color:subTab===t?"#e6edf3":"#8b949e",
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{display:"flex",background:"#161b22",borderRadius:8,padding:3,gap:2}}>
                  {["7일","30일","90일","전체"].map(p=>(
                    <button key={p} onClick={()=>setPeriod(p)} style={{
                      padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:period===p?500:400,transition:"all .15s",
                      background:period===p?"#21293a":"transparent",
                      color:period===p?"#e6edf3":"#8b949e",
                    }}>{p}</button>
                  ))}
                </div>
                {autoSync&&countdown<30&&<span style={{fontSize:11,color:"#f59e0b",fontFamily:"'DM Mono',monospace"}}>{fmtTime(countdown)}</span>}
                <button onClick={handleSync} style={{
                  display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,
                  border:"1px solid #21293a",background:syncDone?"#0d2d1e":"transparent",
                  color:syncDone?"#34d399":"#8b949e",fontSize:12,cursor:"pointer",fontWeight:500,transition:"all .2s",
                }}>
                  <span style={{display:"inline-block",animation:syncing?"spin 1s linear infinite":"none"}}>
                    <Icon name="sync" size={13} color={syncDone?"#34d399":"#8b949e"}/>
                  </span>
                  {syncing?"동기화 중":syncDone?"완료":"동기화"}
                </button>
              </div>
            </div>

            {/* KPI */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11,marginBottom:18}}>
              {[
                {label:"총 순손익",    value:`+${totalNet}`,      unit:"USDT",  color:"#34d399", sub:"누적 실현 손익"},
                {label:"수익률",       value:"+1.24%",            unit:"",      color:"#58a6ff", sub:"기준 5,000 USDT"},
                {label:"승률",         value:`${((wins.length/MOCK_TRADES.length)*100).toFixed(1)}%`, unit:"", color:"#f59e0b", sub:`${wins.length}승 · ${losses.length}패 · ${MOCK_TRADES.length}건`},
                {label:"손익비",       value:pf.toFixed(2),       unit:"",      color:"#a78bfa", sub:`이익 +${avgWin.toFixed(1)} / 손실 ${avgLoss.toFixed(1)}`},
                {label:"평균 보유시간", value:"13h 38m",           unit:"",      color:"#38bdf8", sub:"거래당 평균"},
              ].map((k,i)=>(
                <div key={i} style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"15px 16px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${k.color}22,${k.color})`,opacity:.9}}/>
                  <div style={{fontSize:9,color:"#3d4f63",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:9}}>{k.label}</div>
                  <div style={{fontSize:20,fontWeight:600,color:k.color,letterSpacing:"-0.02em",lineHeight:1,fontFamily:"'DM Mono',monospace"}}>
                    {k.value}<span style={{fontSize:11,fontWeight:400,marginLeft:3,color:`${k.color}88`}}>{k.unit}</span>
                  </div>
                  <div style={{fontSize:10,color:"#3d4f63",marginTop:6}}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* 개요 */}
            {subTab==="개요" && <>
              {/* 자산 곡선 */}
              <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"16px 20px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:"#c9d1d9"}}>자산 곡선</div>
                    <div style={{fontSize:11,color:"#3d4f63",marginTop:1}}>누적 순손익 (USDT)</div>
                  </div>
                  <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#34d399",fontWeight:500}}>+62.1 USDT</div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={EQUITY_CURVE} margin={{top:4,right:0,bottom:0,left:0}}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#34d399" stopOpacity={0.12}/>
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 5" stroke="#161b22"/>
                    <XAxis dataKey="date" tick={{fill:"#3d4f63",fontSize:10,fontFamily:"DM Mono"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#3d4f63",fontSize:10,fontFamily:"DM Mono"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`+${v}`}/>
                    <Tooltip content={<Tip/>} cursor={{stroke:"#21293a",strokeWidth:1}}/>
                    <Area type="monotone" dataKey="pnl" stroke="#34d399" strokeWidth={1.5} fill="url(#g1)" dot={false} activeDot={{r:4,fill:"#34d399",stroke:"#0a0e17",strokeWidth:2}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 매매 내역 */}
              <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",borderBottom:"1px solid #161b22"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:13,fontWeight:500,color:"#c9d1d9"}}>매매 내역</span>
                    <span style={{fontSize:10,color:"#58a6ff",background:"#0d1f3c",padding:"2px 8px",borderRadius:20,fontWeight:500}}>12건</span>
                  </div>
                  <button onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}}
                    style={{display:"flex",alignItems:"center",gap:7,padding:"6px 13px",borderRadius:8,
                      border:`1px solid ${copied?"#34d39933":"#21293a"}`,
                      background:copied?"#0d2d1e":"transparent",
                      color:copied?"#34d399":"#8b949e",fontSize:12,cursor:"pointer",fontWeight:500,transition:"all .2s"}}>
                    <Icon name="copy" size={12} color={copied?"#34d399":"#8b949e"}/>
                    {copied?"복사 완료":"ChatGPT에 복사"}
                  </button>
                </div>
                <div style={{overflowX:"auto",maxHeight:260}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr>{["#","종목","방향","진입","청산","진입가","청산가","수량","총손익","수수료","순손익","보유시간"].map(h=>(
                        <th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:9,fontWeight:600,color:"#3d4f63",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid #161b22",background:"#0a0e17",whiteSpace:"nowrap",position:"sticky",top:0}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {MOCK_TRADES.map((t,i)=>(
                        <tr key={t.id} className="tr">
                          <td style={{padding:"8px 13px",color:"#3d4f63",fontFamily:"'DM Mono',monospace",fontSize:11}}>{i+1}</td>
                          <td style={{padding:"8px 13px",color:"#c9d1d9",fontWeight:500,fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.symbol}</td>
                          <td style={{padding:"8px 13px"}}>
                            <span style={{fontSize:11,fontWeight:500,padding:"2px 7px",borderRadius:4,
                              color:t.side==="long"?"#34d399":"#f87171",
                              background:t.side==="long"?"#0d2d1e":"#2d0f0f"}}>
                              {t.side==="long"?"롱":"숏"}
                            </span>
                          </td>
                          <td style={{padding:"8px 13px",color:"#8b949e",fontFamily:"'DM Mono',monospace",fontSize:10}}>{t.open}</td>
                          <td style={{padding:"8px 13px",color:"#8b949e",fontFamily:"'DM Mono',monospace",fontSize:10}}>{t.close}</td>
                          <td style={{padding:"8px 13px",color:"#8b949e",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.entry.toLocaleString()}</td>
                          <td style={{padding:"8px 13px",color:"#8b949e",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.exit.toLocaleString()}</td>
                          <td style={{padding:"8px 13px",color:"#8b949e",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.qty}</td>
                          <td style={{padding:"8px 13px",color:t.gross>=0?"#34d399":"#f87171",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.gross>=0?"+":""}{t.gross.toFixed(1)}</td>
                          <td style={{padding:"8px 13px",color:"#3d4f63",fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.fee.toFixed(1)}</td>
                          <td style={{padding:"8px 13px",color:t.net>=0?"#34d399":"#f87171",fontWeight:600,fontFamily:"'DM Mono',monospace",fontSize:11}}>{t.net>=0?"+":""}{t.net.toFixed(1)}</td>
                          <td style={{padding:"8px 13px",color:"#3d4f63",fontSize:10}}>{t.hold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>}

            {/* 종목별 */}
            {subTab==="종목별" && (
              <div style={{animation:"fadeUp .2s ease"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:12}}>
                  {SYMBOL_STATS.map(s=>(
                    <div key={s.symbol} style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:11}}>
                        <span style={{fontSize:15,fontWeight:600,color:s.color,fontFamily:"'DM Mono',monospace"}}>{s.symbol}</span>
                        <span style={{fontSize:10,color:"#3d4f63"}}>{s.trades}건</span>
                      </div>
                      <div style={{height:2,background:"#161b22",borderRadius:1,marginBottom:9,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${s.winRate}%`,background:s.winRate>=50?"#34d399":"#f87171",borderRadius:1}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                        <span style={{color:s.winRate>=50?"#34d399":"#f87171"}}>승률 {s.winRate}%</span>
                        <span style={{color:s.netPnl>=0?"#34d399":"#f87171",fontWeight:600,fontFamily:"'DM Mono',monospace"}}>{s.netPnl>=0?"+":""}{s.netPnl}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"16px 18px"}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#8b949e",marginBottom:14}}>종목별 순손익 (USDT)</div>
                    <ResponsiveContainer width="100%" height={165}>
                      <BarChart data={SYMBOL_STATS} margin={{top:4,right:4,bottom:0,left:0}} barSize={26}>
                        <CartesianGrid strokeDasharray="2 5" stroke="#161b22" vertical={false}/>
                        <XAxis dataKey="symbol" tick={{fill:"#3d4f63",fontSize:11,fontFamily:"DM Mono"}} tickLine={false} axisLine={false}/>
                        <YAxis tick={{fill:"#3d4f63",fontSize:10,fontFamily:"DM Mono"}} tickLine={false} axisLine={false} width={34}/>
                        <Tooltip contentStyle={{background:"#161b22",border:"1px solid #21293a",borderRadius:8,fontSize:11}} formatter={v=>[`${v>=0?"+":""}${v.toFixed(1)} USDT`,"순손익"]}/>
                        <Bar dataKey="netPnl" radius={[5,5,0,0]}>
                          {SYMBOL_STATS.map((s,i)=><Cell key={i} fill={s.netPnl>=0?"#34d399":"#f87171"} fillOpacity={.8}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"16px 18px"}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#8b949e",marginBottom:12}}>종목별 승률 (%)</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <RadialBarChart innerRadius={20} outerRadius={72} data={SYMBOL_STATS} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="winRate" cornerRadius={4} label={{position:"insideStart",fill:"#3d4f63",fontSize:9}}>
                          {SYMBOL_STATS.map((s,i)=><Cell key={i} fill={s.color} fillOpacity={.85}/>)}
                        </RadialBar>
                        <Tooltip contentStyle={{background:"#161b22",border:"1px solid #21293a",borderRadius:8,fontSize:11}} formatter={v=>[`${v}%`,"승률"]}/>
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"3px 12px",justifyContent:"center"}}>
                      {SYMBOL_STATS.map(s=>(
                        <div key={s.symbol} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#8b949e"}}>
                          <div style={{width:6,height:6,borderRadius:2,background:s.color}}/>
                          {s.symbol}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"16px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:500,color:"#8b949e"}}>손익 분포 (거래당 USDT)</div>
                    <div style={{fontSize:11,color:"#3d4f63"}}>총 12건</div>
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={PNL_DIST} margin={{top:4,right:4,bottom:0,left:0}} barSize={20}>
                      <CartesianGrid strokeDasharray="2 5" stroke="#161b22" vertical={false}/>
                      <XAxis dataKey="range" tick={{fill:"#3d4f63",fontSize:9,fontFamily:"DM Mono"}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:"#3d4f63",fontSize:9}} tickLine={false} axisLine={false} width={16} allowDecimals={false}/>
                      <Tooltip contentStyle={{background:"#161b22",border:"1px solid #21293a",borderRadius:8,fontSize:11}} formatter={v=>[`${v}건`,"거래 수"]}/>
                      <Bar dataKey="count" radius={[5,5,0,0]}>
                        {PNL_DIST.map((d,i)=><Cell key={i} fill={d.range.startsWith("-")||d.range.includes("↓")?"#f87171":"#34d399"} fillOpacity={.7}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ 종목별 탭 ════ */}
        {tab==="symbols" && (
          <div style={{padding:"24px 28px",animation:"fadeUp .2s ease"}}>
            <h1 style={{fontSize:18,fontWeight:600,color:"#e6edf3",letterSpacing:"-0.02em",marginBottom:20}}>종목별 분석</h1>
            <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"40px",display:"flex",alignItems:"center",justifyContent:"center",color:"#3d4f63",fontSize:13}}>
              대시보드 → "종목별" 서브탭에서 확인하세요
            </div>
          </div>
        )}

        {/* ════ 설정 탭 ════ */}
        {tab==="settings" && (
          <div style={{padding:"24px 28px",maxWidth:500,animation:"fadeUp .2s ease"}}>
            <div style={{marginBottom:22}}>
              <h1 style={{fontSize:18,fontWeight:600,color:"#e6edf3",letterSpacing:"-0.02em"}}>설정</h1>
              <p style={{fontSize:11,color:"#3d4f63",marginTop:2}}>API 연결 및 동기화 설정</p>
            </div>

            {/* 현재 연결 */}
            <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"18px 20px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:600,color:"#3d4f63",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #161b22"}}>현재 연결</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 5px #34d39977"}}/>
                  <span style={{fontSize:13,color:"#c9d1d9",fontWeight:500}}>OKX API 연결됨</span>
                </div>
                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:"#3d4f63"}}>{maskedKey}</span>
              </div>
              <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:8,background:"transparent",border:"1px solid #2d1117",color:"#f87171",fontSize:12,cursor:"pointer",fontWeight:500}}>
                <Icon name="logout" size={13} color="#f87171"/>
                API 키 재설정
              </button>
            </div>

            {/* 자동 동기화 */}
            <div style={{background:"#0a0e17",border:"1px solid #161b22",borderRadius:12,padding:"18px 20px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:600,color:"#3d4f63",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #161b22"}}>자동 동기화</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"#c9d1d9",marginBottom:3}}>자동 동기화</div>
                  <div style={{fontSize:11,color:"#3d4f63"}}>백그라운드에서 자동으로 거래 내역을 가져옵니다</div>
                </div>
                <button onClick={()=>setAutoSync(v=>!v)} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",position:"relative",transition:"background .2s",background:autoSync?"#1d4ed8":"#21293a",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",left:autoSync?21:3}}/>
                </button>
              </div>
              <div style={{display:"flex",background:"#161b22",borderRadius:8,padding:3,gap:2,width:"fit-content",marginBottom:14}}>
                {["1분","5분","15분","1시간"].map((l,i)=>(
                  <button key={l} style={{padding:"5px 11px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,transition:"all .15s",background:i===1?"#21293a":"transparent",color:i===1?"#e6edf3":"#8b949e"}}>{l}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[
                  {label:"상태",       value:autoSync?"실행 중":"중지됨", color:autoSync?"#34d399":"#3d4f63"},
                  {label:"다음 동기화", value:autoSync?fmtTime(countdown):"—", color:countdown<30?"#f59e0b":"#58a6ff"},
                  {label:"동기화 횟수", value:"7회", color:"#8b949e"},
                ].map(item=>(
                  <div key={item.label} style={{background:"#161b22",borderRadius:8,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:"#3d4f63",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>{item.label}</div>
                    <div style={{fontSize:15,fontWeight:600,color:item.color,fontFamily:"'DM Mono',monospace"}}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 보안 */}
            <div style={{background:"#0a1628",border:"1px solid #1d3557",borderRadius:12,padding:"16px 20px"}}>
              <div style={{fontSize:10,fontWeight:600,color:"#58a6ff",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>보안 안내</div>
              {[
                "API 키는 브라우저(localStorage)에만 저장됩니다",
                "외부 서버로 API 키가 전송되지 않습니다",
                "읽기 전용 API 키만 사용 — 출금 불가",
                "브라우저 캐시 삭제 시 키도 함께 삭제됩니다",
              ].map(msg=>(
                <div key={msg} style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:"#8b949e",lineHeight:2.2}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:"#34d399",flexShrink:0}}/>
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// 루트: 온보딩 ↔ 대시보드 전환
// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [credentials, setCredentials] = useState(null);

  const handleComplete = (creds) => setCredentials(creds);
  const handleLogout   = () => setCredentials(null);

  if (!credentials) return <OnboardingScreen onComplete={handleComplete}/>;
  return <Dashboard credentials={credentials} onLogout={handleLogout}/>;
}
