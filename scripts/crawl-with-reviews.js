/**
 * Playwright 기반 크롤러 - 리뷰 데이터 포함
 * 실행: node --env-file=.env scripts/crawl-with-reviews.js
 */
import { chromium } from 'playwright';
import { productDB, crawlLogDB } from '../src/db/database.js';

const USER_AGENT = 'OliveRankingInfoBot/1.0 (https://oliveyoung-ranking.com; crawler@oliveyoung-ranking.com)';
const REQUEST_DELAY = 3000;

const CATEGORIES = {
  '전체': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?t_page=%ED%99%88&t_click=GNB&t_gnb_type=%EB%9E%AD%ED%82%B9&t_swiping_type=N',
  '스킨케어': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010001&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EC%8A%A4%ED%82%A8%EC%BC%80%EC%96%B4',
  '마스크팩': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010009&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EB%A7%88%EC%8A%A4%ED%81%AC%ED%8C%A9',
  '클렌징': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010010&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%ED%81%B4%EB%A0%8C%EC%A7%95',
  '선케어': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010011&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%EC%84%A0%EC%BC%80%EC%96%B4',
  '헤어케어': 'https://www.oliveyoung.co.kr/store/main/getBestList.do?dispCatNo=900000100100001&fltDispCatNo=10000010004&t_page=%EB%9E%AD%ED%82%B9&t_click=%ED%8C%90%EB%A7%A4%EB%9E%AD%ED%82%B9_%ED%97%A4%EC%96%B4%EC%BC%80%EC%96%B4',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractProducts(page, category) {
  await page.waitForSelector('.cate_prd_list', { timeout: 15000 });
  await page.waitForTimeout(2000);

  const products = await page.evaluate((cat) => {
    const items = document.querySelectorAll('.cate_prd_list li');
    const results = [];

    items.forEach((el, index) => {
      try {
        const prdInfo = el.querySelector('.prd_info');
        if (!prdInfo) return;

        const name = prdInfo.querySelector('.prd_name a')?.textContent.trim();
        const url = prdInfo.querySelector('.prd_name a')?.href ||
                    el.querySelector('.prd_thumb a')?.href;

        const imgEl = el.querySelector('.prd_thumb img') || el.querySelector('img');
        let imageUrl = imgEl?.src || imgEl?.dataset.src || imgEl?.dataset.original || null;
        if (imageUrl?.startsWith('//')) imageUrl = 'https:' + imageUrl;

        const priceContainer = prdInfo.querySelector('.prd_price');
        const originalPriceText = priceContainer?.querySelector('del span')?.textContent.trim();
        const originalPrice = originalPriceText ? parseInt(originalPriceText.replace(/[^0-9]/g, '')) : null;
        const salePriceText = priceContainer?.querySelector('.tx_cur span')?.textContent.trim();
        const salePrice = salePriceText ? parseInt(salePriceText.replace(/[^0-9]/g, '')) : null;

        const discountText = prdInfo.querySelector('.prd_flag .tx_num')?.textContent.trim() || '0%';
        const discountRate = parseInt(discountText.replace(/[^0-9]/g, '')) || 0;

        // 리뷰 점수: "10점만점에 5.5점" 형태에서 추출
        const pointEl = prdInfo.querySelector('.prd_point_area .point') ||
                        prdInfo.querySelector('.prd_rating .point');
        let reviewScore = null;
        if (pointEl) {
          const pointText = pointEl.textContent.trim();
          // "10점만점에 5.5점" → 5.5
          const match = pointText.match(/[\d.]+점$/);
          if (match) {
            const raw = parseFloat(match[0]);
            // 10점 만점 → 5점 만점으로 변환
            reviewScore = !isNaN(raw) ? Math.round((raw / 2) * 10) / 10 : null;
          }
        }

        // 리뷰 수: 목록 페이지에서는 제공 안됨
        const reviewCount = null;

        if (name && url && salePrice) {
          results.push({
            rank: index + 1,
            name,
            originalPrice: originalPrice || salePrice,
            salePrice,
            discountRate,
            url,
            imageUrl,
            category: cat,
            reviewScore: (reviewScore && !isNaN(reviewScore) && reviewScore > 0) ? reviewScore : null,
            reviewCount: (reviewCount && reviewCount > 0) ? reviewCount : null,
          });
        }
      } catch (e) {
        // skip
      }
    });

    return results;
  }, category);

  return products;
}

async function crawlCategory(browser, category, url, rankingDate) {
  console.log(`\n📂 ${category} 크롤링 중...`);
  await delay(REQUEST_DELAY);

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      'Accept-Language': 'ko-KR,ko;q=0.9',
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response.status();
    console.log(`  HTTP ${status}`);

    if (status >= 400) throw new Error(`HTTP ${status}`);

    const products = await extractProducts(page, category);
    console.log(`  상품 ${products.length}개 추출`);

    if (products.length > 0) {
      // 리뷰 데이터 확인 로그
      const withReview = products.filter(p => p.reviewScore || p.reviewCount);
      console.log(`  리뷰 데이터 있음: ${withReview.length}개`);
      if (withReview.length > 0) {
        const sample = withReview[0];
        console.log(`  샘플: ${sample.name.slice(0, 20)}... ⭐${sample.reviewScore} (${sample.reviewCount})`);
      }

      await productDB.upsertProducts(products, rankingDate);
      console.log(`  ✅ DB 저장 완료`);
    }

    return { success: true, count: products.length };
  } catch (err) {
    console.error(`  ❌ 실패: ${err.message}`);
    return { success: false, error: err.message };
  } finally {
    await context.close();
  }
}

async function main() {
  const rankingDate = new Date().toISOString().split('T')[0];
  console.log(`\n🚀 크롤링 시작 (${rankingDate})\n`);

  const logId = await crawlLogDB.createLog();
  const browser = await chromium.launch({ headless: true });
  let totalCount = 0;

  try {
    for (const [category, url] of Object.entries(CATEGORIES)) {
      const result = await crawlCategory(browser, category, url, rankingDate);
      if (result.success) totalCount += result.count;
    }

    await crawlLogDB.completeLog(logId, 'success', totalCount);
    console.log(`\n🎉 완료! 총 ${totalCount}개 저장 (${rankingDate})\n`);
  } catch (err) {
    await crawlLogDB.completeLog(logId, 'error', totalCount, err.message);
    console.error('크롤링 실패:', err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
