/**
 * A tiny in-memory cache with per-entry time-to-live (TTL).
 *
 * The brief asks that repeated requests for the same username within 60s be
 * served from cache instead of hitting GitHub again. This satisfies that and
 * also protects GitHub's rate limit. An in-memory Map is sufficient for a
 * single-instance app; a real multi-instance deployment would use Redis.
 */
export class TtlCache {
  constructor(defaultTtlMs = 60_000) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  /**
   * Returns the cached value for `key`, or `undefined` if missing or expired.
   * Expired entries are removed lazily on access.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /** Stores `value` under `key`, expiring after `ttlMs` (or the default). */
  set(key, value, ttlMs = this.defaultTtlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** True if a fresh (non-expired) entry exists for `key`. */
  has(key) {
    return this.get(key) !== undefined;
  }

  clear() {
    this.store.clear();
  }
}
