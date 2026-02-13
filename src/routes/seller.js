import express from 'express';
import { authenticateAdmin } from './admin-auth.js';
import { orderDB, shipmentDB, returnDB, csDB, userDB } from '../db/database.js';
import db from '../db/database.js';

const router = express.Router();

// 모든 셀러센터 라우트는 관리자 인증 필요
router.use(authenticateAdmin);

// ==================== 주문 관리 ====================

/**
 * GET /api/seller/orders
 * 주문 목록 조회
 */
router.get('/orders', (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const orders = orderDB.getAllOrders(parseInt(limit), parseInt(offset), status);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('주문 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '주문 목록 조회에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/orders/:id
 * 주문 상세 조회
 */
router.get('/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = orderDB.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다'
      });
    }

    // 배송 정보도 함께 조회
    const shipment = shipmentDB.getByOrderId(id);

    res.json({
      success: true,
      data: {
        ...order,
        shipment
      }
    });
  } catch (error) {
    console.error('주문 상세 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '주문 상세 조회에 실패했습니다'
    });
  }
});

/**
 * PATCH /api/seller/orders/:id/status
 * 주문 상태 변경
 */
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refund_requested', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 상태입니다'
      });
    }

    const success = orderDB.updateOrderStatus(id, status);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '주문 상태가 변경되었습니다'
    });
  } catch (error) {
    console.error('주문 상태 변경 에러:', error);
    res.status(500).json({
      success: false,
      error: '주문 상태 변경에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/orders/stats/count
 * 주문 상태별 개수
 */
router.get('/orders/stats/count', (req, res) => {
  try {
    const stats = orderDB.getOrderCountByStatus();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('주문 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '주문 통계 조회에 실패했습니다'
    });
  }
});

// ==================== 배송 관리 ====================

/**
 * POST /api/seller/shipments
 * 배송 정보 등록/수정
 */
router.post('/shipments', (req, res) => {
  try {
    const { orderId, courier, trackingNumber } = req.body;

    if (!orderId || !courier || !trackingNumber) {
      return res.status(400).json({
        success: false,
        error: '필수 정보가 누락되었습니다'
      });
    }

    shipmentDB.upsertShipment(orderId, courier, trackingNumber);

    // 주문 상태를 '배송 중'으로 변경
    orderDB.updateOrderStatus(orderId, 'shipping');

    res.json({
      success: true,
      message: '배송 정보가 등록되었습니다'
    });
  } catch (error) {
    console.error('배송 정보 등록 에러:', error);
    res.status(500).json({
      success: false,
      error: '배송 정보 등록에 실패했습니다'
    });
  }
});

/**
 * PATCH /api/seller/shipments/:orderId/delivered
 * 배송 완료 처리
 */
router.patch('/shipments/:orderId/delivered', (req, res) => {
  try {
    const { orderId } = req.params;

    shipmentDB.markAsDelivered(orderId);
    orderDB.updateOrderStatus(orderId, 'delivered');

    res.json({
      success: true,
      message: '배송이 완료되었습니다'
    });
  } catch (error) {
    console.error('배송 완료 처리 에러:', error);
    res.status(500).json({
      success: false,
      error: '배송 완료 처리에 실패했습니다'
    });
  }
});

// ==================== 반품/취소 관리 ====================

/**
 * GET /api/seller/returns
 * 반품/취소 목록 조회
 */
router.get('/returns', (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const returns = returnDB.getAllReturns(parseInt(limit), parseInt(offset), status);

    res.json({
      success: true,
      data: returns
    });
  } catch (error) {
    console.error('반품 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '반품 목록 조회에 실패했습니다'
    });
  }
});

/**
 * PATCH /api/seller/returns/:id
 * 반품/취소 상태 변경
 */
router.patch('/returns/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminMemo } = req.body;

    const validStatuses = ['requested', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 상태입니다'
      });
    }

    const success = returnDB.updateReturnStatus(id, status, adminMemo);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '반품 요청을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '반품 상태가 변경되었습니다'
    });
  } catch (error) {
    console.error('반품 상태 변경 에러:', error);
    res.status(500).json({
      success: false,
      error: '반품 상태 변경에 실패했습니다'
    });
  }
});

// ==================== CS 문의 관리 ====================

/**
 * GET /api/seller/cs
 * CS 문의 목록 조회
 */
router.get('/cs', (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const inquiries = csDB.getAllInquiries(parseInt(limit), parseInt(offset), status);

    res.json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('CS 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: 'CS 목록 조회에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/cs/:id
 * CS 문의 상세 조회
 */
router.get('/cs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = csDB.getInquiryById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: '문의를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('CS 상세 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: 'CS 상세 조회에 실패했습니다'
    });
  }
});

/**
 * POST /api/seller/cs/:id/reply
 * CS 문의 답변
 */
router.post('/cs/:id/reply', (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        error: '답변 내용이 필요합니다'
      });
    }

    const success = csDB.replyToInquiry(id, req.admin.id, reply);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '문의를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '답변이 등록되었습니다'
    });
  } catch (error) {
    console.error('CS 답변 등록 에러:', error);
    res.status(500).json({
      success: false,
      error: 'CS 답변 등록에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/cs/stats/pending
 * 대기 중인 문의 개수
 */
router.get('/cs/stats/pending', (req, res) => {
  try {
    const count = csDB.getPendingCount();

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('CS 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: 'CS 통계 조회에 실패했습니다'
    });
  }
});

// ==================== 회원 관리 ====================

/**
 * GET /api/seller/users
 * 회원 목록 조회
 */
router.get('/users', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const users = db.prepare(`
      SELECT id, google_id, email, name, avatar_url, auth_method, email_verified, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('회원 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '회원 목록 조회에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/users/:id
 * 회원 상세 조회
 */
router.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = userDB.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '회원을 찾을 수 없습니다'
      });
    }

    // 회원의 주문 내역도 함께 조회
    const orders = db.prepare(`
      SELECT id, order_number, status, total_amount, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(id);

    res.json({
      success: true,
      data: {
        ...user,
        orders
      }
    });
  } catch (error) {
    console.error('회원 상세 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '회원 상세 조회에 실패했습니다'
    });
  }
});

/**
 * GET /api/seller/stats
 * 전체 통계
 */
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingCS = csDB.getPendingCount();
    const orderStats = orderDB.getOrderCountByStatus();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        pendingCS,
        orderStats
      }
    });
  } catch (error) {
    console.error('통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회에 실패했습니다'
    });
  }
});

export default router;
