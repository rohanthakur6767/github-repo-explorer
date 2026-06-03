/** Loading placeholders shown while a search is in flight. */

export function ProfileSkeleton() {
  return (
    <section className="profile profile--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--avatar" />
      <div className="profile__body">
        <div className="skeleton skeleton--line skeleton--w50" />
        <div className="skeleton skeleton--line skeleton--w30" />
        <div className="skeleton skeleton--line skeleton--w80" />
        <div className="skeleton skeleton--line skeleton--w40" />
      </div>
    </section>
  );
}

export function RepoListSkeleton({ count = 4 }) {
  return (
    <ul className="repos__list" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="repo repo--skeleton">
          <div className="skeleton skeleton--line skeleton--w40" />
          <div className="skeleton skeleton--line skeleton--w90" />
          <div className="skeleton skeleton--line skeleton--w60" />
        </li>
      ))}
    </ul>
  );
}
