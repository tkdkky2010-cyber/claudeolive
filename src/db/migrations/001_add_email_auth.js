import Database from 'better-sqlite3';
import { dirname } from 'path';
import { existsSync } from 'fs';

// Database path from environment or default
const DB_PATH = process.env.DB_PATH || './data/oliveyoung.db';

// Check if database exists
if (!existsSync(DB_PATH)) {
  console.error('❌ Database file not found. Please run "npm run init-db" first.');
  process.exit(1);
}

// Initialize SQLite database
const db = new Database(DB_PATH);

console.log('🔧 Starting migration: Add email authentication support...');

try {
  db.transaction(() => {
    // 1. 새 users 테이블 생성
    console.log('Creating new users table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        password_hash TEXT,
        auth_method TEXT NOT NULL DEFAULT 'google' CHECK(auth_method IN ('google', 'email')),
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        email_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. 기존 데이터 마이그레이션 (Google OAuth 사용자)
    console.log('Migrating existing users...');
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

    if (existingUsers.count > 0) {
      db.exec(`
        INSERT INTO users_new (id, google_id, email, name, avatar_url, auth_method, role, email_verified, created_at)
        SELECT id, google_id, email, name, avatar_url, 'google', 'user', 1, created_at
        FROM users
      `);
      console.log(`✓ Migrated ${existingUsers.count} existing users`);
    }

    // 3. 기존 테이블 삭제 및 이름 변경
    console.log('Replacing old users table...');
    db.exec('DROP TABLE users');
    db.exec('ALTER TABLE users_new RENAME TO users');

    // 4. 인덱스 재생성
    console.log('Recreating indexes...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
  })();

  console.log('✅ Migration completed successfully');
  console.log('');
  console.log('📝 New columns added:');
  console.log('  - password_hash: 이메일 로그인용 비밀번호 해시');
  console.log('  - auth_method: 인증 방식 (google | email)');
  console.log('  - role: 사용자 역할 (user | admin)');
  console.log('  - email_verified: 이메일 인증 여부 (0 | 1)');
  console.log('');
  console.log('💡 첫 번째 Admin 계정 생성:');
  console.log('   sqlite3 ./data/oliveyoung.db "UPDATE users SET role = \'admin\' WHERE id = 1;"');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
