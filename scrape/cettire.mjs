import puppeteer from 'puppeteer';
import { saveProduct } from '../business_logic/business_logic.js';

// плавная покрутка
async function autoScroll(page, selectorForItems = 'div._3kWsUD-sruWkbllx1UtLKW > div') {
    let previousHeight = 0;
    while (true) {
        const currentHeight = await page.evaluate('document.body.scrollHeight');
        if (currentHeight === previousHeight) break;
        previousHeight = currentHeight;

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 3000));
    }
}

// парсим категорию
async function scrapeCategory(page, category) {
    const  {id, name, url} = category;

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
    await new Promise(r => setTimeout(r, 3000))

    // собираем данные
    const products = await page.$$eval('div.product-card', cards =>
    cards.map(card => {
        brand = card.querySelector('.product-card__brand')?.innerText?.trim() || "";
        title = card.querySelector('.product-card__name')?.innerText?.trim() || "";
        price = card.querySelector('.product-card__price')?.innerText?.trim() || "";
        imgEl = card.querySelector('img')?.href || "";
        linkEl = card.querySelector('a')?.src || "";

        return {
        brand,
        title,
        price,
        link,
        img,
        };
    })
    );

    for (const p of products) {
        if (!p.brand || !p.title) {
            console.log("Пропущен товар без бренда и названия")
            continue;
        }
        await saveProduct(p, category.name);
    }
    console.log(`Сохранено ${products.length} товаров: ${url}`);
}

// главная функция
async function scrapeCettire() {
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
        await scrapeCategory(page, cat);
        await new Promise(r => setTimeout(r, 3000));
    }
    await browser.close();
    console.log("Все товары сохранены в базу")
}
scrapeCettire();
