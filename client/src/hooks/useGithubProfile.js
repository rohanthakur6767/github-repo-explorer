import { useCallback, useRef, useState } from 'react';
import { fetchUser, fetchRepos } from '../api/githubApi.js';

const PER_PAGE = 30;

/**
 * Orchestrates a profile search: fetches the user and their first page of
 * repos, then exposes actions to re-sort and load more. Sorting and paging
 * hit the backend, but the backend serves them from its 60s cache, so they
 * are cheap and never re-hit GitHub.
 *
 * Exposed status drives the UI: 'idle' | 'loading' | 'success' | 'error'.
 */
export function useGithubProfile() {
  const [status, setStatus] = useState('idle');
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort] = useState('updated');
  const [error, setError] = useState(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Tracks the active username so async actions (sort/loadMore) target it.
  const activeUser = useRef('');

  const search = useCallback(async (rawName) => {
    const username = rawName.trim();
    if (!username) return;

    activeUser.current = username;
    setStatus('loading');
    setError(null);
    setUser(null);
    setRepos([]);
    setPagination(null);
    setSort('updated');

    try {
      // Fetch the profile first; if the user doesn't exist we stop here.
      const userRes = await fetchUser(username);
      const reposRes = await fetchRepos(username, { sort: 'updated', page: 1, perPage: PER_PAGE });

      // Guard against a stale response if the user searched again meanwhile.
      if (activeUser.current !== username) return;

      setUser(userRes.user);
      setRepos(reposRes.repos);
      setPagination(reposRes.pagination);
      setStatus('success');
    } catch (err) {
      if (activeUser.current !== username) return;
      setError(err);
      setStatus('error');
    }
  }, []);

  const changeSort = useCallback(async (nextSort) => {
    if (nextSort === sort || !activeUser.current) return;
    setSort(nextSort);
    setIsSorting(true);
    try {
      const res = await fetchRepos(activeUser.current, { sort: nextSort, page: 1, perPage: PER_PAGE });
      setRepos(res.repos);
      setPagination(res.pagination);
    } catch (err) {
      setError(err);
      setStatus('error');
    } finally {
      setIsSorting(false);
    }
  }, [sort]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchRepos(activeUser.current, {
        sort,
        page: pagination.page + 1,
        perPage: PER_PAGE,
      });
      setRepos((prev) => [...prev, ...res.repos]);
      setPagination(res.pagination);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination, sort, isLoadingMore]);

  return {
    status,
    user,
    repos,
    pagination,
    sort,
    error,
    isSorting,
    isLoadingMore,
    search,
    changeSort,
    loadMore,
  };
}
