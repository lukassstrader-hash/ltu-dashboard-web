import { useStore } from '../../store';
import { fmtDateTime } from '../../utils/format';

export default function Sidebar() {
  const { page, setPage, hasCredentials, syncStatus } = useStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>⬡ OKX 대시보드</h1>
        <p>선물 성과 분석</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
          onClick={() => setPage('dashboard')}
        >
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
          대시보드
        </button>
        <button
          className={`nav-item ${page === 'settings' ? 'active' : ''}`}
          onClick={() => setPage('settings')}
        >
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M8 1a.75.75 0 01.75.75v.633a5.5 5.5 0 012.854 1.657l.548-.317a.75.75 0 11.75 1.299l-.548.317A5.5 5.5 0 0113.617 8H14.25a.75.75 0 010 1.5h-.633a5.5 5.5 0 01-1.657 2.854l.317.548a.75.75 0 11-1.299.75l-.317-.548A5.5 5.5 0 018 14.617v.633a.75.75 0 01-1.5 0v-.633a5.5 5.5 0 01-2.854-1.657l-.548.317a.75.75 0 11-.75-1.299l.548-.317A5.5 5.5 0 012.383 9H1.75a.75.75 0 010-1.5h.633a5.5 5.5 0 011.657-2.854l-.317-.548a.75.75 0 111.299-.75l.317.548A5.5 5.5 0 018 2.383V1.75A.75.75 0 018 1z"/>
          </svg>
          설정
        </button>
      </nav>

      <div className="sidebar-status">
        <div style={{ marginBottom: 6 }}>
          <span className={`status-dot ${hasCredentials ? 'connected' : ''}`}></span>
          {hasCredentials ? 'API 연결됨' : 'API 키 없음'}
        </div>
        {syncStatus && (
          <>
            <div style={{ marginBottom: 2 }}>
              종료 거래 {syncStatus.trade_count}건
            </div>
            {syncStatus.last_sync_ms && (
              <div>마지막 동기화 {fmtDateTime(syncStatus.last_sync_ms)}</div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
