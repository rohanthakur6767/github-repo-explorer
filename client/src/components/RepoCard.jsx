import { useState } from 'react';
import { formatCount, formatDate, languageColor } from '../utils/format.js';

/**
 * A single repository. Click anywhere on the header to expand and reveal
 * extra details (open issues, default branch, fork flag). The expand uses
 * data already present in the list response, so it costs no extra requests.
 */
export default function RepoCard({ repo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="repo">
      <button
        type="button"
        className="repo__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="repo__title-row">
          <span className="repo__name">{repo.name}</span>
          {repo.isFork && <span className="repo__badge">fork</span>}
          <span className="repo__chevron" aria-hidden="true">
            {expanded ? '▾' : '▸'}
          </span>
        </div>

        {repo.description && <p className="repo__description">{repo.description}</p>}

        <div className="repo__meta">
          {repo.language && (
            <span className="repo__lang">
              <span className="repo__dot" style={{ backgroundColor: languageColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span title="Stars">★ {formatCount(repo.stars)}</span>
          <span title="Forks">⑂ {formatCount(repo.forks)}</span>
          <span className="repo__updated">Updated {formatDate(repo.updatedAt)}</span>
        </div>
      </button>

      {expanded && (
        <div className="repo__details">
          <dl>
            <div>
              <dt>Open issues</dt>
              <dd>{formatCount(repo.openIssues)}</dd>
            </div>
            <div>
              <dt>Default branch</dt>
              <dd>{repo.defaultBranch || '—'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(repo.createdAt)}</dd>
            </div>
          </dl>
          {repo.topics.length > 0 && (
            <div className="repo__topics">
              {repo.topics.map((topic) => (
                <span key={topic} className="chip chip--sm">
                  {topic}
                </span>
              ))}
            </div>
          )}
          <a
            className="repo__link"
            href={repo.htmlUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            View on GitHub →
          </a>
        </div>
      )}
    </li>
  );
}
