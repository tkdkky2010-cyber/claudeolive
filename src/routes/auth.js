import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter, signupRateLimiter } from '../middleware/rateLimiter.js';
import { validatePassword } from '../utils/passwordValidator.js';

const router = express.Router();

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
 * Create a new user with email and password using Supabase
 */
router.post('/signup', signupRateLimiter, async (req, res) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    // Basic validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: '올바른 이메일 형식이 아닙니다' });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, error: '비밀번호가 일치하지 않습니다' });
    }
    const passwordValidation = validatePassword(password, email, name);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: '비밀번호 요구사항을 충족하지 않습니다',
        details: passwordValidation.errors,
      });
    }

    // Use Supabase for user creation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // Custom user metadata
        },
      },
    });

    if (error) {
      // Provide more specific error messages based on Supabase codes
      if (error.message.includes('User already registered')) {
        return res.status(409).json({ success: false, error: '이미 사용 중인 이메일입니다' });
      }
      if (error.message.includes('Password should be at least 6 characters')) {
         return res.status(400).json({ success: false, error: '비밀번호는 6자 이상이어야 합니다.' });
      }
      console.error('Supabase 회원가입 에러:', error);
      return res.status(500).json({ success: false, error: '회원가입에 실패했습니다.' });
    }

    // `data.user` exists but needs email confirmation
    if (data.user && !data.session) {
      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
        data: { requiresConfirmation: true },
      });
    }
    
    // This case (user & session) is unlikely if email confirmation is on, but handle it
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: data.user,
        session: data.session,
      },
    });

  } catch (error) {
    console.error('회원가입 처리 중 에러:', error);
    res.status(500).json({ success: false, error: '서버 오류로 인해 회원가입에 실패했습니다.' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password using Supabase
 */
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use Supabase to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle Supabase-specific errors
      if (error.message === 'Invalid login credentials') {
        return res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' });
      }
      if (error.message === 'Email not confirmed') {
        return res.status(401).json({ success: false, error: '이메일 인증이 필요합니다. 받은 편지함을 확인하세요.' });
      }
      
      console.error('Supabase 로그인 에러:', error);
      return res.status(500).json({ success: false, error: '로그인에 실패했습니다' });
    }

    // On success, Supabase returns the user and session
    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name,
          avatarUrl: data.user.user_metadata.avatar_url,
        },
        session: data.session,
      },
    });

  } catch (error) {
    console.error('로그인 처리 중 에러:', error);
    res.status(500).json({ success: false, error: '로그인에 실패했습니다' });
  }
});

export default router;
