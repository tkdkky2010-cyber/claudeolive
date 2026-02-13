import { crawlWithRetry } from './src/crawler/oliveyoung-multi.js';
import { initializeDatabase } from './src/db/database.js';

(async () => {
  try {
    // Initialize database first
    console.log('🔧 Initializing database...');
    await initializeDatabase();

    // Parse command line arguments for categories
    const args = process.argv.slice(2);
    const categories = args.length > 0 ? args : ['전체', '스킨케어'];

    console.log(`📁 Categories to crawl: ${categories.join(', ')}\n`);

    const result = await crawlWithRetry(categories);
    console.log('\n📊 Final result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
})();
