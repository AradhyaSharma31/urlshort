import React, { useEffect, useState } from 'react';
import UrlShortenerForm from './components/UrlShortenerForm';
import UrlList from './components/UrlList';
import AnalyticsModal from './components/AnalyticsModal';
import { fetchUrls, toggleUrlStatus, deleteUrl } from './services/api';
import './App.css';

export default function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAnalyticsShortCode, setActiveAnalyticsShortCode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadUrls = async () => {
    try {
      setLoading(true);
      const data = await fetchUrls();
      setUrls(data);
    } catch (err) {
      console.error(err);
      showToast('Could not connect to backend server. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const handleUrlCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    showToast('Short link created successfully!');
  };

  const handleToggleActive = async (id) => {
    try {
      const updated = await toggleUrlStatus(id);
      setUrls((prev) => prev.map((u) => (u.id === id ? updated : u)));
      showToast(`Link is now ${updated.isActive ? 'active' : 'disabled'}`);
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short link?')) return;
    try {
      await deleteUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      showToast('Short link removed');
    } catch (err) {
      showToast('Failed to delete link');
    }
  };

  const totalClicksAll = urls.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const activeLinksCount = urls.filter((u) => u.isActive && !u.isExpired).length;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <span className="brand-title">SnapLink</span>
            <span className="brand-tag">URL Shortener & Analytics</span>
          </div>
        </div>

        <div className="nav-stats">
          <div className="nav-stat-item">
            <span className="stat-num">{urls.length}</span>
            <span className="stat-label">Total Links</span>
          </div>
          <div className="nav-stat-divider"></div>
          <div className="nav-stat-item">
            <span className="stat-num">{activeLinksCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="nav-stat-divider"></div>
          <div className="nav-stat-item">
            <span className="stat-num">{totalClicksAll.toLocaleString()}</span>
            <span className="stat-label">Total Clicks</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <UrlShortenerForm onUrlCreated={handleUrlCreated} />

        <UrlList
          urls={urls}
          loading={loading}
          onSelectAnalytics={(shortCode) => setActiveAnalyticsShortCode(shortCode)}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>SnapLink URL Shortener &bull; High Performance Spring Boot 4 + React App</p>
      </footer>

      {/* Analytics Modal */}
      {activeAnalyticsShortCode && (
        <AnalyticsModal
          shortCode={activeAnalyticsShortCode}
          onClose={() => setActiveAnalyticsShortCode(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification fade-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
