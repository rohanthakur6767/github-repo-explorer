import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TtlCache } from './cache.js';

describe('TtlCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a stored value before it expires', () => {
    const cache = new TtlCache(1000);
    cache.set('key', { hello: 'world' });
    expect(cache.get('key')).toEqual({ hello: 'world' });
  });

  it('returns undefined once the entry has expired', () => {
    const cache = new TtlCache(1000);
    cache.set('key', 'value');

    vi.advanceTimersByTime(1001);

    expect(cache.get('key')).toBeUndefined();
    expect(cache.has('key')).toBe(false);
  });

  it('honours a per-entry TTL override', () => {
    const cache = new TtlCache(60_000);
    cache.set('short', 'value', 500);

    vi.advanceTimersByTime(600);

    expect(cache.get('short')).toBeUndefined();
  });
});
