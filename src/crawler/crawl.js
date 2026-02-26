// 카테고리별 크롤러 — URL을 직접 입력해서 상품 30개 수집 (상품명/가격/평점/리뷰수/스크린샷)
// 사용법: node src/crawler/crawl.js "URL" "카테고리명"

import { chromium } from 'playwright';
import { productDB, crawlLogDB } from '../db/database.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const MAX_PRODUCTS = 30;
const IMAGE_BASE_DIR = './images/products';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

function ensureDir(categoryName) {
  const dir = path.join(IMAGE_BASE_DIR, categoryName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function safeFileName(name, rank) {
  const clean = name.replace(/[^a-zA-Z0-9가-힣]/g, '_').slice(0, 30);
  return `${String(rank).padStart(3, '0')}_${clean}.jpg`;
}

async function extractProducts(page) {
  await page.waitForSelector('.cate_prd_list', { timeout: 15000 });
  return await page.evaluate((max) => {
    const items = document.querySelectorAll('.cate_prd_list li');
    const results = [];
    items.forEach((el, i) => {
      if (i >= max) return;
      try {
        const name = el.querySelector('.tx_name')?.textContent.trim() ?? null;
        const url = el.querySelector('a.prd_thumb')?.href ?? null;
        const salePriceText = el.querySelector('.tx_cur')?.textContent.trim() ?? null;
        const salePrice = salePriceText ? parseInt(salePriceText.replace(/[^0-9]/g, '')) : null;
        const originalPriceText = (el.querySelector('.tx_org') || el.querySelector('del'))?.textContent.trim();
        const originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : null;
        const discountText = (el.querySelector('.tx_per') || el.querySelector('.percent'))?.textContent.trim() ?? '0%';
        const discountRate = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;

        if (name && url && salePrice) {
          results.push({ rank: i + 1, name, originalPrice: originalPrice || salePrice, salePrice, discountRate, url });
        }
      } catch (e) { }
    });
    return results;
  }, MAX_PRODUCTS);
}

async function captureListingImages(page, products, categoryName) {
  const items = await page.$$('.cate_prd_list li');
  for (let i = 0; i < Math.min(items.length, products.length); i++) {
    const product = products[i];
    const dir = ensureDir(categoryName);
    const fileName = safeFileName(product.name, product.rank);
    const filePath = path.join(dir, fileName);

    try {
      const imgEl = await items[i].$('a.prd_thumb'); // FIXED SELECTOR
      if (imgEl) {
        await imgEl.scrollIntoViewIfNeeded();
        await sleep(500);
        await imgEl.screenshot({ path: filePath });
        product.localImagePath = filePath;
        console.info(`  📸 캡처: ${fileName}`);
        await sleep(1000); // 1s DELAY AS REQUESTED
      }
    } catch (imgErr) {
      console.error(`  ❌ 이미지 캡처 실패 (${product.name}): ${imgErr.message}`);
    }
  }
}

async function visitProductPage(context, product) {
  const page = await context.newPage();
  try {
    await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000 + Math.random() * 1000); // DETAILED PAGE DELAY

    await page.waitForSelector('span.rating', { timeout: 8000 }).catch(() => null);
    const ratingText = await page.$eval('span.rating', el => el.textContent.trim()).catch(() => null);
    const rating = ratingText ? parseFloat(ratingText.replace(/[^0-9.]/g, '')) : null;

    const reviewText = await page.$eval('[class*="review-count"]', el => el.textContent.trim()).catch(() => null);
    const reviewCount = reviewText ? parseInt(reviewText.replace(/[^0-9]/g, '')) : null;

    return { rating, reviewCount };
  } catch (err) {
    return { rating: null, reviewCount: null };
  } finally {
    await page.close();
  }
}

async function crawlCategory(targetUrl, categoryName) {
  console.info(`\n🚀 크롤링 시작: ${categoryName}`);
  const logId = crawlLogDB.createLog();
  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: randomUA(), viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const products = await extractProducts(page);

    await captureListingImages(page, products, categoryName);
    await page.close();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      console.info(`[${i + 1}/${products.length}] ${p.name}`);
      const { rating, reviewCount } = await visitProductPage(context, p);
      p.rating = rating;
      p.reviewCount = reviewCount;
      p.category = categoryName;
      if (i < products.length - 1) await sleep(2000);
    }

    const today = new Date().toISOString().split('T')[0];
    productDB.upsertProducts(products, today);
    crawlLogDB.completeLog(logId, 'success', products.length);
    await browser.close();
    return { success: true, saved: products.length };
  } catch (err) {
    if (browser) await browser.close();
    return { success: false, error: err.message };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , url, category] = process.argv;
  if (!url || !category) process.exit(1);
  crawlCategory(url, category).then(r => process.exit(r.success ? 0 : 1));
}

export { crawlCategory };
