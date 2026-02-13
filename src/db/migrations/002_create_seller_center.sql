-- 002: Create Seller Center tables
-- 관리자, 주문, 배송, 반품, CS 관련 테이블 생성

BEGIN TRANSACTION;

-- 1. admins 테이블 (관리자 전용, users와 완전 분리)
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('super_admin', 'admin', 'cs')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 2. orders 테이블 (주문 정보)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
    'pending',          -- 주문 대기
    'paid',             -- 결제 완료
    'preparing',        -- 배송 준비 중
    'shipping',         -- 배송 중
    'delivered',        -- 배송 완료
    'cancelled',        -- 취소
    'refund_requested', -- 환불 요청
    'refunded'          -- 환불 완료
  )),
  total_amount INTEGER NOT NULL,
  payment_method TEXT,
  shipping_address TEXT NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  order_memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- 3. order_items 테이블 (주문 상품 상세)
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 4. shipments 테이블 (배송 정보)
CREATE TABLE IF NOT EXISTS shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER UNIQUE NOT NULL,
  courier TEXT,
  tracking_number TEXT,
  shipped_at DATETIME,
  delivered_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

-- 5. returns 테이블 (반품/취소 정보)
CREATE TABLE IF NOT EXISTS returns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('cancel', 'return', 'exchange')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN (
    'requested',
    'approved',
    'rejected',
    'completed'
  )),
  refund_amount INTEGER,
  admin_memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

-- 6. cs_inquiries 테이블 (고객 문의)
CREATE TABLE IF NOT EXISTS cs_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  category TEXT NOT NULL CHECK(category IN ('order', 'product', 'shipping', 'refund', 'etc')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'answered', 'closed')),
  admin_reply TEXT,
  admin_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cs_inquiries_user_id ON cs_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_inquiries_status ON cs_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_cs_inquiries_created_at ON cs_inquiries(created_at DESC);

-- 7. users 테이블에서 role 관련 컬럼 제거
-- SQLite는 DROP COLUMN을 지원하지 않으므로 테이블 재생성
CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  auth_method TEXT NOT NULL DEFAULT 'google' CHECK(auth_method IN ('google', 'email')),
  email_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기존 데이터 복사 (role 컬럼 제외)
INSERT INTO users_new (id, google_id, email, name, avatar_url, password_hash, auth_method, email_verified, created_at)
SELECT id, google_id, email, name, avatar_url, password_hash, auth_method, email_verified, created_at
FROM users;

-- 기존 테이블 삭제 및 이름 변경
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);

COMMIT;
