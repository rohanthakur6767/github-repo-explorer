/**
 * Pure helpers for ordering and paginating a repo array.
 * Kept separate from the route so the logic is trivially testable.
 */

const SORTERS = {
  stars: (a, b) => b.stars - a.stars,
  updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
};

export const VALID_SORTS = Object.keys(SORTERS);

/** Returns a new array sorted by `sort` (defaults to "updated"). */
export function sortRepos(repos, sort = 'updated') {
  const sorter = SORTERS[sort] || SORTERS.updated;
  return [...repos].sort(sorter);
}

/**
 * Slices `items` into a page and returns the slice plus pagination metadata,
 * so the frontend can implement "load more" without re-fetching from GitHub.
 */
export function paginate(items, page = 1, perPage = 30) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, perPage);
  const start = (safePage - 1) * safePerPage;
  const pageItems = items.slice(start, start + safePerPage);

  return {
    items: pageItems,
    pagination: {
      page: safePage,
      perPage: safePerPage,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / safePerPage)),
      hasMore: start + safePerPage < items.length,
    },
  };
}
