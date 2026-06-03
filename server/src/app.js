import express from 'express';
import cors from 'cors';

import { config as defaultConfig } from './config.js';
import { TtlCache } from './cache.js';
import { createGithubService } from './services/githubService.js';
import { createGithubRouter } from './routes/github.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Builds the Express app. Dependencies are injectable so tests can supply a
 * fake config/cache/service; production calls it with no arguments.
 */
export function createApp({
  config = defaultConfig,
  cache = new TtlCache(config.cacheTtlMs),
  githubService = createGithubService({ config, cache }),
} = {}) {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: config.clientOrigins,
    }),
  );

  // Lightweight health check for uptime monitors and Render.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/github', createGithubRouter({ githubService }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
