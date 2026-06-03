import { useState } from 'react';

/**
 * Controlled search input. Submits the trimmed username on form submit
 * (Enter or button click). Disabled while a search is in flight.
 */
export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const username = value.trim();
    if (username) onSearch(username);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="username" className="visually-hidden">
        GitHub username
      </label>
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
      <button type="submit" className="search-bar__button" disabled={isLoading || !value.trim()}>
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
