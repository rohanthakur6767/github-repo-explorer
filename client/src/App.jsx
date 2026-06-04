import { useCallback, useEffect, useRef } from 'react';
import { useGithubProfile } from './hooks/useGithubProfile.js';
import { useRecentSearches } from './hooks/useRecentSearches.js';

import SearchBar from './components/SearchBar.jsx';
import RecentSearches from './components/RecentSearches.jsx';
import ProfileCard from './components/ProfileCard.jsx';
import RepoList from './components/RepoList.jsx';
import LanguageBar from './components/LanguageBar.jsx';
import ErrorState from './components/ErrorState.jsx';
import WelcomeState from './components/WelcomeState.jsx';
import { ProfileSkeleton, RepoListSkeleton } from './components/Skeletons.jsx';

export default function App() {
  const {
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
  } = useGithubProfile();

  const { recents, addRecent, clearRecents } = useRecentSearches();

  // Holds the username of a *deliberate* (explicit) search awaiting its result.
  // Debounced auto-searches leave this null, so they are never remembered.
  const pendingRemember = useRef(null);

  const handleSearch = useCallback(
    (username, { explicit = false } = {}) => {
      if (explicit) pendingRemember.current = username.trim().toLowerCase();
      search(username);
    },
    [search],
  );

  // Add to Recent only when an explicit search succeeds, matching the resolved
  // login. This keeps prefixes (from debounced typing) and 404s out, and stores
  // GitHub's canonical login casing.
  useEffect(() => {
    if (status === 'success' && user && pendingRemember.current === user.login.toLowerCase()) {
      addRecent(user.login);
      pendingRemember.current = null;
    }
  }, [status, user, addRecent]);

  // A single, human-readable message announced to screen readers via aria-live.
  const statusMessage = buildStatusMessage({ status, user, repos, pagination, error });

  return (
    <div className="app">
      {/* Visually hidden live region: announces state changes to screen readers. */}
      <div className="visually-hidden" role="status" aria-live="polite">
        {statusMessage}
      </div>

      <header className="app__header">
        <div className="app__brand">
          <svg className="app__logo" viewBox="0 0 16 16" width="34" height="34" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <h1 className="app__title">GitHub Repo Explorer</h1>
        </div>
        <p className="app__subtitle">
          Search a username to browse their profile and public repositories.
        </p>
        <SearchBar onSearch={handleSearch} isLoading={status === 'loading'} />
        <RecentSearches
          recents={recents}
          onSelect={(name) => handleSearch(name, { explicit: true })}
          onClear={clearRecents}
        />
      </header>

      <main className="app__main" aria-busy={status === 'loading'}>
        {status === 'idle' && (
          <WelcomeState onExampleSelect={(name) => handleSearch(name, { explicit: true })} />
        )}

        {status === 'loading' && (
          <>
            <ProfileSkeleton />
            <RepoListSkeleton />
          </>
        )}

        {status === 'error' && error && <ErrorState error={error} />}

        {status === 'success' && user && (
          <>
            <ProfileCard user={user} />
            <LanguageBar repos={repos} />
            <RepoList
              repos={repos}
              pagination={pagination}
              sort={sort}
              onSortChange={changeSort}
              onLoadMore={loadMore}
              isSorting={isSorting}
              isLoadingMore={isLoadingMore}
            />
          </>
        )}
      </main>

      <footer className="app__footer">
        <p>
          Built for the Studio Graphene assessment · Frontend talks only to the Node backend, which
          proxies and caches the GitHub API.
        </p>
      </footer>
    </div>
  );
}

/** Builds the screen-reader announcement for the current state. */
function buildStatusMessage({ status, user, repos, pagination, error }) {
  if (status === 'loading') return 'Searching GitHub…';
  if (status === 'error') return error?.message || 'The search failed.';
  if (status === 'success' && user) {
    const count = pagination?.totalItems ?? repos.length;
    return `Showing profile for ${user.name || user.login} with ${count} public repositories.`;
  }
  return '';
}
