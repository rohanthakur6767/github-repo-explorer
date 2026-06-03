import { useMemo } from 'react';
import { languageColor } from '../utils/format.js';

/**
 * A lightweight, dependency-free "chart": a stacked bar showing the
 * distribution of primary languages across the loaded repositories.
 * (Bonus feature — a visual summary of the profile's languages.)
 */
export default function LanguageBar({ repos }) {
  const segments = useMemo(() => buildSegments(repos), [repos]);

  if (segments.length === 0) return null;

  return (
    <section className="lang" aria-label="Language distribution">
      <h3 className="lang__title">Languages</h3>
      <div className="lang__bar">
        {segments.map((s) => (
          <span
            key={s.language}
            className="lang__segment"
            style={{ width: `${s.percent}%`, backgroundColor: languageColor(s.language) }}
            title={`${s.language}: ${s.percent}%`}
          />
        ))}
      </div>
      <ul className="lang__legend">
        {segments.map((s) => (
          <li key={s.language}>
            <span className="lang__dot" style={{ backgroundColor: languageColor(s.language) }} />
            {s.language} <span className="lang__pct">{s.percent}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Counts primary languages, returns the top 6 as percentages. */
function buildSegments(repos) {
  const counts = {};
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  }

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  if (total === 0) return [];

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([language, count]) => ({
      language,
      percent: Math.round((count / total) * 100),
    }));
}
