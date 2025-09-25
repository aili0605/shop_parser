import puppeteer from 'puppeteer';

async function scrapeSite() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.wildberries.ru/catalog/zhenshchinam', { waitUntil: "domcontentloaded" });

    // каталог
    await page.waitForSelector('#catalogNavbarLink', { visible: true });
    await page.click('#catalogNavbarLink');

    // женщинам
    // await page.evaluate(() => {
    //     document.querySelector('.menu-burger__main a')?.click();
    //     });

    // await page.waitForSelector('.menu-burger__main ', { visible: true });
    // await page.click('.menu-burger__main ');
    const link = await page.waitForSelector('.menu-burger__main a', { visible: true });
    const box = await link.boundingBox();
    if (box) {
    await link.click();
    } else {
    console.log("Элемент найден, но не виден");
}

    // await new Promise(r => setTimeout(r, 10000));
    
    // блузки и рубашки
    await page.waitForSelector('.promo-category-page__content a', { visible: true });
    await page.click('.promo-category-page__content a');
    // console.log("DDDDDDD:", burger)

    // берем данные 
    await page.waitForSelector('article.product-card');

    const products = await page.$$eval('article.product-card', cards =>
        cards.map(card => {
            const title = card.querySelector('.product-card__name')?.innerText.trim() || "";
            const brand = card.querySelector('.product-card__brand')?.innerText.trim() || "";
            const img = card.querySelector('img')?.src || "";
            const price = card.querySelector('.price__lower-price')?.innerText.trim() || "";
            // const seller = card.querySelector('.a')?.innerText.trim || "";
            const url = card.querySelector('a.product-card__link')?.href || "";
            return {
                title,
                brand,
                img,
                price,
                url
            };
        })
    );

    console.log("Products lists:", products.slice(0, 5));


    for (let product of products.slice(0, 5)) {
        await page.goto(product.url, { waitUntil: "networkidle2" });

        await page.waitForSelector('h1', { timeout: 10000 });

        const details = await page.evaluate(() => {
            const title = document.querySelector('h1.same-part-kt__header')?.innerText.trim() || "";
            const brand = document.querySelector('span.brand')?.innerText.trim() || "";
            const price = document.querySelector('span.price-block__final-price')?.innerText.trim() || "";
            const img = document.querySelector('img.zoom-image-container__image')?.src || "";
            return { title, brand, price, img };
        });


        console.log({ ...product, ...details });
    }

    await browser.close();
}
scrapeSite();
