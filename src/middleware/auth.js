import jwt from 'jsonwebtoken';
import { userDB } from '../db/database.js';

// Enforce strong JWT secret on startup
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    'SECURITY ERROR: JWT_SECRET environment variable is required. ' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

if (JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
  throw new Error(
    'SECURITY ERROR: Default JWT_SECRET detected. This is insecure! ' +
    'Generate a new secret with: openssl rand -base64 32'
  );
}

if (JWT_SECRET.length < 32) {
  throw new Error(
    'SECURITY ERROR: JWT_SECRET must be at least 32 characters long. ' +
    'Current length: ' + JWT_SECRET.length + '. ' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await userDB.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: user not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userDB.getUserById(decoded.userId);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token valid for 7 days
  );
}

/**
 * Middleware to require email verification for protected actions
 * Should be used after authenticateToken middleware
 */
export function requireEmailVerification(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error: '이메일 인증이 필요합니다',
      requiresEmailVerification: true
    });
  }

  next();
}
