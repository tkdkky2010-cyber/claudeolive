/**
 * 올리브영 상품 리뷰 데이터 업데이트
 * 상품 상세 페이지 로드 시 자동 호출되는 goods/api/v1/extra API를 인터셉트하여 리뷰 수집
 *
 * 실행: node --env-file=.env scripts/update-reviews.js
 */
import { chromium } from 'playwright';
import { supabase } from '../src/config/supabase.js';

const CONCURRENT_PAGES = 3;  // 동시 페이지 수 (너무 많으면 차단 위험)
const DELAY_MS = 1000;        // 페이지 간 딜레이

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractGoodsNo(url) {
  const match = url?.match(/goodsNo=([A-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, product_name, oliveyoung_url, review_count, review_score')
    .is('review_score', null)   // 아직 리뷰 없는 것만
    .order('ranking_date', { ascending: false })  // 최신 날짜 우선
    .order('rank');              // 그 다음 순위순
  if (error) throw error;
  return data || [];
}

async function updateReviews(productId, reviewCnt, reviewAvgScore) {
  const { error } = await supabase
    .from('products')
    .update({
      review_count: reviewCnt > 0 ? reviewCnt : null,
      review_score: reviewAvgScore > 0 ? reviewAvgScore : null,
    })
    .eq('id', productId);
  if (error) throw error;
}

/**
 * 단일 상품 리뷰 데이터 수집
 * 상품 detail 페이지를 로드하고 extra API 응답을 인터셉트
 */
async function fetchProductReview(context, product, goodsNo) {
  const page = await context.newPage();
  let reviewInfo = null;

  try {
    // API 응답 인터셉트 설정
    const responsePromise = new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), 12000);
      page.on('response', async (response) => {
        if (response.url().includes('goods/api/v1/extra')) {
          try {
            const data = await response.json();
            const info = data?.data?.reviewInfoDto;
            if (info) {
              clearTimeout(timeoutId);
              resolve(info);
            }
          } catch(e) {}
        }
      });
    });

    // 상품 상세 페이지 로드 (이 과정에서 extra API가 자동 호출됨)
    await page.goto(
      `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    );

    reviewInfo = await responsePromise;
  } catch (e) {
    // 타임아웃 또는 에러 무시
  } finally {
    await page.close();
  }

  return reviewInfo;
}

async function main() {
  console.log('🚀 리뷰 데이터 업데이트 시작\n');

  const products = await getAllProducts();
  console.log(`📦 리뷰 없는 상품: ${products.length}개 처리 예정\n`);

  if (products.length === 0) {
    console.log('✅ 모든 상품에 리뷰 데이터가 있습니다!');
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: { 'Accept-Language': 'ko-KR,ko;q=0.9' }
  });

  let successCount = 0;
  let withReviewCount = 0;
  let failCount = 0;

  // 배치 처리
  for (let i = 0; i < products.length; i += CONCURRENT_PAGES) {
    const batch = products.slice(i, i + CONCURRENT_PAGES);

    const results = await Promise.all(
      batch.map(async (product) => {
        const goodsNo = extractGoodsNo(product.oliveyoung_url);
        if (!goodsNo) return { product, reviewInfo: null };

        const reviewInfo = await fetchProductReview(context, product, goodsNo);
        return { product, goodsNo, reviewInfo };
      })
    );

    // 결과 저장
    for (const { product, goodsNo, reviewInfo } of results) {
      if (reviewInfo) {
        await updateReviews(product.id, reviewInfo.reviewCnt, reviewInfo.reviewAvgScore);
        successCount++;
        if (reviewInfo.reviewCnt > 0 || reviewInfo.reviewAvgScore > 0) withReviewCount++;
      } else {
        failCount++;
      }
    }

    // 진행 상황 출력
    const processed = Math.min(i + CONCURRENT_PAGES, products.length);
    const lastResult = results.find(r => r.reviewInfo?.reviewCnt > 0);
    console.log(`[${processed}/${products.length}] ✅ | 리뷰: ${withReviewCount}개${lastResult ? ` | 최근: ⭐${lastResult.reviewInfo.reviewAvgScore} (${lastResult.reviewInfo.reviewCnt.toLocaleString()})` : ''}`);

    await delay(DELAY_MS);
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('📊 업데이트 완료');
  console.log(`  ✅ 성공: ${successCount}개`);
  console.log(`  📝 실제 리뷰 있음: ${withReviewCount}개`);
  console.log(`  ❌ 실패/타임아웃: ${failCount}개`);
  console.log('='.repeat(50));
}

main().catch(e => {
  console.error('❌ 오류:', e.message);
  process.exit(1);
});
