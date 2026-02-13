import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminDB } from '../db/database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * POST /api/admin-auth/login
 * 관리자 전용 로그인
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 관리자 조회
    const admin = adminDB.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 마지막 로그인 시간 업데이트
    adminDB.updateLastLogin(admin.id);

    // JWT 토큰 생성
    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '8h' } // 관리자는 8시간
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('관리자 로그인 에러:', error);
    res.status(500).json({
      success: false,
      error: '로그인에 실패했습니다'
    });
  }
});

/**
 * GET /api/admin-auth/me
 * 현재 로그인한 관리자 정보
 */
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin.id,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role
    }
  });
});

/**
 * 관리자 인증 미들웨어
 */
export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = adminDB.getAdminById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: admin not found'
      });
    }

    req.admin = admin;
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

export default router;
