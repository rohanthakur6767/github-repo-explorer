import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

const MIN_CHARS = 2;

/**
 * Controlled search input with two ways to trigger a search:
 *  1. Submit (Enter / button) — searches immediately.
 *  2. Debounced search-as-you-type — searches ~500ms after the user stops
 *     typing, once at least MIN_CHARS characters are entered.
 *
 * A ref tracks the last term we searched for, so submitting a term we already
 * auto-searched doesn't fire a duplicate request.
 */
export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value, 500);
  const lastSearched = useRef('');

  // `explicit` marks a deliberate search (submit) vs. a debounced auto-search.
  // Only explicit searches are remembered in the Recent list (handled by App),
  // so half-typed prefixes the user paused on don't pollute it.
  const runSearch = (term, explicit) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    if (!explicit && trimmed === lastSearched.current) return; // skip duplicate auto-search
    lastSearched.current = trimmed;
    onSearch(trimmed, { explicit });
  };

  // Debounced auto-search after the user pauses typing.
  useEffect(() => {
    const term = debounced.trim();
    if (term.length >= MIN_CHARS) runSearch(term, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value.trim()) runSearch(value, true);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="username" className="visually-hidden">
        GitHub username
      </label>
      <div className="search-bar__field">
        <svg className="search-bar__icon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.49-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
          />
        </svg>
        <input
          id="username"
          type="text"
          className="search-bar__input"
          placeholder="Enter a GitHub username, e.g. torvalds"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
      <button type="submit" className="search-bar__button" disabled={isLoading || !value.trim()}>
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
