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
 * This function verifies that we're allowed to crawl the target page
 * Uses robots-parser library for proper validation
 */
async function checkRobotsTxt(targetUrl) {
  try {
    console.log('🤖 Checking robots.txt...');
    const response = await fetch(ROBOTS_TXT_URL);
    const robotsTxt = await response.text();

    // Use proper robots.txt parser with wildcard and User-Agent support
    const robots = robotsParser(ROBOTS_TXT_URL, robotsTxt);
    const isAllowed = robots.isAllowed(targetUrl, USER_AGENT);

    if (!isAllowed) {
      console.error('❌ CRITICAL: Crawling disallowed by robots.txt');
      console.error('   User-Agent:', USER_AGENT);
      console.error('   Target URL:', targetUrl);
      console.error('   법적 안전성을 위해 크롤링을 중단합니다.');
      return false;
    }

    console.log('✅ robots.txt check passed');
    console.log('   User-Agent:', USER_AGENT);
    console.log('   Allowed to crawl:', targetUrl);
    return true;
  } catch (error) {
    console.error('❌ Failed to check robots.txt:', error);
    console.error('   For safety, crawling will be aborted.');
    // IMPORTANT: Fail-safe behavior - do not crawl if robots.txt check fails
    // 법적 안전성을 위해 실패 시 크롤링 중단
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

  // Wait a bit for dynamic content
  await page.waitForTimeout(2000);

  // Extract product information
  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll('.cate_prd_list li');
    const results = [];

    productElements.forEach((element, index) => {
      try {
        // Product info container
        const prdInfo = element.querySelector('.prd_info');
        if (!prdInfo) return;

        // Product name
        const nameElement = prdInfo.querySelector('.prd_name a');
        const name = nameElement ? nameElement.textContent.trim() : null;

        // Product URL
        const linkElement = prdInfo.querySelector('.prd_thumb') || prdInfo.querySelector('.prd_name a');
        const url = linkElement ? linkElement.href : null;

        // Image URL (방안 3: URL만 참조, 다운로드 안 함)
        const imgElement = element.querySelector('.prd_thumb img') || element.querySelector('img');
        let imageUrl = null;
        if (imgElement) {
          imageUrl = imgElement.src || imgElement.dataset.src || imgElement.dataset.original;
          // // 프로토콜 추가
          if (imageUrl && imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          }
        }

        // Price container
        const priceContainer = prdInfo.querySelector('.prd_price');

        // Original price (정가) - deleted price
        const originalPriceElement = priceContainer ? priceContainer.querySelector('del span') : null;
        const originalPriceText = originalPriceElement ? originalPriceElement.textContent.trim() : null;
        const originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : null;

        // Sale price (판매가) - current price
        const salePriceElement = priceContainer ? priceContainer.querySelector('.tx_cur span') : null;
        const salePriceText = salePriceElement ? salePriceElement.textContent.trim() : null;
        const salePrice = salePriceText ? parseInt(salePriceText.replace(/[^0-9]/g, '')) : null;

        // Discount rate (할인율)
        const flagContainer = prdInfo.querySelector('.prd_flag');
        const discountElement = flagContainer ? flagContainer.querySelector('.tx_num') : null;
        const discountText = discountElement ? discountElement.textContent.trim() : '0%';
        const discountRate = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;

        // Rank (순위)
        const rank = index + 1;

        // Review score (리뷰 평점)
        const ratingScoreElement = prdInfo.querySelector('.prd_rating .tx_num') ||
                                   prdInfo.querySelector('.rating .num') ||
                                   prdInfo.querySelector('[class*="rating"] .tx_num');
        const reviewScore = ratingScoreElement ? parseFloat(ratingScoreElement.textContent.trim()) : null;

        // Review count (리뷰 수)
        const reviewCountElement = prdInfo.querySelector('.prd_rating .co_num') ||
                                   prdInfo.querySelector('.rating .ratingCnt') ||
                                   prdInfo.querySelector('[class*="rating"] .co_num');
        const reviewCountText = reviewCountElement ? reviewCountElement.textContent.trim() : null;
        const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^0-9]/g, '')) || null : null;

        // Validate data
        if (name && url && salePrice) {
          results.push({
            rank,
            name,
            originalPrice: originalPrice || salePrice,
            salePrice,
            discountRate,
            url,
            imageUrl,
            reviewScore: (reviewScore && !isNaN(reviewScore)) ? reviewScore : null,
            reviewCount: (reviewCount && reviewCount > 0) ? reviewCount : null
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
 * Main crawling function for a single category
 */
async function crawlCategory(category, browser) {
  const targetUrl = getCategoryUrl(category);

  try {
    console.log(`\n📂 Crawling category: ${category}`);
    console.log(`📅 Target URL: ${targetUrl}`);

    // Check robots.txt compliance
    const robotsAllowed = await checkRobotsTxt(targetUrl);
    if (!robotsAllowed) {
      throw new Error(`Crawling disallowed by robots.txt for category: ${category}`);
    }

    // Delay before request (rate limiting)
    console.log(`⏱️  Waiting ${REQUEST_DELAY}ms before request...`);
    await delay(REQUEST_DELAY);

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1'  // Do Not Track - 사용자 추적 안 함 명시
      }
    });

    const page = await context.newPage();

    // Set longer timeout for slow networks
    page.setDefaultTimeout(30000);

    // Listen for console logs from the page (useful for debugging)
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    // Navigate to target URL
    console.log('🔗 Navigating to target page...');
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Check response status
    const status = response.status();
    console.log(`📡 HTTP Status: ${status}`);

    if (status === 403) {
      throw new Error('Access forbidden (403). Server may be blocking crawlers.');
    } else if (status === 429) {
      const retryAfter = response.headers()['retry-after'];
      throw new Error(`Rate limited (429). Retry after: ${retryAfter || 'unknown'}`);
    } else if (status >= 400) {
      throw new Error(`HTTP error: ${status}`);
    }

    // Extract product data
    const products = await extractProducts(page);

    if (products.length === 0) {
      throw new Error('No products extracted. Page structure may have changed.');
    }

    // Save to database
    console.log('💾 Saving products to database...');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const savedCount = productDB.upsertProducts(products, today);

    console.log(`✅ Successfully saved ${savedCount} products`);

    // Update crawl log
    crawlLogDB.completeLog(logId, 'success', savedCount);

    // Close browser
    await browser.close();

    console.log('🎉 Crawling completed successfully!');
    return {
      success: true,
      productsCount: savedCount,
      rankingDate: today
    };

  } catch (error) {
    console.error('❌ Crawling failed:', error);

    // Update crawl log with error
    crawlLogDB.completeLog(logId, 'error', 0, error.message);

    // Clean up browser if still open
    if (browser) {
      await browser.close();
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Crawl with retry logic
 */
async function crawlWithRetry(maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🔄 Crawl attempt ${attempt}/${maxRetries}`);

    const result = await crawlOliveYoung();

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

// If run directly (not imported as module)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule || import.meta.url === `file://${process.argv[1]}`) {
  crawlWithRetry()
    .then(result => {
      console.log('\n📊 Final result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { crawlOliveYoung, crawlWithRetry };
