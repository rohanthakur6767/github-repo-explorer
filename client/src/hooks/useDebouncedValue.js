import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms have
 * passed without `value` changing. Used for search-as-you-type so we fire one
 * request after the user pauses, instead of one per keystroke.
 */
export function useDebouncedValue(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Clear the pending timer on each change, so only the last one fires.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
