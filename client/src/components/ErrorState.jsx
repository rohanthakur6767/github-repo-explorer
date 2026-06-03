// Maps backend error codes to friendly, actionable copy. Falls back to the
// server's message for anything we haven't special-cased.
const MESSAGES = {
  NOT_FOUND: {
    title: 'User not found',
    body: "We couldn't find a GitHub user with that username. Check the spelling and try again.",
  },
  RATE_LIMITED: {
    title: 'Rate limit reached',
    body: 'GitHub is temporarily limiting requests. Please wait a minute and try again.',
  },
  NETWORK_ERROR: {
    title: 'Connection problem',
    body: "We couldn't reach the server. Check your internet connection and try again.",
  },
  UPSTREAM_ERROR: {
    title: 'GitHub is unavailable',
    body: "We couldn't reach GitHub right now. Please try again shortly.",
  },
};

export default function ErrorState({ error, onRetry }) {
  const known = MESSAGES[error.code];
  const title = known?.title || 'Something went wrong';
  const body = known?.body || error.message;

  return (
    <div className="state state--error" role="alert">
      <div className="state__icon" aria-hidden="true">
        ⚠️
      </div>
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
      {onRetry && (
        <button type="button" className="state__action" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
