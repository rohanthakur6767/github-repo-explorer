/** Formats a count compactly: 1500 -> "1.5k", 2_300_000 -> "2.3M". */
export function formatCount(n) {
  if (n === null || n === undefined) return '0';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** Formats an ISO date as a readable relative-ish label, e.g. "Updated 3 May 2024". */
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// A small, stable colour map for the most common languages so the language
// bar looks consistent. Anything else falls back to a neutral grey.
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Dart: '#00B4AB',
};

export function languageColor(language) {
  return LANGUAGE_COLORS[language] || '#9aa4b2';
}
