import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { ApiError } from '../errors.js';

/** A fake GitHub service so route tests never touch the network. */
function makeFakeService() {
  const repos = [
    { id: 1, name: 'zeta', stars: 5, updatedAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'alpha', stars: 50, updatedAt: '2024-03-01T00:00:00Z' },
    { id: 3, name: 'mid', stars: 20, updatedAt: '2024-02-01T00:00:00Z' },
  ];
  return {
    getUser: async (username) => {
      if (username === 'ghost') throw ApiError.notFound('No GitHub user found with that username.');
      return { data: { login: username, publicRepos: 3 }, cached: false };
    },
    getUserRepos: async () => ({ data: repos, cached: false }),
  };
}

function buildApp() {
  return createApp({
    config: { clientOrigins: ['*'], cacheTtlMs: 1000 },
    githubService: makeFakeService(),
  });
}

describe('GET /api/github/users/:username', () => {
  it('returns the user profile', async () => {
    const res = await request(buildApp()).get('/api/github/users/octocat');
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ login: 'octocat', publicRepos: 3 });
  });

  it('returns a 404 with the standard error shape for a missing user', async () => {
    const res = await request(buildApp()).get('/api/github/users/ghost');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('GET /api/github/users/:username/repos', () => {
  it('sorts by stars (highest first)', async () => {
    const res = await request(buildApp()).get('/api/github/users/octocat/repos?sort=stars');
    expect(res.status).toBe(200);
    expect(res.body.repos.map((r) => r.stars)).toEqual([50, 20, 5]);
  });

  it('sorts by name alphabetically', async () => {
    const res = await request(buildApp()).get('/api/github/users/octocat/repos?sort=name');
    expect(res.body.repos.map((r) => r.name)).toEqual(['alpha', 'mid', 'zeta']);
  });

  it('paginates and reports hasMore correctly', async () => {
    const res = await request(buildApp()).get('/api/github/users/octocat/repos?perPage=2&page=1');
    expect(res.body.repos).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ totalItems: 3, totalPages: 2, hasMore: true });
  });

  it('rejects an invalid sort with 400', async () => {
    const res = await request(buildApp()).get('/api/github/users/octocat/repos?sort=bogus');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
});
