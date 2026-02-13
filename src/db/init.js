import { initializeDatabase } from './database.js';

/**
 * Standalone script to initialize the database
 * Run: npm run init-db
 */

console.log('🚀 Initializing database...');

(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();
