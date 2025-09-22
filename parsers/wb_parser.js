import puppeteer from 'puppeteer';

async function scrapeSite() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    await page.goto('https://www.wildberries.ru/', { waitUntil: "domcontentloaded" });
    
    // каталог
    await page.waitForSelector('#catalogNavbarLink', { visible: true });
    await page.click('#catalogNavbarLink');

    // женщинам
    await page.waitForSelector('.menu-burger__main ul li:nth-child(6)', { visible: true });
    await page.click('.menu-burger__main ul li:nth-child(6)');
    
    // блузки и рубашки
    await page.waitForSelector('.menu-burger__first ul li a', { visible: true });
    await page.click('.menu-burger__first ul li a');
    
    // берем данные 
    await page.waitForSelector('article.product-card');

    const products = await page.$$eval('article.product-card', cards =>
            cards.map(card =>{
            const title = card.querySelector('.product-card__name')?.innerText.trim || "";
            const brand  = card.querySelector('.product-card__brand')?.innerText.trim || "";
            const img = card.querySelector('img')?.src || "";
            const price = card.querySelector('.price__lower-price')?.innerText.trim || "";
            // const seller = card.querySelector('.a')?.innerText.trim || "";
            const url = card.querySelector('a')?.href|| "";
            return{
                    title,
                    brand,
                    img,
                    price,
                    url
                };
            })
        );
    
    
        console.log("Products lists:", products.slice(0, 5));
        
    
        for (let product of products.slice(0.3)){
                await page.goto(product.url, {waitUntil: "domcontentloaded"});
        
                const details = await page.evaluate(() =>{
                        const title = document.querySelector('.product-card__name')?.innerText || "";
                        const brand = document.querySelector('.product-card__brand')?.innerText ||"";
                        // const seller = document.querySelector('#reactContainers > div:nth-child(2) > div > div.productPageContent--jaf94 > div.mainWrap--ZLbE5 > div.background--EIrtc.header--dsYHe > div > div.productCommonInfo--Xw57k > div > div:nth-child(1) > a')?.innerText || "";
                        const price = document.querySelector('.price__lower-price')?.innerText || "";
                        const img = document.querySelector('#reactContainers > div:nth-child(2) > div > div.productPageContent--jaf94 > div.mediaSlider--k1JWH > div > div > div > div.swiper-wrapper > div.swiper-slide.swiper-slide-active.mainSlide--TIHn4 > div > div.poster--YArsJ')?.innerText || "";
                        const url = document.querySelector('a')?.href || "";
                        return{
                                title,
                                brand,
                                // seller,
                                price,
                                img,
                                url
                            };
        });
        console.log({...product, ...details})
    }

    await browser.close()
}
scrapeSite()


