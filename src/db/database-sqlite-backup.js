import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path from environment or default
const DB_PATH = process.env.DB_PATH || './data/oliveyoung.db';

// Ensure data directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema
 */
export function initializeDatabase() {
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema (split by semicolon and filter empty statements)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      db.exec(statement);
    }

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * Product-related database operations
 */
export const productDB = {
  /**
   * Insert or update products for a specific ranking date
   * Uses UPSERT logic to handle re-crawled data
   */
  upsertProducts: (products, rankingDate) => {
    const stmt = db.prepare(`
      INSERT INTO products (rank, category, product_name, original_price, sale_price, discount_rate, oliveyoung_url, image_url, ranking_date, crawled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(ranking_date, category, rank) DO UPDATE SET
        product_name = excluded.product_name,
        original_price = excluded.original_price,
        sale_price = excluded.sale_price,
        discount_rate = excluded.discount_rate,
        oliveyoung_url = excluded.oliveyoung_url,
        image_url = excluded.image_url,
        crawled_at = excluded.crawled_at
    `);

    const insertMany = db.transaction((products) => {
      for (const product of products) {
        stmt.run(
          product.rank,
          product.category || '전체',
          product.name,
          product.originalPrice,
          product.salePrice,
          product.discountRate,
          product.url,
          product.imageUrl || null,
          rankingDate
        );
      }
    });

    insertMany(products);
    return products.length;
  },

  /**
   * Get all products for the most recent ranking date
   * Filter by category (including '전체')
   */
  getLatestProducts: (category = null) => {
    // If no category specified, return all
    if (!category) {
      return db.prepare(`
        SELECT
          id,
          rank,
          category,
          product_name as name,
          original_price as originalPrice,
          sale_price as salePrice,
          discount_rate as discountRate,
          oliveyoung_url as url,
          image_url as imageUrl,
          ranking_date as rankingDate,
          crawled_at as crawledAt
        FROM products
        WHERE ranking_date = (SELECT MAX(ranking_date) FROM products)
        ORDER BY category, rank ASC
      `).all();
    }

    // Filter by specific category (including '전체')
    return db.prepare(`
      SELECT
        id,
        rank,
        category,
        product_name as name,
        original_price as originalPrice,
        sale_price as salePrice,
        discount_rate as discountRate,
        oliveyoung_url as url,
        image_url as imageUrl,
        ranking_date as rankingDate,
        crawled_at as crawledAt
      FROM products
      WHERE ranking_date = (SELECT MAX(ranking_date) FROM products)
        AND category = ?
      ORDER BY rank ASC
    `).all(category);
  },

  /**
   * Get a single product by ID
   */
  getProductById: (id) => {
    return db.prepare(`
      SELECT
        id,
        rank,
        category,
        product_name as name,
        original_price as originalPrice,
        sale_price as salePrice,
        discount_rate as discountRate,
        oliveyoung_url as url,
        image_url as imageUrl,
        ranking_date as rankingDate,
        crawled_at as crawledAt
      FROM products
      WHERE id = ?
    `).get(id);
  },

  /**
   * Get products by ranking date
   * Filter by category (including '전체')
   */
  getProductsByDate: (rankingDate, category = null) => {
    // If no category specified, return all
    if (!category) {
      return db.prepare(`
        SELECT
          id,
          rank,
          category,
          product_name as name,
          original_price as originalPrice,
          sale_price as salePrice,
          discount_rate as discountRate,
          oliveyoung_url as url,
          image_url as imageUrl,
          ranking_date as rankingDate,
          crawled_at as crawledAt
        FROM products
        WHERE ranking_date = ?
        ORDER BY category, rank ASC
      `).all(rankingDate);
    }

    // Filter by specific category (including '전체')
    return db.prepare(`
      SELECT
        id,
        rank,
        category,
        product_name as name,
        original_price as originalPrice,
        sale_price as salePrice,
        discount_rate as discountRate,
        oliveyoung_url as url,
        image_url as imageUrl,
        ranking_date as rankingDate,
        crawled_at as crawledAt
      FROM products
      WHERE ranking_date = ? AND category = ?
      ORDER BY rank ASC
    `).all(rankingDate, category);
  }
};

/**
 * User-related database operations
 */
