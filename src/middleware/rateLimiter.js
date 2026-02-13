import rateLimit from 'express-rate-limit';
import { AUTH_CONFIG } from '../config/auth.js';

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks by limiting failed login attempts
 */
export const authRateLimiter = rateLimit({
  windowMs: AUTH_CONFIG.RATE_LIMIT.LOGIN_WINDOW_MS,
  max: AUTH_CONFIG.RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
  message: {
    success: false,
    error: '너무 많은 로그인 시도입니다. 15분 후 다시 시도하세요.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: '너무 많은 로그인 시도입니다. 15분 후 다시 시도하세요.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiter for signup attempts
 * Prevents spam account creation
 */
export const signupRateLimiter = rateLimit({
  windowMs: AUTH_CONFIG.RATE_LIMIT.SIGNUP_WINDOW_MS,
  max: AUTH_CONFIG.RATE_LIMIT.SIGNUP_MAX_ATTEMPTS,
  message: {
    success: false,
    error: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도하세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도하세요.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * General API rate limiter
 * Applies to all API routes for basic DoS protection
 */
export const generalRateLimiter = rateLimit({
  windowMs: AUTH_CONFIG.RATE_LIMIT.GENERAL_WINDOW_MS,
  max: AUTH_CONFIG.RATE_LIMIT.GENERAL_MAX_REQUESTS,
  message: {
    success: false,
    error: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
