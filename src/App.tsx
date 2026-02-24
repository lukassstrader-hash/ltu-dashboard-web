import { useEffect } from 'react';
import { useStore } from './store';
import Dashboard from './components/dashboard/Dashboard';
import Settings from './components/settings/Settings';
import Sidebar from './components/common/Sidebar';
import './index.css';

export default function App() {
  const { page, checkCredentials, loadDashboard, fetchSyncStatus } = useStore();

  useEffect(() => {
    checkCredentials().then(() => {
      loadDashboard();
      fetchSyncStatus();
    });
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {page === 'dashboard' ? <Dashboard /> : <Settings />}
      </main>
    </div>
  );
}
