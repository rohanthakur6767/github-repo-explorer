/**
 * Renders the recently-searched usernames as clickable chips.
 * Renders nothing when there is no history.
 */
export default function RecentSearches({ recents, onSelect, onClear }) {
  if (recents.length === 0) return null;

  return (
    <div className="recent">
      <div className="recent__header">
        <span className="recent__label">Recent</span>
        <button type="button" className="recent__clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="recent__chips">
        {recents.map((name) => (
          <button key={name} type="button" className="chip" onClick={() => onSelect(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
