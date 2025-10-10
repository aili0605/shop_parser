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
        if (!url || !url.startsWith("http")) {
            console.warn("⚠️ Неверный URL:", url);
            return;
        }
    console.log("Открываем:", url);
    await page.goto( url, {waitUntil: "domcontentloaded", timeout: 70000});
    
    const showAllBtn = await page.$(".filtersbardesktop__item__button");

    if (showAllBtn) {
        const box = await showAllBtn.boundingBox();
        if (box) {
            console.log("Кнопка 'Показать всё' найдена и видима, кликаем...");
            await showAllBtn.click();
            await new Promise(r => setTimeout(r, 2000));

        } else {
            console.log("Кнопка 'Показать всё' найдена, но невидима (возможно за пределами экрана)");
        }
    } else {
        console.log("Кнопка 'Показать всё' не найдена на странице!");
    }

    // ждем загрузку товаров
    await page.waitForSelector('article[data-testid="productCard"]');

    console.log("Прокручиваем страницу, чтобы подгрузились все товары...");
    await autoScroll(page);
    await new Promise(r => setTimeout(r, 3000));
    console.log("Прокрутка завершена.");

    const buttons = await page.$$eval("button", btns => 
    btns.map(b => ({
        text: b.innerText,
        classes: b.className,
        id: b.id
    }))
    );
    console.log("Найденные кнопки:", buttons);

        await autoScroll(page); // прокручиваем страницу до конца
        // собираем товары
        const products = await page.$$eval('article[data-testid="productCard"]', items =>
        items.map(el => ({
            brand: el.querySelector("div.item__info__header")?.innerText || "",
            title: el.querySelector("div.item__info__name > a")?.innerText || "",
            price: el.querySelector("div.pricing__prices__wrapper span span")?.innerText || "",
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

console.log("Подключена база данных:", client.database);


// главная функция
async function scrapeSite() {
    console.log("Подключена база данных:", client.database);
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

    await page.goto("https://www.luisaviaroma.com/en-kz/shop/women/dolce-gabbana?lvrid=_gw_d008", {
        waitUntil: "domcontentloaded",
        timeout: 70000,
    });

    // список категорий  
    const categories = [
    { id: 1, name: "Обувь", url: "https://www.mytheresa.com/us/en/women/designers/prada?categories=0006&categories=0003&sortBy=recommendation" },
    { id: 2, name: "Одежда", url: "https://www.mytheresa.com/us/en/women/designers/prada?categories=0006&sortBy=recommendation" },
    { id: 3, name: "Аксессуары", url: "https://www.mytheresa.com/us/en/women/designers/prada?categories=0002&sortBy=recommendation" },
    { id: 4, name: "Сумки", url: "https://www.mytheresa.com/us/en/women/designers/prada?categories=0004&sortBy=recommendation" }
    ];

    // запускаем парсинг по каждой категории
    for (let cat of categories) {
    console.log(`\n🛍 Парсим категорию: ${cat.name}`);
    await scrapeCategory(page, cat.url, cat.id);
    }
    
    await browser.close();
    await client.end();
    console.log("Все товары сохранены в базу");

}
scrapeSite();
 