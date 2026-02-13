/**
 * Centralized authentication configuration constants
 * Single source of truth for all auth-related settings
 */

export const AUTH_CONFIG = {
  // JWT Configuration
  JWT: {
    EXPIRY: '7d',                    // Token validity period
    MIN_SECRET_LENGTH: 32,           // Minimum secret length for security
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 12,                  // Minimum password length (increased from 8)
    MAX_LENGTH: 128,                 // Maximum password length (prevent bcrypt DoS)
    BCRYPT_ROUNDS: 10,               // bcrypt cost factor (balance security vs performance)
    MIN_STRENGTH_SCORE: 3,           // Minimum zxcvbn score (0-4, 3 = strong)
    REQUIRED_PATTERNS: {
      lowercase: /[a-z]/,            // Must include lowercase letter
      uppercase: /[A-Z]/,            // Must include uppercase letter
      number: /\d/,                  // Must include number
      special: /[@$!%*#?&]/,         // Must include special character
    }
  },

  // Rate Limiting Configuration
  RATE_LIMIT: {
    // Login endpoint
    LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    LOGIN_MAX_ATTEMPTS: 5,           // 5 attempts per window

    // Signup endpoint
    SIGNUP_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    SIGNUP_MAX_ATTEMPTS: 3,           // 3 signups per hour

    // General API
    GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    GENERAL_MAX_REQUESTS: 100,        // 100 requests per window
  },

  // Account Lockout Configuration
  ACCOUNT_LOCKOUT: {
    MAX_FAILED_ATTEMPTS: 5,          // Failed attempts before lockout
    LOCKOUT_DURATION_MINUTES: 15,    // How long account stays locked
    CLEANUP_AFTER_HOURS: 24,         // Clean up old attempt records
  },

  // Email Verification Configuration
  EMAIL_VERIFICATION: {
    TOKEN_EXPIRY_HOURS: 24,          // Verification link validity
    CLEANUP_AFTER_DAYS: 7,           // Clean up expired tokens
  },

  // Security Headers (for helmet configuration)
  SECURITY_HEADERS: {
    HSTS_MAX_AGE: 31536000,          // 1 year in seconds
    CSP_DIRECTIVES: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["accounts.google.com"],
      fontSrc: ["'self'", "data:"]
    }
  },

  // Request Size Limits
  REQUEST_LIMITS: {
    JSON_PAYLOAD: '10kb',            // Max JSON payload size
    URLENCODED_PAYLOAD: '10kb',      // Max URL-encoded payload size
  }
};

/**
 * Get human-readable error messages for auth errors
 */
export const AUTH_ERRORS = {
  // JWT Errors
  JWT_SECRET_MISSING: 'SECURITY ERROR: JWT_SECRET environment variable is required. Generate with: openssl rand -base64 32',
  JWT_SECRET_DEFAULT: 'SECURITY ERROR: Default JWT_SECRET detected. Generate a new secret with: openssl rand -base64 32',
  JWT_SECRET_TOO_SHORT: (length) => `SECURITY ERROR: JWT_SECRET must be at least 32 characters long. Current length: ${length}`,

  // Auth Errors
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',
  ACCOUNT_LOCKED: '계정이 일시적으로 잠겼습니다. 15분 후 다시 시도하세요.',
  TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  TOKEN_INVALID: '유효하지 않은 인증 정보입니다',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다',

  // Email Errors
  EMAIL_INVALID: '올바른 이메일 형식이 아닙니다',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다',
  EMAIL_NOT_VERIFIED: '이메일 인증이 필요합니다',
  VERIFICATION_TOKEN_INVALID: '유효하지 않거나 만료된 인증 토큰입니다',

  // Password Errors
  PASSWORD_TOO_SHORT: '비밀번호는 최소 12자 이상이어야 합니다',
  PASSWORD_TOO_LONG: '비밀번호는 최대 128자까지 가능합니다',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
  PASSWORD_WEAK: '비밀번호가 너무 약합니다. 더 복잡한 비밀번호를 사용하세요',
  PASSWORD_REQUIREMENTS: '비밀번호 요구사항을 충족하지 않습니다',

  // Rate Limiting Errors
  RATE_LIMIT_LOGIN: '너무 많은 로그인 시도입니다. 15분 후 다시 시도하세요.',
  RATE_LIMIT_SIGNUP: '너무 많은 회원가입 시도입니다. 1시간 후 다시 시도하세요.',
  RATE_LIMIT_GENERAL: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',

  // Generic Errors
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
};

/**
 * Validate environment variables on startup
 */
export function validateAuthConfig() {
  const errors = [];

  // Check JWT_SECRET
  if (!process.env.JWT_SECRET) {
    errors.push(AUTH_ERRORS.JWT_SECRET_MISSING);
  } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push(AUTH_ERRORS.JWT_SECRET_DEFAULT);
  } else if (process.env.JWT_SECRET.length < AUTH_CONFIG.JWT.MIN_SECRET_LENGTH) {
    errors.push(AUTH_ERRORS.JWT_SECRET_TOO_SHORT(process.env.JWT_SECRET.length));
  }

  if (errors.length > 0) {
    throw new Error(`Authentication configuration errors:\n${errors.join('\n')}`);
  }

  return true;
}