export const userDB = {
  /**
   * Create or update user from Google OAuth
   */
  upsertUser: (googleId, email, name, avatarUrl) => {
    const stmt = db.prepare(`
      INSERT INTO users (google_id, email, name, avatar_url)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(google_id) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        avatar_url = excluded.avatar_url
    `);

    stmt.run(googleId, email, name, avatarUrl);

    return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
  },

  /**
   * Get user by Google ID
   */
  getUserByGoogleId: (googleId) => {
    return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
  },

  /**
   * Get user by ID
   */
  getUserById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  /**
   * Get user by email
   */
  getUserByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  /**
   * Create email user (for email-based signup)
   */
  createEmailUser: (email, passwordHash, name = null) => {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, auth_method, role, email_verified)
      VALUES (?, ?, ?, 'email', 'user', 0)
    `);
    const result = stmt.run(email, passwordHash, name);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  },

  /**
   * Update user role (admin management)
   */
  updateUserRole: (userId, role) => {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    const result = stmt.run(role, userId);
    return result.changes > 0;
  }
};

/**
 * Cart-related database operations
 */
export const cartDB = {
  /**
   * Get all cart items for a user
   */
  getCartItems: (userId) => {
    return db.prepare(`
      SELECT
        c.id,
        c.quantity,
        c.created_at as createdAt,
        p.id as productId,
        p.rank,
        p.category,
        p.product_name as name,
        p.original_price as originalPrice,
        p.sale_price as salePrice,
        p.discount_rate as discountRate,
        p.oliveyoung_url as url,
        p.image_url as imageUrl
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(userId);
  },

  /**
   * Add item to cart (or update quantity if already exists)
   */
  addToCart: (userId, productId, quantity = 1) => {
    const stmt = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET
        quantity = quantity + excluded.quantity
    `);

    const result = stmt.run(userId, productId, quantity);
    return result.changes > 0;
  },

  /**
   * Update cart item quantity
   */
  updateQuantity: (cartItemId, userId, quantity) => {
    const stmt = db.prepare(`
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(quantity, cartItemId, userId);
    return result.changes > 0;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: (cartItemId, userId) => {
    const stmt = db.prepare(`
      DELETE FROM cart_items
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(cartItemId, userId);
    return result.changes > 0;
  },

  /**
   * Clear all cart items for a user
   */
  clearCart: (userId) => {
    const stmt = db.prepare('DELETE FROM cart_items WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
  }
};

/**
 * Crawl log-related database operations
 */
export const crawlLogDB = {
  /**
   * Create a new crawl log entry
   */
  createLog: () => {
    const stmt = db.prepare(`
      INSERT INTO crawl_logs (started_at, status)
      VALUES (datetime('now'), 'running')
    `);

    const result = stmt.run();
    return result.lastInsertRowid;
  },

  /**
   * Update crawl log on completion
   */
  completeLog: (logId, status, productsCount = 0, errorMessage = null) => {
    const stmt = db.prepare(`
      UPDATE crawl_logs
      SET completed_at = datetime('now'),
          status = ?,
          products_count = ?,
          error_message = ?
      WHERE id = ?
    `);

    stmt.run(status, productsCount, errorMessage, logId);
  },

  /**
   * Get recent crawl logs
   */
  getRecentLogs: (limit = 10) => {
    return db.prepare(`
      SELECT *
      FROM crawl_logs
      ORDER BY started_at DESC
      LIMIT ?
    `).all(limit);
  }
};

/**
 * Admin-related database operations (Seller Center)
 */
export const adminDB = {
  /**
   * Get admin by email
   */
  getAdminByEmail: (email) => {
    return db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  },

  /**
   * Get admin by ID
   */
  getAdminById: (id) => {
    return db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
  },

  /**
   * Update last login time
   */
  updateLastLogin: (adminId) => {
    const stmt = db.prepare('UPDATE admins SET last_login_at = datetime(\'now\') WHERE id = ?');
    stmt.run(adminId);
  }
};

/**
 * Order-related database operations
 */
export const orderDB = {
  /**
   * Get all orders with pagination
   */
  getAllOrders: (limit = 50, offset = 0, status = null) => {
    let query = `
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;

    if (status) {
      query += ` WHERE o.status = ?`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;

    if (status) {
      return db.prepare(query).all(status, limit, offset);
    }
    return db.prepare(query).all(limit, offset);
  },

  /**
   * Get order by ID with items
   */
  getOrderById: (orderId) => {
    const order = db.prepare(`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(orderId);

    if (!order) return null;

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(orderId);

    return { ...order, items };
  },

  /**
   * Update order status
   */
  updateOrderStatus: (orderId, status) => {
    const stmt = db.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
    `);
    const result = stmt.run(status, orderId);
    return result.changes > 0;
  },

  /**
   * Get order count by status
   */
  getOrderCountByStatus: () => {
    return db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();
  }
};

/**
 * Shipment-related database operations
 */
export const shipmentDB = {
  /**
   * Create or update shipment
   */
  upsertShipment: (orderId, courier, trackingNumber) => {
    const stmt = db.prepare(`
      INSERT INTO shipments (order_id, courier, tracking_number, shipped_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(order_id) DO UPDATE SET
        courier = excluded.courier,
        tracking_number = excluded.tracking_number,
        shipped_at = datetime('now')
    `);
    stmt.run(orderId, courier, trackingNumber);
  },

  /**
   * Get shipment by order ID
   */
  getByOrderId: (orderId) => {
    return db.prepare('SELECT * FROM shipments WHERE order_id = ?').get(orderId);
  },

  /**
   * Mark as delivered
   */
  markAsDelivered: (orderId) => {
    const stmt = db.prepare(`
      UPDATE shipments SET delivered_at = datetime('now') WHERE order_id = ?
    `);
    stmt.run(orderId);
  }
};

/**
 * Return-related database operations
 */
export const returnDB = {
  /**
   * Get all returns
   */
  getAllReturns: (limit = 50, offset = 0, status = null) => {
    let query = `
      SELECT r.*, o.order_number, u.email as user_email
      FROM returns r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON o.user_id = u.id
    `;

    if (status) {
      query += ` WHERE r.status = ?`;
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;

    if (status) {
      return db.prepare(query).all(status, limit, offset);
    }
    return db.prepare(query).all(limit, offset);
  },

  /**
   * Update return status
   */
  updateReturnStatus: (returnId, status, adminMemo = null) => {
    const stmt = db.prepare(`
      UPDATE returns
      SET status = ?, admin_memo = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(status, adminMemo, returnId);
    return result.changes > 0;
  }
};

/**
 * Email Verification database operations
 */
export const emailVerificationDB = {
  /**
   * Create a new email verification token
   */
  createToken: (userId, token) => {
    const stmt = db.prepare(`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (?, ?, datetime('now', '+24 hours'))
    `);
    stmt.run(userId, token);
  },

  /**
   * Get token details by token string
   */
  getToken: (token) => {
    return db.prepare(`
      SELECT * FROM email_verification_tokens
      WHERE token = ?
    `).get(token);
  },

  /**
   * Verify and use a token
   */
  useToken: (token) => {
    const tokenData = db.prepare(`
      SELECT * FROM email_verification_tokens
      WHERE token = ?
        AND used = 0
        AND expires_at > datetime('now')
    `).get(token);

    if (!tokenData) {
      return null;
    }

    // Mark token as used
    db.prepare(`
      UPDATE email_verification_tokens
      SET used = 1, used_at = datetime('now')
      WHERE id = ?
    `).run(tokenData.id);

    // Mark user as verified
    db.prepare(`
      UPDATE users
      SET email_verified = 1
      WHERE id = ?
    `).run(tokenData.user_id);

    return tokenData;
  },

  /**
   * Clean up expired tokens (older than 7 days)
   */
  cleanupExpiredTokens: () => {
    const stmt = db.prepare(`
      DELETE FROM email_verification_tokens
      WHERE expires_at < datetime('now', '-7 days')
    `);
    const result = stmt.run();
    return result.changes;
  }
};

/**
 * Authentication-related database operations (login attempts, account lockout)
 */
export const authDB = {
  /**
   * Get count of recent failed login attempts for an email
   */
  getRecentFailedAttempts: (email) => {
    return db.prepare(`
      SELECT COUNT(*) as count
      FROM login_attempts
      WHERE email = ?
        AND successful = 0
        AND attempted_at > datetime('now', '-15 minutes')
    `).get(email);
  },

  /**
   * Record a login attempt (successful or failed)
   */
  recordLoginAttempt: (email, ipAddress, successful) => {
    const stmt = db.prepare(`
      INSERT INTO login_attempts (email, ip_address, successful, attempted_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    stmt.run(email, ipAddress, successful ? 1 : 0);
  },

  /**
   * Clear all login attempts for an email (after successful login or timeout)
   */
  clearLoginAttempts: (email) => {
    const stmt = db.prepare('DELETE FROM login_attempts WHERE email = ?');
    stmt.run(email);
  },

  /**
   * Clean up old login attempts (older than 24 hours)
   */
  cleanupOldAttempts: () => {
    const stmt = db.prepare(`
      DELETE FROM login_attempts
      WHERE attempted_at < datetime('now', '-24 hours')
    `);
    const result = stmt.run();
    return result.changes;
  }
};

/**
 * CS Inquiry-related database operations
 */
export const csDB = {
  /**
   * Get all inquiries
   */
  getAllInquiries: (limit = 50, offset = 0, status = null) => {
    let query = `
      SELECT c.*, u.email as user_email, u.name as user_name
      FROM cs_inquiries c
      JOIN users u ON c.user_id = u.id
    `;

    if (status) {
      query += ` WHERE c.status = ?`;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;

    if (status) {
      return db.prepare(query).all(status, limit, offset);
    }
    return db.prepare(query).all(limit, offset);
  },

  /**
   * Get inquiry by ID
   */
  getInquiryById: (inquiryId) => {
    return db.prepare(`
      SELECT c.*, u.email as user_email, u.name as user_name
      FROM cs_inquiries c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(inquiryId);
  },

  /**
   * Reply to inquiry
   */
  replyToInquiry: (inquiryId, adminId, reply) => {
    const stmt = db.prepare(`
      UPDATE cs_inquiries
      SET admin_reply = ?, admin_id = ?, status = 'answered', answered_at = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(reply, adminId, inquiryId);
    return result.changes > 0;
  },

  /**
   * Get pending inquiry count
   */
  getPendingCount: () => {
    return db.prepare(`SELECT COUNT(*) as count FROM cs_inquiries WHERE status = 'pending'`).get().count;
  }
};

// Export database instance for custom queries if needed
export default db;
