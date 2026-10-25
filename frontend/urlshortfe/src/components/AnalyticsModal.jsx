import React, { useEffect, useState } from 'react';
import { fetchAnalytics } from '../services/api';

export default function AnalyticsModal({ shortCode, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchAnalytics(shortCode)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shortCode]);

  const renderBreakdown = (title, items) => {
    if (!items || items.length === 0) {
      return (
        <div className="stat-card">
          <h4 className="stat-card-title">{title}</h4>
          <p className="no-data">No data yet</p>
        </div>
      );
    }

    const total = items.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0) || 1;

    return (
      <div className="stat-card">
        <h4 className="stat-card-title">{title}</h4>
        <div className="breakdown-list">
          {items.map((item, idx) => {
            const count = Number(item.count) || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={idx} className="breakdown-item">
                <div className="breakdown-info">
                  <span className="breakdown-name">{item.name || 'Unknown'}</span>
                  <span className="breakdown-count">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-badge">Analytics Dashboard</span>
            <h3 className="modal-title">/{shortCode}</h3>
            {data && <p className="modal-subtitle">{data.title || data.originalUrl}</p>}
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Gathering analytics...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : data ? (
          <div className="modal-body">
            {/* Metric Overview Cards */}
            <div className="metric-grid">
              <div className="metric-box">
                <span className="metric-label">Total Clicks</span>
                <span className="metric-val">{data.totalClicks.toLocaleString()}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Destination</span>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="metric-link"
                  title={data.originalUrl}
                >
                  {data.originalUrl}
                </a>
              </div>
              <div className="metric-box">
                <span className="metric-label">Created At</span>
                <span className="metric-subtext">
                  {new Date(data.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="breakdown-grid">
              {renderBreakdown('Browsers', data.browserStats)}
              {renderBreakdown('Operating Systems', data.osStats)}
              {renderBreakdown('Device Types', data.deviceStats)}
              {renderBreakdown('Referrers', data.refererStats)}
            </div>

            {/* Recent Clicks Log */}
            <div className="recent-log-card">
              <h4 className="stat-card-title">Recent Clicks (Latest 20)</h4>
              {data.recentClicks && data.recentClicks.length > 0 ? (
                <div className="table-responsive">
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Device & OS</th>
                        <th>Browser</th>
                        <th>Referrer</th>
                        <th>IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentClicks.map((click) => (
                        <tr key={click.id}>
                          <td>{new Date(click.clickedAt).toLocaleString()}</td>
                          <td>
                            {click.deviceType} • {click.os}
                          </td>
                          <td>{click.browser}</td>
                          <td>{click.referer || 'Direct'}</td>
                          <td>
                            <code className="ip-badge">{click.ipAddress}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No recorded visits yet. Open the short link in a browser to test!</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
