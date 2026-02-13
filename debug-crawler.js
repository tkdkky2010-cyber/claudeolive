import { chromium } from 'playwright';

const TARGET_URL = 'https://www.oliveyoung.co.kr/store/main/getBestList.do?t_page=%ED%99%88&t_click=GNB&t_gnb_type=%EB%9E%AD%ED%82%B9&t_swiping_type=N';

async function debugPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait a bit for dynamic content
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: '/Users/jasonkim/Desktop/claude code/debug-screenshot.png', fullPage: true });

  // Get page HTML structure
  const html = await page.content();
  console.log('=== Page title ===');
  console.log(await page.title());

  console.log('\n=== Looking for product containers ===');
  const containers = await page.$$eval('*', els => {
    const interesting = [];
    els.forEach(el => {
      if (el.className && typeof el.className === 'string') {
        if (el.className.includes('prd') || el.className.includes('product') || el.className.includes('item') || el.className.includes('list')) {
          interesting.push({
            tag: el.tagName,
            class: el.className,
            children: el.children.length
          });
        }
      }
    });
    return interesting.slice(0, 20); // First 20
  });

  console.log(JSON.stringify(containers, null, 2));

  await browser.close();
}

debugPage().catch(console.error);
