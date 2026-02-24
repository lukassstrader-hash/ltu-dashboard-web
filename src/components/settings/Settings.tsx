import { useState } from 'react';
import { useStore } from '../../store';
import * as api from '../../utils/tauri';
import { useScheduler } from '../../hooks/useScheduler';

const INTERVAL_OPTIONS = [
  { label: '1분',   value: 60   },
  { label: '5분',   value: 300  },
  { label: '15분',  value: 900  },
  { label: '1시간', value: 3600 },
];

export default function Settings() {
  const { hasCredentials, checkCredentials, syncData, repairSync, syncLoading, syncMessage } = useStore();
  const { status: sched, setAutoSync, setInterval: setSchedInterval, secondsUntilNext } = useScheduler();

  const [apiKey,      setApiKey]      = useState('');
  const [secret,      setSecret]      = useState('');
  const [passphrase,  setPassphrase]  = useState('');
  const [saveStatus,  setSaveStatus]  = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [testStatus,  setTestStatus]  = useState<'idle'|'testing'|'ok'|'error'>('idle');
  const [testMsg,     setTestMsg]     = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [repairDays,  setRepairDays]  = useState(7);

  const handleSave = async () => {
    if (!apiKey.trim() || !secret.trim() || !passphrase.trim()) { 
      setSaveStatus('error'); 
      return; 
    }
    setSaveStatus('saving');
    try {
      await api.saveApiCredentials(apiKey.trim(), secret.trim(), passphrase.trim());
      setSaveStatus('saved');
      await checkCredentials();
      setApiKey(''); setSecret(''); setPassphrase('');
    } catch (e) { 
      console.error(e);
      setSaveStatus('error'); 
    }
  };
```

그리고 **보안 상태 섹션** 텍스트도 웹 버전에 맞게 바꿔주세요. 아래 5줄을:
```
'API 인증 정보는 OS 키체인에만 저장됩니다',
'OKX 서명(HMAC)은 Rust 백엔드에서만 처리 — JavaScript 미노출',
'서버/클라우드/원격 저장소 없음 (완전 로컬)',
'인증 정보는 로그, 복사 출력물에 절대 포함되지 않습니다',
'DB에는 시세 데이터만 저장 (인증 정보 없음)',
```

이걸로 교체:
```
'API 키는 브라우저(localStorage)에만 저장됩니다',
'외부 서버로 API 키가 전송되지 않습니다',
'읽기 전용 API 키만 사용 — 출금 불가',
'브라우저 캐시 삭제 시 키도 함께 삭제됩니다',
'OKX 읽기(Read) 권한만 체크하세요',

  const handleTest = async () => {
    setTestStatus('testing'); setTestMsg('');
    try {
      await api.testApiConnection();
      setTestStatus('ok');
      setTestMsg('연결 성공! API 키가 유효합니다.');
    } catch (e: unknown) {
      setTestStatus('error');
      setTestMsg(String(e));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    await api.deleteApiCredentials();
    await checkCredentials();
    setDeleteConfirm(false);
  };

  const fmtCountdown = (sec: number | null) => {
    if (sec === null) return '—';
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  return (
    <div className="settings-page">
      <div className="page-header"><span className="page-title">설정</span></div>

      {/* API 인증 정보 */}
      <div className="settings-section">
        <div className="section-title">OKX API 인증 정보</div>
        <div className="alert alert-info" style={{ marginBottom: 20, fontSize: 11 }}>
          🔒 읽기 전용(Read Only) API 키만 필요합니다. 인증 정보는 OS 키체인에만 저장되며 로그, DB, 네트워크에 절대 노출되지 않습니다.
        </div>
        {[
          { label: 'API Key',    val: apiKey,     set: setApiKey,     type: 'text'     },
          { label: 'Secret Key', val: secret,     set: setSecret,     type: 'password' },
          { label: 'Passphrase', val: passphrase, set: setPassphrase, type: 'password' },
        ].map(({ label, val, set, type }) => (
          <div className="form-group" key={label}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type} value={val}
              onChange={e => set(e.target.value)}
              placeholder={`OKX ${label}를 입력하세요`}
              autoComplete="off" spellCheck={false} />
          </div>
        ))}
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? '⏳ 저장 중...' : '💾 키체인에 저장'}
          </button>
          <button className="btn" onClick={handleTest} disabled={testStatus === 'testing' || !hasCredentials}>
            {testStatus === 'testing' ? <><span className="spin">⟳</span> 테스트 중...</> : '⚡ 연결 테스트'}
          </button>
          {hasCredentials && (
            <button className="btn btn-danger" onClick={handleDelete}>
              {deleteConfirm ? '⚠ 삭제 확인' : '🗑 인증 정보 삭제'}
            </button>
          )}
        </div>
        {saveStatus === 'saved'  && <div className="alert alert-success">✓ OS 키체인에 안전하게 저장되었습니다.</div>}
        {saveStatus === 'error'  && <div className="alert alert-error">⚠ 저장 실패. 모든 항목을 입력해주세요.</div>}
        {testStatus === 'ok'     && <div className="alert alert-success">✓ {testMsg}</div>}
        {testStatus === 'error'  && <div className="alert alert-error">⚠ {testMsg}</div>}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={`status-dot ${hasCredentials ? 'connected' : ''}`}></div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: hasCredentials ? 'var(--green)' : 'var(--text-muted)' }}>
            {hasCredentials ? 'API 인증 정보가 OS 키체인에 저장되어 있습니다' : '저장된 인증 정보 없음'}
          </span>
        </div>
      </div>

      {/* 자동 동기화 스케줄러 */}
      <div className="settings-section">
        <div className="section-title">자동 동기화 스케줄러</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>자동 동기화</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>백그라운드에서 자동으로 매매 내역을 가져옵니다</div>
          </div>
          <button
            onClick={() => sched && setAutoSync(!sched.auto_sync)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: sched?.auto_sync ? 'var(--cyan)' : 'var(--border)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, borderRadius: '50%', width: 18, height: 18,
              background: '#fff', transition: 'left 0.2s',
              left: sched?.auto_sync ? 22 : 3,
            }} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>동기화 주기</div>
          <div className="date-filter">
            {INTERVAL_OPTIONS.map(opt => (
              <button key={opt.value} className={`filter-btn ${sched?.interval_secs === opt.value ? 'active' : ''}`} onClick={() => setSchedInterval(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {sched && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: '상태',         value: sched.auto_sync ? '실행 중' : '중지됨', color: sched.auto_sync ? 'var(--green)' : 'var(--text-muted)' },
              { label: '다음 동기화', value: sched.auto_sync ? fmtCountdown(secondsUntilNext) : '—', color: (secondsUntilNext ?? 999) < 30 ? 'var(--gold)' : 'var(--cyan)' },
              { label: '동기화 횟수', value: `${sched.sync_count}회`, color: 'var(--text-secondary)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-green" onClick={() => syncData()} disabled={syncLoading || !hasCredentials}>
            {syncLoading ? <><span className="spin">⟳</span> 동기화 중...</> : '⟳ 지금 동기화'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>복구:</span>
            <div className="date-filter">
              {[7, 14, 30].map(d => (
                <button key={d} className={`filter-btn ${repairDays === d ? 'active' : ''}`} onClick={() => setRepairDays(d)}>{d}일</button>
              ))}
            </div>
            <button className="btn" onClick={() => repairSync(repairDays)} disabled={syncLoading || !hasCredentials}>
              🔧 데이터 복구
            </button>
          </div>
        </div>
        {syncMessage && <div className="alert alert-success" style={{ marginTop: 12 }}>✓ {syncMessage}</div>}
      </div>

      {/* 보안 상태 */}
      <div className="settings-section" style={{ borderColor: 'rgba(0,212,255,0.12)' }}>
        <div className="section-title">보안 상태</div>
        {[
          'API 인증 정보는 OS 키체인에만 저장됩니다',
          'OKX 서명(HMAC)은 Rust 백엔드에서만 처리 — JavaScript 미노출',
          '서버/클라우드/원격 저장소 없음 (완전 로컬)',
          '인증 정보는 로그, 복사 출력물에 절대 포함되지 않습니다',
          'DB에는 시세 데이터만 저장 (인증 정보 없음)',
        ].map(msg => (
          <div key={msg} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 2, display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--green)' }}>✓</span>{msg}
          </div>
        ))}
      </div>
    </div>
  );
}
