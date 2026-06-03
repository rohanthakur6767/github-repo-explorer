/**
 * A typed error carrying an HTTP status code and a machine-readable `code`.
 * Routes and the GitHub service throw these; the central error handler turns
 * them into a consistent JSON response shape:
 *   { error: { code, message } }
 */
export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static rateLimited(message = 'GitHub API rate limit exceeded. Try again later.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static badGateway(message = 'Failed to reach GitHub.') {
    return new ApiError(502, 'UPSTREAM_ERROR', message);
  }

  static badRequest(message = 'Invalid request.') {
    return new ApiError(400, 'BAD_REQUEST', message);
  }
}
