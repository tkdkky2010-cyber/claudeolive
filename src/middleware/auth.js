import { supabase } from '../config/supabase.js';
import { userDB } from '../db/database.js';

/**
 * Verify JWT token and attach user to request
 * Using Supabase's own verification logic for reliability
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
    // Use Supabase to verify the token and get the user
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      console.error('JWT verification error:', error);
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get additional user data from our database if needed
    // The user id in the token corresponds to the Supabase auth.users id
    const user = await userDB.getUserById(authUser.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: user details not found in database'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication internal error'
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
    const { data: { user: authUser } } = await supabase.auth.getUser(token);
    if (!authUser) {
      req.user = null;
      return next();
    }
    const user = await userDB.getUserById(authUser.id);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Generate JWT token for a user
 * Note: This might not be needed if relying solely on Supabase tokens,
 * but kept for legacy support/internal usage.
 */
export function generateToken(userId) {
  // If we still need custom tokens, they should be clearly distinguished
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware to require email verification for protected actions
 * Should be used after authenticateToken middleware
 * NOTE: Checks Supabase auth state directly to avoid sync issues
 */
export async function requireEmailVerification(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  try {
    // Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Check Supabase auth state directly (more reliable than public.users table)
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

      if (!error && authUser && authUser.email_confirmed_at) {
        // User is verified in Supabase auth - allow access
        // Also sync the public.users table for consistency
        if (!req.user.email_verified) {
          try {
            await userDB.updateEmailVerification(req.user.id, true);
          } catch (syncError) {
            console.warn('Failed to sync email verification status:', syncError);
          }
        }
        return next();
      }
    }

    // Fallback to checking public.users table
    if (req.user.email_verified) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: '이메일 인증이 필요합니다',
      requiresEmailVerification: true
    });
  } catch (error) {
    console.error('Email verification check error:', error);
    return res.status(500).json({
      success: false,
      error: '인증 확인 중 오류가 발생했습니다'
    });
  }
}
