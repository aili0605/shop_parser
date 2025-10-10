import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // показать браузер (чтобы видеть результат)
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  console.log('⏳ Открываю сайт...');
  await page.goto('https://www.luisaviaroma.com/en-kz/shop/women/dolce-gabbana?lvrid=_gw_d008', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log('✅ Сайт открылся успешно!');
  await new Promise(resolve => setTimeout(resolve, 5000)); // ждём 5 секунд, чтобы увидеть страницу

  await browser.close();
})();
