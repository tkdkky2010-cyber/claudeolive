import express from 'express';
import { supabase } from '../config/supabase.js';
import { userDB } from '../db/database.js';
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
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ success: false, error: '회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
      }

      console.error('Supabase 회원가입 에러:', error);
      return res.status(error.status || 500).json({ success: false, error: error.message || '회원가입에 실패했습니다.' });
    }

    // `data.user` exists but needs email confirmation
    if (data.user && !data.session) {
      // Sync user to public database
      try {
        await userDB.createEmailUser(email, null, name, data.user.id);
      } catch (dbError) {
        console.error('Failed to sync user to public database:', dbError);
      }

      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.',
        data: { requiresConfirmation: true },
      });
    }

    // This case (user & session) is unlikely if email confirmation is on, but handle it
    if (data.user && data.session) {
      try {
        await userDB.createEmailUser(email, null, name, data.user.id);
      } catch (dbError) {
        console.error('Failed to sync user to public database:', dbError);
      }
    }

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
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ success: false, error: '로그인 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
      }

      console.error('Supabase 로그인 에러:', error);
      return res.status(error.status || 500).json({ success: false, error: error.message || '로그인에 실패했습니다' });
    }

    // On success, Supabase returns the user and session
    console.log('✅ Supabase login success, user ID:', data.user.id);

    // Ensure the user exists in our public database
    let user = await userDB.getUserBySupabaseId(data.user.id);
    console.log('Public DB user lookup result:', user ? 'Found' : 'Not found');

    if (!user) {
      // Sync missing user record
      console.log('Creating user in public DB:', {
        email: data.user.email,
        supabaseId: data.user.id,
        name: data.user.user_metadata?.full_name
      });

      try {
        user = await userDB.createEmailUser(data.user.email, null, data.user.user_metadata?.full_name, data.user.id);
        console.log('✅ User created in public DB:', user?.id);
      } catch (dbError) {
        console.error('❌ Failed to sync missing user record during login:', dbError);
        console.error('Error details:', JSON.stringify(dbError, null, 2));
      }
    }

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: user || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url,
        },
        session: data.session,
      },
    });

  } catch (error) {
    console.error('로그인 처리 중 에러:', error);
    res.status(500).json({ success: false, error: '로그인에 실패했습니다' });
  }
});

/**
 * POST /api/auth/sync-user
 * Sync OAuth user to public database
 */
router.post('/sync-user', async (req, res) => {
  try {
    const { supabaseId, email, name, avatarUrl } = req.body;

    console.log('🔄 Syncing user:', email);

    // Check if user exists
    let user = await userDB.getUserBySupabaseId(supabaseId);

    if (!user) {
      // Create new user
      console.log('Creating new Google user in public DB');
      user = await userDB.upsertUser(
        supabaseId,
        email,
        name || email.split('@')[0],
        avatarUrl
      );
      console.log('✅ User created:', user.id);
    } else {
      console.log('✅ User already exists:', user.id);
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/auth/google (deprecated - kept for backward compatibility)
 * Use Supabase's built-in OAuth instead
 */
router.get('/google', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:3001/api/auth/google/callback`,
    },
  });

  if (error) {
    console.error('Google OAuth 시작 에러:', error);
    return res.redirect('/login?error=google_oauth_failed');
  }

  res.redirect(data.url); // Redirect to Google's auth page
});

/**
 * GET /api/auth/google/callback
 * Handle the callback from Google OAuth
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      console.error('❌ No code in Google OAuth callback');
      return res.redirect('http://localhost:5174?error=oauth_failed');
    }

    console.log('✅ Google OAuth callback received');

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Google OAuth session exchange error:', error);
      return res.redirect('http://localhost:5174?error=oauth_failed');
    }

    console.log('✅ Google OAuth session created for user:', data.user.email);

    // Sync user to public database
    try {
      let user = await userDB.getUserBySupabaseId(data.user.id);

      if (!user) {
        console.log('Creating Google user in public DB:', data.user.email);
        user = await userDB.upsertUser(
          data.user.id, // Use Supabase ID as both google_id and supabase_id
          data.user.email,
          data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0],
          data.user.user_metadata?.avatar_url
        );
        console.log('✅ Google user synced to public DB');
      }
    } catch (dbError) {
      console.error('⚠️ Failed to sync Google user to public DB:', dbError);
      // Continue anyway - user can still use the app
    }

    // Redirect to frontend with session tokens in URL hash
    const redirectUrl = `http://localhost:5174#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=google`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect('http://localhost:5174?error=oauth_failed');
  }
});

export default router;
