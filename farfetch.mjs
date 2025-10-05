import puppeteer from "puppeteer";
// import pkg from "pg";
// const { Client } = pkg;

// подключение к PostgreSQL
// const client = new Client({
//     user: "postgres",       
//     host: "localhost",      
//     database: "shop_parser",       
//     password: "060101",      
//     port: 5432
// });

async function scrapeSite() {
    // await client.connect();

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


    await page.waitForSelector("#catalog-actions > div:nth-child(1) > button", { visible: true })
    await page.click("#catalog-actions > div:nth-child(1) > button", { visible: true })

    await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > a > span", { visible: true })
    await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > a > span", { visible: true })

    // await page.waitForSelector("ul[data-testid='category-list'] li a span");

    // // Платья
    // const [dressBtn] = await page.$("//span[contains(text(),'Платья')]");
    // if (dressBtn) await dressBtn.click();

    // // Брюки
    // const [pantsBtn] = await page.$("//span[contains(text(),'Брюки')]");
    // if (pantsBtn) await pantsBtn.click();

    // // Топы
    // const [topsBtn] = await page.$("//span[contains(text(),'Топы')]");
    // if (topsBtn) await topsBtn.click();

    // // Юбки
    // const [skirtsBtn] = await page.$("//span[contains(text(),'Юбки')]");
    // if (skirtsBtn) await skirtsBtn.click();

    // // Куртки
    // const [jacketsBtn] = await page.$("//span[contains(text(),'Куртки')]");
    // if (jacketsBtn) await jacketsBtn.click();
    // // платья
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(1) > a > span", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(1) > a > span");
    
    // // брюки
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(2) > a > span", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(2) > a > span");
    
    // // топы
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(3) > a > span", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(3) > a > span");
    
    // // юбки 
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(4) > a > span", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(4) > a > span");
    
    // // тейлоринг
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(5) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(5) > a");
    
    // // деним
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(6) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(6) > a");
    
    // // шорты
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(7) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(7) > a");
    
    // куртки
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(8) > a > span", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(8) > a > span");
    
    // // пальто
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(9) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(9) > a");
    
    // // свитеры и трикотаж
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(10) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(10) > a");
    
    // // комбинизоны и ромперы
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(5) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(5) > a");
    
    // // пляжная одежда
    // await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(11) > a", {visible: true});
    // await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-1dhn2lm > div > section:nth-child(1) > div > div > ul > li:nth-child(1) > ul > li:nth-child(11) > a");

    const product_links = await page.$$('#catalog-actions > div.ltr-4ew8u6 > div > div > a')

    for (const key in product_links) {
        const element = object[key];
        console.log("ASDSADSDASD: ", element)
    }

    await page.waitForSelector("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-7wb2qp > div > button.ltr-6q0y14", { visible: true })
    await page.click("#root > div.ltr-0 > div.ltr-enrkee > div.ltr-1qaawqi > div > div.ltr-7wb2qp > div > button.ltr-6q0y14", { visible: true })

    await new Promise(r => setTimeout(r, 10000))

    // ждём список товаров
    await page.waitForSelector("ul[data-testid='product-list'] li");

    // // парсим товары
    // const products = await page.evaluate(() => {
    //     const items = [];
    //     document.querySelectorAll("ul[data-testid='product-list'] li").forEach(el => {
    //         const title = el.querySelector("p[data-component='ProductCardDescription']")?.innerText || "";
    //         const brand = el.querySelector("p[data-component='ProductCardBrandName']")?.innerText || "";
    //         const price = el.querySelector("span[data-testid='price']")?.innerText || "";
    //         const link = el.querySelector("a")?.href || "";
    //         const img = el.querySelector("img")?.src || "";
    //         items.push({ brand, title, price, link, img });
    //     });
    //     return items;
    // });

     // сохраняем в базу
    // for (let p of products) {
    //    await client.query(
    //     "INSERT INTO products (brand, title, price, link, img) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (link) DO NOTHING",
    //     [p.brand, p.title, p.price, p.link, p.img]
    //     );

    // }

    console.log("Все товары сохранены в базу");

    await browser.close();
    // await client.end();
}

scrapeSite();
