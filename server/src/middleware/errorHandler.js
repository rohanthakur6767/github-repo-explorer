import { ApiError } from '../errors.js';

/** 404 handler for unmatched routes. */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found.` },
  });
}

/**
 * Central error handler. Turns ApiErrors into their declared status/shape and
 * treats anything unexpected as a generic 500 (without leaking internals).
 */
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unexpected error: log it server-side, return a safe generic message.
  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
