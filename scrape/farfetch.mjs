import puppeteer from "puppeteer";
import { saveProduct } from "../business_logic/business_logic.js";

// плавная прокрутка
async function autoScrollAndLoad(page) {
    let previousHeight = 0;
    while (true) {
        const currentHeight = await page.evaluate('document.body.scrollHeight');
        if (currentHeight === previousHeight) break;
        previousHeight = currentHeight;

        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000));
    }
}

// Парсим категорию
async function scrapeCategory(page, category) {
    const { id, name, url } = category;

    await page.goto( url, {waitUntil: "domcontentloaded", timeout: 70000});
    console.log("Загружаем категорию:", category);

    const showAllBtn = await page.$("#catalog-actions > div:nth-child(1) > button");
    
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
    await page.waitForSelector("#catalog-grid > li");

    console.log("Прокручиваем страницу, чтобы подгрузились все товары...");
    await autoScrollAndLoad(page);
    await new Promise(r => setTimeout(r, 3000));

    const buttons = await page.$$eval("button", btns => 
    btns.map(b => ({
        text: b.innerText,
        classes: b.className,
        id: b.id
    }))
    );
    console.log("Найденные кнопки:", buttons);
        await new Promise(r => setTimeout(r, 3000))

        // собираем товары
        const products = await page.$$eval('li[data-testid="productCard"]', items =>
        items.map(el => ({
            brand: el.querySelector('[data-testid="productDesignerName"]')?.innerText || "",
            title: el.querySelector('[data-testid="productDescription"]')?.innerText || "",
            price: el.querySelector('[data-testid="price"]')?.innerText || "",
            link: el.querySelector('a')?.href || "",
            img: el.querySelector('img')?.src || ""
        }))
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
async function scrapeFarfetch() {
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

    // список категорий Puma 
    const categories = [
    { id: 1, name: "Обувь", url: "https://www.farfetch.com/kz/shopping/women/puma/items.aspx?category=136301" },
    { id: 2, name: "Одежда", url: "https://www.farfetch.com/kz/shopping/women/puma/items.aspx?category=135967" },
    { id: 3, name: "Аксессуары", url: "https://www.farfetch.com/kz/shopping/women/puma/items.aspx?category=135973" },
    { id: 4, name: "Сумки", url: "https://www.farfetch.com/kz/shopping/women/puma/items.aspx?category=135971" }
    ];

    // запускаем парсинг по каждой категории
    for (let cat of categories) {
        await scrapeCategory(page, cat);
        await new Promise(r => setTimeout(r, 3000));
    }
    await browser.close();
    console.log("Все товары сохранены в базу");
}
scrapeFarfetch();
 