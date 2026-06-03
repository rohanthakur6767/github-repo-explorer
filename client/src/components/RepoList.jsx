import RepoCard from './RepoCard.jsx';
import SortControl from './SortControl.jsx';

/**
 * The repository section: header with count + sort control, the list itself,
 * and a "load more" button driven by the server's pagination metadata.
 */
export default function RepoList({
  repos,
  pagination,
  sort,
  onSortChange,
  onLoadMore,
  isSorting,
  isLoadingMore,
}) {
  return (
    <section className="repos" aria-label="Repositories">
      <div className="repos__header">
        <h3 className="repos__title">
          Repositories
          {pagination && <span className="repos__count"> ({pagination.totalItems})</span>}
        </h3>
        <SortControl value={sort} onChange={onSortChange} disabled={isSorting} />
      </div>

      {repos.length === 0 ? (
        <p className="repos__empty">This user has no public repositories.</p>
      ) : (
        <>
          <ul className={`repos__list ${isSorting ? 'repos__list--busy' : ''}`}>
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </ul>

          {pagination?.hasMore && (
            <button
              type="button"
              className="repos__load-more"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
