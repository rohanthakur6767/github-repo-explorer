import { describe, it, expect, vi } from 'vitest';
import { createGithubService } from './githubService.js';
import { TtlCache } from '../cache.js';

const config = {
  githubApiBase: 'https://api.github.com',
  githubToken: '',
  cacheTtlMs: 60_000,
};

/** Builds a fake fetch Response with the given status, body and headers. */
function fakeResponse(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

describe('githubService', () => {
  it('returns a shaped user and caches it on the second call', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      fakeResponse(200, {
        login: 'octocat',
        name: 'The Octocat',
        avatar_url: 'https://avatar',
        public_repos: 8,
        followers: 100,
        following: 5,
        html_url: 'https://github.com/octocat',
      }),
    );
    const service = createGithubService({ config, cache: new TtlCache(), fetchImpl });

    const first = await service.getUser('octocat');
    expect(first.cached).toBe(false);
    expect(first.data).toMatchObject({ login: 'octocat', publicRepos: 8, followers: 100 });

    const second = await service.getUser('octocat');
    expect(second.cached).toBe(true);
    // The cache means GitHub is only hit once.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('maps a 404 to a NOT_FOUND ApiError', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(fakeResponse(404, { message: 'Not Found' }));
    const service = createGithubService({ config, cache: new TtlCache(), fetchImpl });

    await expect(service.getUser('nope')).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });

  it('maps an exhausted rate limit to a RATE_LIMITED ApiError', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      fakeResponse(403, { message: 'rate limit' }, { 'x-ratelimit-remaining': '0' }),
    );
    const service = createGithubService({ config, cache: new TtlCache(), fetchImpl });

    await expect(service.getUser('octocat')).rejects.toMatchObject({
      statusCode: 429,
      code: 'RATE_LIMITED',
    });
  });

  it('maps a network failure to an UPSTREAM_ERROR ApiError', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const service = createGithubService({ config, cache: new TtlCache(), fetchImpl });

    await expect(service.getUser('octocat')).rejects.toMatchObject({
      statusCode: 502,
      code: 'UPSTREAM_ERROR',
    });
  });
});
