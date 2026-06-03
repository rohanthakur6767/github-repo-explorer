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

  // Run a search and record it in the recents list.
  const handleSearch = (username) => {
    addRecent(username);
    search(username);
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">GitHub Repo Explorer</h1>
        <p className="app__subtitle">
          Search a username to browse their profile and public repositories.
        </p>
        <SearchBar onSearch={handleSearch} isLoading={status === 'loading'} />
        <RecentSearches recents={recents} onSelect={handleSearch} onClear={clearRecents} />
      </header>

      <main className="app__main">
        {status === 'idle' && <WelcomeState onExampleSelect={handleSearch} />}

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
