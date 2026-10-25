const BASE_URL = import.meta.env.VITE_API_URL || '';

async function parseResponseBody(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  // If HTML or text is returned (e.g., error from proxy/server)
  const text = await res.text().catch(() => '');
  return text;
}

function extractErrorMessage(res, body, defaultMessage) {
  if (body && typeof body === 'object') {
    if (body.message) return body.message;
    if (body.errors && typeof body.errors === 'object') {
      return Object.values(body.errors).join(', ');
    }
    if (body.error) return body.error;
  }
  if (typeof body === 'string' && body.trim() && !body.includes('<!DOCTYPE') && !body.includes('<html')) {
    return body.trim();
  }
  return `${defaultMessage} (Status ${res.status}: ${res.statusText || 'Error'})`;
}

export async function fetchUrls() {
  try {
    const res = await fetch(`${BASE_URL}/api/urls`);
    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res, body, 'Failed to fetch URLs'));
    }
    return Array.isArray(body) ? body : [];
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to backend server at port 8090. Make sure Spring Boot is running.');
    }
    throw err;
  }
}

export async function createShortUrl(data) {
  try {
    const res = await fetch(`${BASE_URL}/api/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res, body, 'Failed to create short URL'));
    }
    return body;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to backend server at port 8090.');
    }
    throw err;
  }
}

export async function fetchAnalytics(shortCode) {
  try {
    const res = await fetch(`${BASE_URL}/api/urls/${shortCode}/analytics`);
    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res, body, 'Failed to fetch analytics'));
    }
    return body;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to backend server at port 8090.');
    }
    throw err;
  }
}

export async function toggleUrlStatus(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/urls/${id}/toggle`, {
      method: 'PATCH'
    });
    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res, body, 'Failed to update URL status'));
    }
    return body;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to backend server at port 8090.');
    }
    throw err;
  }
}

export async function deleteUrl(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/urls/${id}`, {
      method: 'DELETE'
    });
    const body = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res, body, 'Failed to delete URL'));
    }
    return body;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to backend server at port 8090.');
    }
    throw err;
  }
}
