# 셀러센터 데이터베이스 스키마 설계

## 1. admins 테이블 (관리자 전용, users와 완전 분리)
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('super_admin', 'admin', 'cs')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);
```

## 2. orders 테이블 (주문 정보)
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_number TEXT UNIQUE NOT NULL, -- 주문번호 (예: ORD-20260210-0001)
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
```

## 3. order_items 테이블 (주문 상품 상세)
```sql
CREATE TABLE order_items (
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
```

## 4. shipments 테이블 (배송 정보)
```sql
CREATE TABLE shipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER UNIQUE NOT NULL,
  courier TEXT, -- 택배사 (CJ대한통운, 우체국 등)
  tracking_number TEXT, -- 송장 번호
  shipped_at DATETIME,
  delivered_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

## 5. returns 테이블 (반품/취소 정보)
```sql
CREATE TABLE returns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('cancel', 'return', 'exchange')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN (
    'requested',  -- 요청
    'approved',   -- 승인
    'rejected',   -- 거부
    'completed'   -- 완료
  )),
  refund_amount INTEGER,
  admin_memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

## 6. cs_inquiries 테이블 (고객 문의)
```sql
CREATE TABLE cs_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER, -- 주문 관련 문의인 경우
  category TEXT NOT NULL CHECK(category IN (
    'order',    -- 주문 문의
    'product',  -- 상품 문의
    'shipping', -- 배송 문의
    'refund',   -- 환불 문의
    'etc'       -- 기타
  )),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
    'pending',   -- 답변 대기
    'answered',  -- 답변 완료
    'closed'     -- 종료
  )),
  admin_reply TEXT,
  admin_id INTEGER, -- 답변한 관리자
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);
```

## 인덱스
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_returns_order_id ON returns(order_id);
CREATE INDEX idx_cs_inquiries_user_id ON cs_inquiries(user_id);
CREATE INDEX idx_cs_inquiries_status ON cs_inquiries(status);
```
