import { formatCount } from '../utils/format.js';

/** Displays a user's avatar, identity, bio, and headline stats. */
export default function ProfileCard({ user }) {
  return (
    <section className="profile" aria-label="GitHub profile">
      <img
        className="profile__avatar"
        src={user.avatarUrl}
        alt={`${user.login}'s avatar`}
        width="120"
        height="120"
        loading="lazy"
      />
      <div className="profile__body">
        <div className="profile__identity">
          <h2 className="profile__name">{user.name || user.login}</h2>
          <a
            className="profile__login"
            href={user.htmlUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            @{user.login}
          </a>
        </div>

        {user.bio && <p className="profile__bio">{user.bio}</p>}

        <ul className="profile__stats">
          <li>
            <strong>{formatCount(user.followers)}</strong> followers
          </li>
          <li>
            <strong>{formatCount(user.following)}</strong> following
          </li>
          <li>
            <strong>{formatCount(user.publicRepos)}</strong> repos
          </li>
        </ul>

        <ul className="profile__meta">
          {user.company && <li>🏢 {user.company}</li>}
          {user.location && <li>📍 {user.location}</li>}
          {user.blog && (
            <li>
              🔗{' '}
              <a href={normalizeUrl(user.blog)} target="_blank" rel="noreferrer noopener">
                {user.blog}
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

/** GitHub blog fields are sometimes missing the protocol. */
function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
