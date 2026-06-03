import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gre:recent-searches';
const MAX_ITEMS = 6;

/**
 * Keeps a short list of recently searched usernames in localStorage so it
 * survives reloads. Most-recent first, de-duplicated, capped at MAX_ITEMS.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch {
      // Ignore quota/availability errors — recents are non-critical.
    }
  }, [recents]);

  const addRecent = useCallback((username) => {
    const name = username.trim();
    if (!name) return;
    setRecents((prev) => {
      const withoutDuplicate = prev.filter((r) => r.toLowerCase() !== name.toLowerCase());
      return [name, ...withoutDuplicate].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecents = useCallback(() => setRecents([]), []);

  return { recents, addRecent, clearRecents };
}
