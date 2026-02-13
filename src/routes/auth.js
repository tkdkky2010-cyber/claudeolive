import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { userDB, authDB, emailVerificationDB } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authRateLimiter, signupRateLimiter } from '../middleware/rateLimiter.js';
import { validatePassword } from '../utils/passwordValidator.js';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/**
 * POST /api/auth/google
 * Authenticate user with Google ID token
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    if (!googleClient) {
      return res.status(500).json({
        success: false,
        error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID in .env'
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Extract user information
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const avatarUrl = payload.picture;

    // Verify email is from a valid domain (optional security check)
    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email not verified by Google'
      });
    }

    // Create or update user in database
    const user = await userDB.upsertUser(googleId, email, name, avatarUrl);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);

    if (error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        error: 'ID token has expired'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid ID token'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatarUrl: req.user.avatar_url,
      createdAt: req.user.created_at
    }
  });
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // In JWT-based auth, logout is handled client-side by deleting the token
  // This endpoint exists for consistency and potential future server-side logic
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /api/auth/signup
 * Create a new user with email and password
 */
router.post('/signup', signupRateLimiter, async (req, res) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: '올바른 이메일 형식이 아닙니다'
      });
    }

    // Validate password strength using enhanced validator
    const passwordValidation = validatePassword(password, email, name);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: '비밀번호 요구사항을 충족하지 않습니다',
        details: passwordValidation.errors
      });
    }

    // Check password confirmation
    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 일치하지 않습니다'
      });
    }

    // Check if email already exists
    const existingUser = await userDB.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 이메일입니다'
      });
    }

    // Hash password with bcrypt (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await userDB.createEmailUser(email, passwordHash, name);

    // Generate and send verification email
    const verificationToken = generateVerificationToken();
    await emailVerificationDB.createToken(user.id, verificationToken);

    // Send verification email (non-blocking)
    sendVerificationEmail(email, verificationToken, name).catch(err => {
      console.error('Failed to send verification email:', err.message);
      // Don't fail signup if email fails - user can request resend
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified
        }
      },
      message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.'
    });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({
      success: false,
      error: '회원가입에 실패했습니다'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify user's email with token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: '인증 토큰이 필요합니다'
      });
    }

    // Use the token (validates expiry and marks as used)
    const tokenData = await emailVerificationDB.useToken(token);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않거나 만료된 인증 토큰입니다'
      });
    }

    // Get updated user data
    const user = await userDB.getUserById(tokenData.user_id);

    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified
        }
      }
    });
  } catch (error) {
    console.error('이메일 인증 에러:', error);
    res.status(500).json({
      success: false,
      error: '이메일 인증에 실패했습니다'
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email to authenticated user
 */
router.post('/resend-verification', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: '이미 인증된 이메일입니다'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    await emailVerificationDB.createToken(user.id, verificationToken);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.name);

    res.json({
      success: true,
      message: '인증 이메일이 재전송되었습니다'
    });
  } catch (error) {
    console.error('인증 이메일 재전송 에러:', error);
    res.status(500).json({
      success: false,
      error: '인증 이메일 재전송에 실패했습니다'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if account is locked due to too many failed attempts
    const failedAttempts = await authDB.getRecentFailedAttempts(email);
    if (failedAttempts.count >= 5) {
      return res.status(429).json({
        success: false,
        error: '계정이 일시적으로 잠겼습니다. 15분 후 다시 시도하세요.',
        locked: true
      });
    }

    // Find user by email
    const user = await userDB.getUserByEmail(email);

    // Dummy hash for constant-time comparison to prevent user enumeration via timing attack
    // This is a bcrypt hash of 'dummy-password' with cost factor 10
    const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    // Always perform bcrypt comparison, even if user doesn't exist
    // This prevents timing attacks that could reveal whether an email is registered
    const hashToCompare = (user && user.auth_method === 'email')
      ? user.password_hash
      : dummyHash;

    const isValidPassword = await bcrypt.compare(password, hashToCompare);

    // Check all conditions together to prevent timing leaks
    if (!user || user.auth_method !== 'email' || !isValidPassword) {
      // Record failed login attempt
      await authDB.recordLoginAttempt(email, ipAddress, false);

      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // Clear failed attempts on successful login
    await authDB.clearLoginAttempts(email);

    // Record successful login attempt
    await authDB.recordLoginAttempt(email, ipAddress, true);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({
      success: false,
      error: '로그인에 실패했습니다'
    });
  }
});

export default router;
