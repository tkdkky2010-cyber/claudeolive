import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Admin authentication middleware
 * Verifies user is authenticated and has admin privileges
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: '인증이 필요합니다' });
        }

        const token = authHeader.substring(7);

        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다' });
        }

        // TODO: Add proper admin role verification
        // For now, assume all authenticated users are admins (NOT SECURE)
        req.admin = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
        };

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ success: false, error: '인증 처리 중 오류가 발생했습니다' });
    }
};

/**
 * POST /api/admin-auth/login
 * Admin login endpoint (placeholder for future admin auth implementation)
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
            if (error.message === 'Invalid login credentials') {
                return res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' });
            }
            console.error('Admin login error:', error);
            return res.status(500).json({ success: false, error: '로그인에 실패했습니다' });
        }

        // TODO: Add admin role verification here

        res.json({
            success: true,
            data: {
                token: data.session.access_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata.full_name,
                },
                session: data.session,
            },
        });

    } catch (error) {
        console.error('Admin login processing error:', error);
        res.status(500).json({ success: false, error: '로그인에 실패했습니다' });
    }
});

/**
 * GET /api/admin-auth/me
 * Get current authenticated admin user
 */
router.get('/me', authenticateToken, (req, res) => {
    // TODO: Verify admin role
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            isAdmin: true, // TODO: Add proper admin verification
        }
    });
});

export default router;

