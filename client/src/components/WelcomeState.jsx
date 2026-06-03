/** The idle/empty state shown before any search has been made. */
export default function WelcomeState({ onExampleSelect }) {
  const examples = ['torvalds', 'gaearon', 'sindresorhus'];

  return (
    <div className="state state--welcome">
      <div className="state__icon" aria-hidden="true">
        🔍
      </div>
      <h2 className="state__title">Explore any GitHub profile</h2>
      <p className="state__body">
        Search for a username to see their profile and public repositories.
      </p>
      <div className="state__examples">
        <span>Try:</span>
        {examples.map((name) => (
          <button key={name} type="button" className="chip" onClick={() => onExampleSelect(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
