import { ApifyClient } from 'apify-client';
import { productDB, crawlLogDB } from '../db/database.js';
import dotenv from 'dotenv';
import { CATEGORIES, getCategoryUrl } from './categories.js';

console.log("Crawler script started.");

dotenv.config();

// Configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = 'DC7occaeQaijbYkkO'; // User-provided Apify Actor ID
const USER_AGENT = process.env.CRAWLER_USER_AGENT || 'OliveRankingInfoBot/1.0 (https://oliveyoung-ranking.com; crawler@oliveyoung-ranking.com)';
const REQUEST_DELAY = parseInt(process.env.CRAWLER_DELAY_MS) || 2000;
const MAX_RETRIES = parseInt(process.env.CRAWLER_MAX_RETRIES) || 3;

if (!APIFY_API_TOKEN) {
  throw new Error('APIFY_API_TOKEN is not set in the .env file.');
}

// Initialize ApifyClient
const apifyClient = new ApifyClient({
  token: APIFY_API_TOKEN,
});

/**
 * Delay execution for rate limiting (still useful for API calls if needed)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Crawl a single category using Apify Actor
 */
async function crawlCategory(category, rankingDate) {
  const targetUrl = getCategoryUrl(category);

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 Category: ${category}`);
    console.log(`📅 URL: ${targetUrl}`);
    console.log('='.repeat(60));

    // Run the Apify actor
    console.log(`🚀 Running Apify actor "${APIFY_ACTOR_ID}" for ${category}...`);
    const run = await apifyClient.actor(APIFY_ACTOR_ID).call({
      startUrls: [{ url: targetUrl }],
      // Add other input parameters required by the specific Apify actor
      // For a generic scraper, this might include:
      // proxyConfiguration: { useApifyProxy: true },
      // extractionMapping: {
      //   productName: 'h3.product-name',
      //   price: '.price',
      //   imageUrl: 'img.product-image@src',
      //   productUrl: 'a.product-link@href'
      // }
    });

    console.log(`✅ Apify actor run finished: ${run.id}. Status: ${run.status}`);

    // Get a dataset client for the actor run
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    if (items.length === 0) {
      throw new Error('Apify actor returned no products.');
    }

    // Process items from Apify actor to match productDB schema
    const products = items.map((item, index) => ({
      rank: index + 1, // Assign rank based on order in dataset
      name: item.name || item.productName || `Product ${index + 1}`,
      originalPrice: item.originalPrice || item.price,
      salePrice: item.salePrice || item.price,
      discountRate: item.discountRate || 0,
      url: item.url || item.productUrl,
      imageUrl: item.imageUrl,
      category: category,
      reviewScore: item.reviewScore || item.rating || item.score || null,
      reviewCount: item.reviewCount || item.reviewsCount || item.reviews || null,
    })).filter(p => p.name && p.url && p.salePrice); // Filter out incomplete data

    if (products.length === 0) {
      throw new Error('No valid products after processing Apify actor results.');
    }

    // Save to database
    console.log('💾 Saving to database...');
    const savedCount = await productDB.upsertProducts(products, rankingDate);

    console.log(`✅ Saved ${savedCount} products for ${category}`);

    return {
      category,
      success: true,
      count: savedCount,
      apifyRunId: run.id,
      apifyRunStatus: run.status,
    };

  } catch (error) {
    console.error(`❌ Failed to crawl ${category} using Apify:`, error.message);
    return {
      category,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Crawl all categories
 */
async function crawlAllCategories(categoriesToCrawl = ['전체', '스킨케어']) {
  const logId = await crawlLogDB.createLog();
  const results = [];
  let totalProducts = 0;

  try {
    console.log('🚀 Starting Multi-Category Crawler...');
    console.log(`👤 User-Agent: ${USER_AGENT}`);
    console.log(`📁 Categories to crawl: ${categoriesToCrawl.join(', ')}\n`);

    const rankingDate = new Date().toISOString().split('T')[0];

    // Crawl each category
    for (const category of categoriesToCrawl) {
      const result = await crawlCategory(category, rankingDate);
      results.push(result);
      if (result.success) {
        totalProducts += result.count;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWLING SUMMARY');
    console.log('='.repeat(60));
    results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      const info = r.success ? `${r.count} products` : r.error;
      console.log(`${status} ${r.category}: ${info}`);
    });
    console.log(`\n📦 Total products: ${totalProducts}`);
    console.log(`📅 Ranking date: ${rankingDate}`);
    console.log('='.repeat(60) + '\n');

    // Update crawl log
    await crawlLogDB.completeLog(logId, 'success', totalProducts);

    return {
      success: true,
      results,
      totalProducts,
      rankingDate
    };

  } catch (error) {
    console.error('❌ Crawling failed:', error);

    await crawlLogDB.completeLog(logId, 'error', totalProducts, error.message);
    
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

/**
 * Crawl with retry logic
 */
async function crawlWithRetry(categoriesToCrawl = ['전체', '스킨케어'], maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Crawl attempt ${attempt}/${maxRetries}\n`);

    const result = await crawlAllCategories(categoriesToCrawl);

    if (result.success) {
      return result;
    }

    if (attempt < maxRetries) {
      const backoffDelay = REQUEST_DELAY * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }

  throw new Error(`Crawling failed after ${maxRetries} attempts`);
}

// If run directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule || import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments for categories
  const args = process.argv.slice(2);
  const categories = args.length > 0 ? args : ['전체', '스킨케어'];

  crawlWithRetry(categories)
    .then(result => {
      console.log('\n📊 Final result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { crawlAllCategories, crawlWithRetry };