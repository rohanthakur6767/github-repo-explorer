// Thin client for our own backend. The frontend NEVER calls GitHub directly —
// everything goes through the Node proxy so we get caching, error handling,
// and (server-side) the API token.

// Empty base => relative URLs, handled by Vite's dev proxy. In production this
// is set to the deployed backend origin via VITE_API_BASE_URL.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/** Error thrown for non-2xx responses, carrying the backend's error code. */
export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 'NETWORK_ERROR', 0);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = body.error || {};
    throw new ApiError(err.message || 'Request failed.', err.code || 'UNKNOWN', response.status);
  }
  return body;
}

/** Fetches a user's public profile. */
export function fetchUser(username) {
  return request(`/api/github/users/${encodeURIComponent(username)}`);
}

/** Fetches a sorted, paginated page of a user's repositories. */
export function fetchRepos(username, { sort = 'updated', page = 1, perPage = 30 } = {}) {
  const query = new URLSearchParams({ sort, page: String(page), perPage: String(perPage) });
  return request(`/api/github/users/${encodeURIComponent(username)}/repos?${query}`);
}
