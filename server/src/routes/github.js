import { Router } from 'express';
import { ApiError } from '../errors.js';
import { sortRepos, paginate, VALID_SORTS } from '../utils/repos.js';

/**
 * Builds the /api/github router. The GitHub service is injected so this layer
 * stays thin: it validates input, calls the service, applies sorting/paging,
 * and shapes the HTTP response. Errors are passed to the central handler.
 */
export function createGithubRouter({ githubService }) {
  const router = Router();

  // Async handlers throw ApiErrors; this wrapper forwards them to Express's
  // error middleware so we don't repeat try/catch in every route.
  const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

  /**
   * GET /api/github/users/:username
   * Returns the user's public profile.
   */
  router.get(
    '/users/:username',
    asyncHandler(async (req, res) => {
      const { data, cached } = await githubService.getUser(req.params.username);
      res.set('X-Cache', cached ? 'HIT' : 'MISS');
      res.json({ user: data });
    }),
  );

  /**
   * GET /api/github/users/:username/repos
   * Query params:
   *   sort    - one of "stars" | "name" | "updated" (default "updated")
   *   page    - 1-based page number (default 1)
   *   perPage - items per page (default 30, capped at 100)
   * Returns a sorted, paginated list of the user's public repositories.
   */
  router.get(
    '/users/:username/repos',
    asyncHandler(async (req, res) => {
      const sort = req.query.sort || 'updated';
      if (!VALID_SORTS.includes(sort)) {
        throw ApiError.badRequest(`Invalid sort. Use one of: ${VALID_SORTS.join(', ')}.`);
      }

      const page = Number.parseInt(req.query.page, 10) || 1;
      const perPage = Math.min(Number.parseInt(req.query.perPage, 10) || 30, 100);

      const { data, cached } = await githubService.getUserRepos(req.params.username);
      const sorted = sortRepos(data, sort);
      const { items, pagination } = paginate(sorted, page, perPage);

      res.set('X-Cache', cached ? 'HIT' : 'MISS');
      res.json({ repos: items, pagination, sort });
    }),
  );

  return router;
}
