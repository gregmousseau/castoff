const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  // Go to operator page
  await page.goto('https://charter-direct.vercel.app/book/angelo', { waitUntil: 'networkidle2' });
  
  // Scroll to show calendar and take screenshot
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.screenshot({ path: 'case-study-screenshots/04-calendar-view.png' });
  
  // Click on a date (Feb 20)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent === '20') {
        btn.click();
        break;
      }
    }
  });
  
  await delay(500);
  await page.screenshot({ path: 'case-study-screenshots/05-date-selected.png' });
  
  // Select Half Day option if visible
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Half Day')) {
        btn.click();
        break;
      }
    }
  });
  
  await delay(500);
  
  // Take full page screenshot
  await page.screenshot({ path: 'case-study-screenshots/06-booking-form.png', fullPage: true });
  
  // Fill in customer details if form exists
  const nameInput = await page.$('input[name="name"], input[placeholder*="Name"]');
  if (nameInput) {
    await nameInput.type('John Smith');
    
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) await emailInput.type('john@example.com');
    
    const phoneInput = await page.$('input[name="phone"], input[type="tel"]');
    if (phoneInput) await phoneInput.type('+1 555-123-4567');
    
    await page.screenshot({ path: 'case-study-screenshots/07-form-filled.png', fullPage: true });
  }
  
  await browser.close();
  console.log('Screenshots captured!');
})();
