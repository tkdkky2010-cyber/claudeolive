import { chromium } from 'playwright';
import { productDB, crawlLogDB } from '../db/database.js';
import robotsParser from 'robots-parser';
import dotenv from 'dotenv';
import { CATEGORIES, getCategoryUrl } from './categories.js';

dotenv.config();

// Configuration
const ROBOTS_TXT_URL = 'https://www.oliveyoung.co.kr/robots.txt';
const USER_AGENT = process.env.CRAWLER_USER_AGENT || 'OliveRankingInfoBot/1.0 (https://oliveyoung-ranking.com; crawler@oliveyoung-ranking.com)';
const REQUEST_DELAY = parseInt(process.env.CRAWLER_DELAY_MS) || 2000;
const MAX_RETRIES = parseInt(process.env.CRAWLER_MAX_RETRIES) || 3;

/**
 * Check robots.txt compliance
 */
async function checkRobotsTxt(targetUrl) {
  try {
    console.log('🤖 Checking robots.txt...');
    const response = await fetch(ROBOTS_TXT_URL);
    const robotsTxt = await response.text();

    const robots = robotsParser(ROBOTS_TXT_URL, robotsTxt);
    const isAllowed = robots.isAllowed(targetUrl, USER_AGENT);

    if (!isAllowed) {
      console.error('❌ CRITICAL: Crawling disallowed by robots.txt');
      console.error('   Target URL:', targetUrl);
      return false;
    }

    console.log('✅ robots.txt check passed');
    return true;
  } catch (error) {
    console.error('❌ Failed to check robots.txt:', error);
    return false;
  }
}

/**
 * Delay execution for rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract product data from the page
 */
async function extractProducts(page) {
  console.log('📊 Extracting product data...');

  // Wait for the product list to load
  await page.waitForSelector('.cate_prd_list', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll('.cate_prd_list li');
    const results = [];

    productElements.forEach((element, index) => {
      try {
        const prdInfo = element.querySelector('.prd_info');
        if (!prdInfo) return;

        // Product name
        const nameElement = prdInfo.querySelector('.prd_name a');
        const name = nameElement ? nameElement.textContent.trim() : null;

        // Product URL
        const linkElement = prdInfo.querySelector('.prd_thumb') || prdInfo.querySelector('.prd_name a');
        const url = linkElement ? linkElement.href : null;

        // Image URL
        const imgElement = element.querySelector('.prd_thumb img') || element.querySelector('img');
        let imageUrl = null;
        if (imgElement) {
          imageUrl = imgElement.src || imgElement.dataset.src || imgElement.dataset.original;
          if (imageUrl && imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          }
        }

        // Price container
        const priceContainer = prdInfo.querySelector('.prd_price');

        // Original price
        const originalPriceElement = priceContainer ? priceContainer.querySelector('del span') : null;
        const originalPriceText = originalPriceElement ? originalPriceElement.textContent.trim() : null;
        const originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : null;

        // Sale price
        const salePriceElement = priceContainer ? priceContainer.querySelector('.tx_cur span') : null;
        const salePriceText = salePriceElement ? salePriceElement.textContent.trim() : null;
        const salePrice = salePriceText ? parseInt(salePriceText.replace(/[^0-9]/g, '')) : null;

        // Discount rate
        const flagContainer = prdInfo.querySelector('.prd_flag');
        const discountElement = flagContainer ? flagContainer.querySelector('.tx_num') : null;
        const discountText = discountElement ? discountElement.textContent.trim() : '0%';
        const discountRate = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;

        // Rank
        const rank = index + 1;

        if (name && url && salePrice) {
          results.push({
            rank,
            name,
            originalPrice: originalPrice || salePrice,
            salePrice,
            discountRate,
            url,
            imageUrl
          });
        }
      } catch (error) {
        console.error(`Error extracting product at index ${index}:`, error);
      }
    });

    return results;
  });

  console.log(`✅ Extracted ${products.length} products`);
  return products;
}

/**
 * Crawl a single category
 */
async function crawlCategory(category, browser, rankingDate) {
  const targetUrl = getCategoryUrl(category);

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 Category: ${category}`);
    console.log(`📅 URL: ${targetUrl}`);
    console.log('='.repeat(60));

    // Check robots.txt
    const robotsAllowed = await checkRobotsTxt(targetUrl);
    if (!robotsAllowed) {
      throw new Error(`Crawling disallowed for category: ${category}`);
    }

    // Rate limiting delay
    console.log(`⏱️  Waiting ${REQUEST_DELAY}ms...`);
    await delay(REQUEST_DELAY);

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'DNT': '1'
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    // Navigate
    console.log('🔗 Navigating...');
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Check HTTP status
    const status = response.status();
    console.log(`📡 HTTP Status: ${status}`);

    if (status >= 400) {
      throw new Error(`HTTP error: ${status}`);
    }

    // Extract products
    const products = await extractProducts(page);

    if (products.length === 0) {
      throw new Error('No products extracted');
    }

    // Add category to each product
    const productsWithCategory = products.map(p => ({ ...p, category }));

    // Save to database
    console.log('💾 Saving to database...');
    const savedCount = await productDB.upsertProducts(productsWithCategory, rankingDate);

    console.log(`✅ Saved ${savedCount} products for ${category}`);

    await context.close();

    return {
      category,
      success: true,
      count: savedCount
    };

  } catch (error) {
    console.error(`❌ Failed to crawl ${category}:`, error.message);
    return {
      category,
      success: false,
      error: error.message
    };
  }
}

/**
 * Crawl all categories
 */
async function crawlAllCategories(categoriesToCrawl = ['전체', '스킨케어']) {
  const logId = await crawlLogDB.createLog();
  let browser = null;
  const results = [];
  let totalProducts = 0;

  try {
    console.log('🚀 Starting Multi-Category Crawler...');
    console.log(`👤 User-Agent: ${USER_AGENT}`);
    console.log(`📁 Categories to crawl: ${categoriesToCrawl.join(', ')}\n`);

    const rankingDate = new Date().toISOString().split('T')[0];

    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Crawl each category
    for (const category of categoriesToCrawl) {
      const result = await crawlCategory(category, browser, rankingDate);
      results.push(result);
      if (result.success) {
        totalProducts += result.count;
      }
    }

    // Close browser
    await browser.close();

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

    if (browser) {
      await browser.close();
    }

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
