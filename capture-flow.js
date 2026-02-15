const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  await page.goto('https://charter-direct.vercel.app/book/angelo', { waitUntil: 'networkidle2' });
  
  // Scroll to show calendar
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'case-study-screenshots/04-calendar-view.png' });
  
  // Click on Feb 20
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === '20') {
        btn.click();
        return true;
      }
    }
    return false;
  });
  console.log('Clicked date:', clicked);
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'case-study-screenshots/05-date-selected.png', fullPage: true });
  
  await browser.close();
  console.log('Done!');
})();
