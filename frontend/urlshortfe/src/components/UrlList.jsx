import { useState } from 'react';

export default function UrlList({ urls, loading, onSelectAnalytics, onToggleActive, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUrls = urls.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.title && u.title.toLowerCase().includes(term)) ||
      u.shortCode.toLowerCase().includes(term) ||
      u.originalUrl.toLowerCase().includes(term)
    );
  });

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card table-card">
      <div className="table-header">
        <div>
          <h3 className="section-title">Your Shortened Links</h3>
          <p className="section-subtitle">
            {urls.length} {urls.length === 1 ? 'link created' : 'links created'}
          </p>
        </div>

        <div className="table-search">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner"></div>
          <p>Loading links...</p>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <p className="empty-text">
            {searchTerm ? 'No links match your search query.' : 'No short links created yet. Create one above!'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="url-table">
            <thead>
              <tr>
                <th>Title / Original Link</th>
                <th>Short Link</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUrls.map((url) => (
                <tr key={url.id}>
                  <td>
                    <div className="title-cell">
                      <span className="link-title">{url.title || 'Untitled Link'}</span>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="original-link"
                        title={url.originalUrl}
                      >
                        {url.originalUrl}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="short-link-cell">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="short-link"
                      >
                        /{url.shortCode}
                      </a>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Copy to clipboard"
                        onClick={() => handleCopy(url.id, url.shortUrl)}
                      >
                        {copiedId === url.id ? (
                          <span className="copied-tag">Copied</span>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="clicks-badge">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {url.clickCount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {url.isExpired ? (
                      <span className="badge badge-expired">Expired</span>
                    ) : url.isActive ? (
                      <span className="badge badge-active">Active</span>
                    ) : (
                      <span className="badge badge-disabled">Disabled</span>
                    )}
                  </td>
                  <td>
                    <span className="date-text">{formatDate(url.createdAt)}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectAnalytics(url.shortCode)}
                      >
                        Analytics
                      </button>

                      <button
                        type="button"
                        className="btn-icon"
                        title={url.isActive ? 'Disable link' : 'Enable link'}
                        onClick={() => onToggleActive(url.id)}
                      >
                        {url.isActive ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        title="Delete URL"
                        onClick={() => onDelete(url.id)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
