import { ApiError } from '../errors.js';

/**
 * Maps a raw GitHub user object to the lean shape our frontend consumes.
 * We deliberately pick only the fields we render, so the API contract is
 * explicit and we don't leak GitHub's entire payload to the client.
 */
function shapeUser(raw) {
  return {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    company: raw.company,
    location: raw.location,
    blog: raw.blog,
    followers: raw.followers,
    following: raw.following,
    publicRepos: raw.public_repos,
    htmlUrl: raw.html_url,
    createdAt: raw.created_at,
  };
}

/** Maps a raw GitHub repository to the fields the frontend renders. */
function shapeRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    openIssues: raw.open_issues_count,
    defaultBranch: raw.default_branch,
    htmlUrl: raw.html_url,
    isFork: raw.fork,
    topics: raw.topics || [],
    updatedAt: raw.updated_at,
    createdAt: raw.created_at,
  };
}

/**
 * Creates the GitHub service. Dependencies (config, cache, fetch) are injected
 * so the service can be unit-tested with a fake fetch and an isolated cache.
 */
export function createGithubService({ config, cache, fetchImpl = fetch }) {
  /**
   * Low-level GitHub request. Adds required headers (and the optional token),
   * and translates HTTP/network failures into typed ApiErrors.
   */
  async function githubRequest(path) {
    const headers = {
      Accept: 'application/vnd.github+json',
      // GitHub requires a User-Agent header on every request.
      'User-Agent': 'github-repo-explorer',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (config.githubToken) {
      headers.Authorization = `Bearer ${config.githubToken}`;
    }

    let response;
    try {
      response = await fetchImpl(`${config.githubApiBase}${path}`, { headers });
    } catch (cause) {
      // DNS failure, connection refused, etc.
      throw ApiError.badGateway('Could not connect to GitHub. Check your network and try again.');
    }

    if (response.ok) {
      return response.json();
    }

    // Rate limiting: GitHub returns 403 (or 429) with the remaining count at 0.
    const remaining = response.headers.get('x-ratelimit-remaining');
    if ((response.status === 403 || response.status === 429) && remaining === '0') {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetMessage = resetHeader
        ? ` Limit resets at ${new Date(Number(resetHeader) * 1000).toUTCString()}.`
        : '';
      throw ApiError.rateLimited(`GitHub API rate limit exceeded.${resetMessage}`);
    }

    if (response.status === 404) {
      throw ApiError.notFound('No GitHub user found with that username.');
    }

    throw ApiError.badGateway(`GitHub responded with status ${response.status}.`);
  }

  /** Fetches and caches a user's public profile. */
  async function getUser(username) {
    const cacheKey = `user:${username.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return { data: cached, cached: true };

    const raw = await githubRequest(`/users/${encodeURIComponent(username)}`);
    const data = shapeUser(raw);
    cache.set(cacheKey, data);
    return { data, cached: false };
  }

  /**
   * Fetches and caches all of a user's public repositories.
   *
   * We pull up to MAX_PAGES pages of 100 so that sorting (by stars in
   * particular) is accurate across the whole set rather than just one page.
   * The route layer handles sorting and pagination of this cached array.
   */
  async function getUserRepos(username) {
    const cacheKey = `repos:${username.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return { data: cached, cached: true };

    const PER_PAGE = 100;
    const MAX_PAGES = 3; // Cap at 300 repos to bound work and rate-limit cost.
    const repos = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const batch = await githubRequest(
        `/users/${encodeURIComponent(username)}/repos?per_page=${PER_PAGE}&page=${page}&sort=updated`,
      );
      repos.push(...batch.map(shapeRepo));
      if (batch.length < PER_PAGE) break; // Last page reached.
    }

    cache.set(cacheKey, repos);
    return { data: repos, cached: false };
  }

  return { getUser, getUserRepos };
}
