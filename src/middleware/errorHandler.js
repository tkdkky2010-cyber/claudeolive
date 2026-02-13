/**
 * Centralized error handling middleware
 * Provides consistent error responses across the application
 */

/**
 * Custom Application Error class
 * Use this for throwing known/expected errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguish operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = null) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Global error handler middleware
 * Should be placed after all routes
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging (don't log in production or use proper logging service)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  }

  // Handle operational errors (known errors)
  if (err.isOperational) {
    const response = {
      success: false,
      error: err.message
    };

    // Add details if available
    if (err.details) {
      response.details = err.details;
    }

    // Add retryAfter for rate limiting
    if (err instanceof RateLimitError && err.retryAfter) {
      response.retryAfter = err.retryAfter;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication token expired'
    });
  }

  // Handle SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation'
    });
  }

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.array().map(e => e.msg)
    });
  }

  // Handle unexpected errors (programming errors)
  // Don't leak error details in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

/**
 * Async handler wrapper
 * Catches errors in async route handlers and passes to error middleware
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 * Should be placed before error handler middleware
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError('Endpoint');
  next(error);
}
