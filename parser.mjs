import puppeteer from 'puppeteer';

async function scrapeSite() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://all-stars.kz/store/brendy/puma/', { waitUntil: "domcontentloaded"} ,  { timeout: 30000 } );

    await page.waitForSelector('.catalog-item');

    await page.waitForSelector('#filterAjaxForm > div:nth-child(3) > div > div:nth-child(3) > div > ul > li:nth-child(2) > label > a', { visible: true });
    await page.click('#filterAjaxForm > div:nth-child(3) > div > div:nth-child(3) > div > ul > li:nth-child(2) > label > a');

    const products = await page.$$eval('.catalog-item', cards =>
        cards.map(card => {
            const title = card.querySelector('.catalog-item__title, .product-item__name')?.innerText.trim() || "";
            const brand = card.querySelector('.catalog-item__brand')?.innerText.trim() || "";
            const img = card.querySelector('img')?.src || "";
            const price = card.querySelector('.catalog-item__price, .catalog-price')?.innerText.trim() || "";
            const url = card.querySelector('a')?.href || "";
            return {
                title, 
                brand, 
                img, 
                price, 
                url 
            };
        })
    );

    // console.log( products.length);
    console.log(products.slice(0, 5)); 
    await browser.close();
}

scrapeSite();
