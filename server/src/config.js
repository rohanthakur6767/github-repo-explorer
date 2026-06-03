import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, validated configuration read from environment variables.
 * Keeping this in one place means the rest of the code never touches
 * `process.env` directly, which makes the app easy to test and reason about.
 */
export const config = {
  port: Number(process.env.PORT) || 4000,

  // Allowed CORS origins. Comma-separated in the env var so we can list more
  // than one (e.g. localhost during dev and the Vercel URL in production).
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Optional token. When present we send it to GitHub to lift the rate limit
  // from 60 to 5000 requests/hour. It lives only on the server, never the client.
  githubToken: process.env.GITHUB_TOKEN || '',

  // How long a cached GitHub response stays fresh.
  cacheTtlMs: Number(process.env.CACHE_TTL_MS) || 60_000,

  githubApiBase: 'https://api.github.com',
};
