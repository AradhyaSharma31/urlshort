import React, { useState } from 'react';
import { createShortUrl } from '../services/api';

export default function UrlShortenerForm({ onUrlCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setLoading(true);
    setError(null);
    setCreatedUrl(null);
    setCopied(false);

    try {
      let expiresAt = null;
      if (expiresInDays && parseInt(expiresInDays, 10) > 0) {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(expiresInDays, 10));
        expiresAt = d.toISOString();
      }

      const res = await createShortUrl({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || null,
        title: title.trim() || null,
        expiresAt
      });

      setCreatedUrl(res);
      setOriginalUrl('');
      setCustomAlias('');
      setTitle('');
      setExpiresInDays('');
      setShowAdvanced(false);
      if (onUrlCreated) onUrlCreated(res);
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card form-card">
      <div className="form-header">
        <h2 className="form-title">Shorten a Long Link</h2>
        <p className="form-subtitle">Create clean, trackable short links instantly</p>
      </div>

      <form onSubmit={handleSubmit} className="shortener-form">
        <div className="input-group-main">
          <div className="input-icon-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="text"
              className="text-input text-input-main"
              placeholder="Paste your long link here (e.g. https://example.com/very-long-path)..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !originalUrl.trim()}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Shorten</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="advanced-toggle-bar">
          <button
            type="button"
            className="toggle-link"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? 'Hide Options' : 'Customize Link (Alias, Title, Expiry)'}</span>
            <svg
              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-fields fade-in">
            <div className="field-group">
              <label className="field-label">Custom Alias (optional)</label>
              <div className="prefix-input">
                <span className="prefix-text">/</span>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. launch-2026"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  title="3-20 characters: letters, numbers, dashes, underscores"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Link Title (optional)</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Product Launch Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Expiration (optional)</label>
              <select
                className="select-input"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
              >
                <option value="">Never expires</option>
                <option value="1">Expire in 24 hours (1 day)</option>
                <option value="7">Expire in 7 days</option>
                <option value="30">Expire in 30 days</option>
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </form>

      {createdUrl && (
        <div className="created-success-card fade-in">
          <div className="success-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Link ready!</span>
          </div>

          <div className="created-details">
            <div className="created-link-row">
              <a
                href={createdUrl.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-link-result"
              >
                {createdUrl.shortUrl}
              </a>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopy(createdUrl.shortUrl)}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="created-meta-preview">
              <span className="dest-label">Original:</span>
              <span className="dest-url" title={createdUrl.originalUrl}>
                {createdUrl.originalUrl}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
