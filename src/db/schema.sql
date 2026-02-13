-- OliveYoung Ranking Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rank INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT '전체',
  product_name TEXT NOT NULL,
  original_price INTEGER,
  sale_price INTEGER NOT NULL,
  discount_rate INTEGER DEFAULT 0,
  oliveyoung_url TEXT NOT NULL,
  image_url TEXT,
  crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ranking_date DATE NOT NULL,
  UNIQUE(ranking_date, category, rank)
);

-- Index for faster queries by ranking_date
CREATE INDEX IF NOT EXISTS idx_products_ranking_date ON products(ranking_date DESC);

-- Index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Index for faster queries by rank
CREATE INDEX IF NOT EXISTS idx_products_rank ON products(rank);

-- Users Table (Google OAuth)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster user lookup
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Shopping Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- Index for faster cart queries
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);

-- Crawl Logs Table (for monitoring and debugging)
CREATE TABLE IF NOT EXISTS crawl_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  status TEXT NOT NULL CHECK(status IN ('running', 'success', 'error')),
  products_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Index for faster log queries
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at DESC);

-- Login Attempts Table (for security and account lockout)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  successful INTEGER DEFAULT 0
);

-- Index for faster login attempt queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);

-- Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
