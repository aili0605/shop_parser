import puppeteer from 'puppeteer';
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "multi_wishlist_db",
    password: "060101",
    port: 5432
});

async function getBrandId(brandName) {
    if (!brandName) brandName = "Unknown";

    const slug = brandName.toLowerCase().replace(/\s+/g, "-");

    // 1. Проверяем — есть ли бренд уже в БД
    const existing = await client.query(
        'SELECT id FROM public."Brands" WHERE slug = $1',
        [slug]
    );

    if (existing.rows.length > 0) {
        // Если найден — возвращаем id
        return existing.rows[0].id;
    }

    // 2. Если нет — добавляем новый бренд
    const inserted = await client.query(
        `INSERT INTO public."Brands"(name, slug, "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
        [brandName, slug]
    );

    return inserted.rows[0].id;
}

async function autoScroll(page, selectorForItems = 'div._3kWsUD-sruWkbllx1UtLKW > div') {
    let lastHeight = 0;
    let sameCount = 0;

    while (sameCount < 3) { // три раза подряд без изменений — стоп
        const itemsBefore = await page.$$eval(selectorForItems, els => els.length);
        await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 3000)); // ждём подгрузку
        const newHeight = await page.evaluate('document.body.scrollHeight');
        const itemsAfter = await page.$$eval(selectorForItems, els => els.length);

        console.log(`Скроллим... было ${itemsBefore}, стало ${itemsAfter}`);

        if (itemsAfter === itemsBefore && newHeight === lastHeight) {
            sameCount++;
        } else {
            sameCount = 0;
        }
        lastHeight = newHeight;
    }
    await new Promise(r => setTimeout(r, 5000));


    console.log("Все товары подгрузились!");
}

// async function autoScroll(page) {
//     await page.evaluate(async () => {
//         await new Promise((resolve) => {
//             let totalHeight = 0;
//             const distance = 100;
//             const timer = setInterval(() => {
//                 const scrollHeight = document.body.scrollHeight;
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;

//                 if(totalHeight >= scrollHeight){
//                     clearInterval(timer);
//                     resolve();
//                 }
//             }, Math.random() * 400 + 200); // 200–600ms
//         });
//     });
// }

async function scrapeCategory(page, url, categoryId) {
        if (!url || !url.startsWith("http")) {
            console.warn(" Неверный URL:", url);
            return
        }
    console.log("Открываем:", url);
    await page.goto(url, {waitUntil: "domcontentloaded", timeout: 70000});

    const showAllBtn = await page.$("div._2gMkUI3HTMrF5PpcVs8_5r > h4");

    if (showAllBtn) {
        const box = await showAllBtn.boundingBox();
        if (box) {
            console.log("Кнопка показать все найдена и кликаем");
            await showAllBtn.click();
            await new Promise(r => setTimeout(r, 2000));

        } else {
            console.log("Кнопка показать все найдена, но невидема")
        }
    } else {
        console.log("кнопка показать все не найдена")
    }
    
    await page.waitForSelector("div._3kWsUD-sruWkbllx1UtLKW > div", { timeout: 90000 });
    // await page.waitForSelector("div.plp-products__column", { timeout: 90000 });
    // await page.waitForSelector(".plp-products__row", { timeout: 90000 });



    console.log("покручиваем страницу, чтобы подгрузились все товары...")
    await autoScroll(page);
    await new Promise(r =>  setTimeout(r, 3000));
    console.log("подгрузка завершена.")

    const buttons = await page.$$eval("button", btns =>
    btns.map(b => ({
        text: b.innerText,
        classes: b.className,
        id: b.id
    }))
    );
    console.log("Найденные кнопки:", buttons);

        await autoScroll(page);
        const products = await page.$$eval('div._3kWsUD-sruWkbllx1UtLKW > div', cards =>
        cards.map(card => ({
            title: card.querySelector('div._1EqhXd6FUIED0ndyLYSncV')?.innerText?.trim() || '',
            brand: card.querySelector('div._1tt3LMOZ50TX6rWCuwNDjK')?.innerText?.trim() || '',
            price: card.querySelector('div._3ci448BKfp9cWY1Ssqh4U3')?.innerText?.trim() || '',
            link: card.href || '',
        }))
    );

        // const products = await page.$$eval("div._3kWsUD-sruWkbllx1UtLKW > div", items =>
        // items.map(el =>({
        //     brand: el.querySelector('[data-testid="product-brand"]')?.innerText.trim() || "",
        //     title: el.querySelector('[data-testid="product-name"]')?.innerText.trim() || "",
        //     price: el.querySelector('[data-testid="product-price"]')?.innerText.trim() || "",
        //     link: el.querySelector('a')?.href || "",
        //     img: el.querySelector('img')?.src || ""
        // }))
    // );
    const validProducts = products.filter(p => p.title && p.price);
    console.log(`Из ${products.length} товаров — ${validProducts.length} с непустыми данными`);
    console.log('Тест селектор name:', await page.$$eval('СЕНІҢ_СЕЛЕКТОРЫҢ', els => els.map(e => e.textContent.trim())));




    for (let p of products) {

        // const priceParts = p.price.match(/([\d.,]+)\s*(\w+)/);
        // const priceValue = priceParts ? priceParts[1].replace(",", ".") : null;
        // const currency = priceParts ? priceParts[2] : null;

        const priceParts = p.price.match(/([\d.,]+)\s*(\w+)/);
        let priceValue = null;
        let currency = null;

        if (priceParts) {
        currency = priceParts[2];
        let numeric = priceParts[1]
            .replace(/\./g, "") // убираем точки между тысячами
            .replace(",", "."); // заменяем запятую на точку
        priceValue = parseFloat(numeric);
        }

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
        headless: false,
        userDataDir: './user_data',  // сохраняет куки, localStorage
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
        ] ,
    });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1366, height: 768 });


    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => false});
        Object.defineProperty(navigator, "languages", { get: () => ["ru-Ru", "ru", "en-Us"] });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    });
    await page.goto('https://www.cettire.com/kz/collections/women/jacquemus', 
        { waitUntil: "domcontentloaded"} ,  
        { timeout: 120000,
    });
    
    const categories =[
        { id: 1, name: "Обувь", url:"https://www.cettire.com/kz/collections/women/jacquemus?menu%5Bproduct_type%5D=&refinementList%5Btags%5D%5B0%5D=Shoes&refinementList%5BSize%5D=&page=1"},
        { id: 2, name: "Одежда", url:"https://www.cettire.com/kz/collections/women/jacquemus?menu%5Bproduct_type%5D=&refinementList%5Btags%5D%5B0%5D=Clothing&refinementList%5BSize%5D=&page=1"},
        { id: 3, name: "Аксессуары", url:"https://www.cettire.com/kz/collections/women/jacquemus?menu%5Bproduct_type%5D=&refinementList%5Btags%5D%5B0%5D=Accessories&refinementList%5BSize%5D=&page=1"},
        { id: 4, name: "Сумки", url:"https://www.cettire.com/kz/collections/women/jacquemus?menu%5Bproduct_type%5D=&refinementList%5Btags%5D%5B0%5D=Bags&refinementList%5BSize%5D=&page=1"},
    ];

    for (let cat of categories) {
    console.log(`\nПарсим категорию: ${cat.name}`);
    await scrapeCategory(page, cat.url, cat.id);
    }

    await browser.close();
    await client.end();
    console.log("Все товары сохранены в базу")

}
scrapeSite();
