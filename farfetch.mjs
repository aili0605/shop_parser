import puppeteer from "puppeteer";
import pkg from "pg";
const { Client } = pkg;

// подключение к PostgreSQL
const client = new Client({
    user: "postgres",       
    host: "localhost",      
    database: "multi_wishlist_db",       
    password: "060101",      
    port: 5432
});

async function getBrandId(brandName) {
    if (!brandName) brandName = "Unknown";

    const res = await client.query(
        'SELECT id FROM public."Brands" WHERE name = $1',
        [brandName]
    );

    if (res.rows.length > 0) return res.rows[0].id;

    const insertRes = await client.query(
        `INSERT INTO public."Brands"(name, slug, "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
        [brandName, brandName.toLowerCase().replace(/\s+/g, "-")]
    );

    return insertRes.rows[0].id;  
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}

// Парсим категорию
async function scrapeCategory(page, url, categoryId) {
    await page.goto( url, {waitUntil: "domcontentloaded", timeout: 70000});
    
    //показать все
    const showAllBtn = await page.$("#catalog-actions > div:nth-child(1) > button");
    if (showAllBtn) await showAllBtn.click();
    
    // ждем загрузку товаров
    await page.waitForSelector("#catalog-grid > li");
    
    // let leadMoreBtn = await page.$("button.ltr-6q0y14");
    // while (leadMoreBtn) {
        //     await leadMoreBtn.click();
        //     await page.waitForTimeout(5000);
        //     leadMoreBtn = await page.$("button.ltr-6q0y14");
        // }

        await autoScroll(page); // прокручиваем страницу до конца
        
        // собираем товары
        const products = await page.$$eval("#catalog-grid > li", items =>
        items.map(el => ({
            brand: el.querySelector("p[data-component='ProductCardBrandName']")?.innerText || "",
            title: el.querySelector("div.ltr-1aysmcq > p.ltr-4y8w0i-Body")?.innerText || "",
            price: el.querySelector("#catalog-grid > li:nth-child(1) > div > div > a > div.ltr-f4e0fk > div.ltr-l3ndox")?.innerText || "",
            link: el.querySelector("a")?.href || "",
            img: el.querySelector("img")?.src || ""
        }))
    );

    
    console.log(`Сохранено ${products.length} товаров: ${url}`);


    for (let p of products) {
        // Разделяем цену и валюту
        const priceParts = p.price.match(/([\d.,]+)\s*(\w+)/);
        const priceValue = priceParts ? priceParts[1].replace(",", ".") : null;
        const currency = priceParts ? priceParts[2] : null;

        const brandId = await getBrandId(p.brand);

        try{
            const res = await client.query(
                `INSERT INTO public."Products"(
                        name, brand_id, category_id, price, currency, url, image_url, description, "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                    ON CONFLICT (url) DO NOTHING`,
                [p.title, brandId, categoryId, priceValue, currency, p.link, p.img, null]
            );
            console.log('Вставлен товар:', p.title);
        } catch (err) {
            console.error('Ошибка вставки товара:', p.title, err.message);
        }
    } 
}

// главная функция
async function scrapeSite() {
    await client.connect();

    const browser = await puppeteer.launch({
        headless: false, // можно "new" или false, чтобы видеть процесс
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled", // скрываем puppeteer
        ],
    });

    const page = await browser.newPage();

    // маскируем под нормального юзера
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1366, height: 768 });

    // убираем флажки puppeteer
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false });
        Object.defineProperty(navigator, "languages", { get: () => ["ru-RU", "ru", "en-US"] });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    });

    await page.goto("https://www.farfetch.com/kz/shopping/women/puma/items.aspx", {
        waitUntil: "domcontentloaded",
        timeout: 70000,
    });

    const categoryLinks = await page.$$eval("#catalog-actions a", links => 
        links.map((l, i) => ({
            url: l.href,
            id: i + 1
        }))
    );

    // проходим по каждой категории
    for (let cat of categoryLinks){
        // if (url) {
            await scrapeCategory(page, cat.url, cat.id);
        // }
    }
    
    await browser.close();
    await client.end();
    console.log("Все товары сохранены в базу");
    // console.log(`Сохранено ${products.length} товаров: ${url}`);

}
    
scrapeSite();
 