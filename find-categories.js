/**
 * OliveYoung Category URL Finder
 * 올리브영 사이트에서 카테고리별 베스트 페이지 URL을 찾는 스크립트
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_URL = 'https://www.oliveyoung.co.kr/store/main/getBestList.do';
const USER_AGENT = 'OliveRankingInfoBot/1.0 (https://oliveyoung-ranking.com; crawler@oliveyoung-ranking.com)';

async function findCategoryUrls() {
  let browser = null;

  try {
    console.log('🌐 브라우저 실행 중...');
    browser = await chromium.launch({
      headless: false,  // 브라우저 화면 보기
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    console.log('🔗 올리브영 랭킹 페이지 접속 중...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

    console.log('⏱️  페이지 로딩 대기 중...');
    await page.waitForTimeout(3000);

    // 카테고리 탭 찾기
    console.log('\n📊 카테고리 탭 찾는 중...\n');

    const categories = await page.evaluate(() => {
      // 일반적인 카테고리 탭 선택자들
      const selectors = [
        '.cate_tab_list a',
        '.cate_list a',
        '.tab_list a',
        '[role="tab"]',
        '.category_tab a'
      ];

      let foundCategories = [];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach((el, index) => {
            const text = el.textContent.trim();
            const href = el.href;
            if (text && href) {
              foundCategories.push({
                index: index + 1,
                name: text,
                url: href,
                selector: selector
              });
            }
          });
          if (foundCategories.length > 0) break;
        }
      }

      return foundCategories;
    });

    if (categories.length > 0) {
      console.log('✅ 카테고리를 찾았습니다:\n');
      categories.forEach(cat => {
        console.log(`${cat.index}. ${cat.name}`);
        console.log(`   URL: ${cat.url}`);
        console.log('');
      });
    } else {
      console.log('❌ 카테고리 탭을 찾지 못했습니다.');
      console.log('수동으로 확인이 필요합니다.\n');

      // 페이지 구조 출력
      const pageStructure = await page.evaluate(() => {
        return {
          title: document.title,
          h1: document.querySelector('h1')?.textContent,
          mainSelectors: Array.from(document.querySelectorAll('[class*="cate"], [class*="tab"], [class*="category"]'))
            .slice(0, 5)
            .map(el => ({
              tag: el.tagName,
              class: el.className,
              text: el.textContent.substring(0, 50)
            }))
        };
      });

      console.log('페이지 구조:');
      console.log(JSON.stringify(pageStructure, null, 2));
    }

    console.log('\n💡 브라우저가 열려있습니다. 수동으로 카테고리를 확인하세요.');
    console.log('   - 스킨케어 베스트 페이지로 이동');
    console.log('   - URL 복사');
    console.log('   - 같은 방식으로 다른 카테고리 URL 확인\n');

    // 30초 대기 (사용자가 확인할 시간)
    console.log('⏳ 30초 후 자동 종료됩니다...\n');
    await page.waitForTimeout(30000);

    await browser.close();

  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    if (browser) await browser.close();
  }
}

findCategoryUrls();
