import puppeteer from "puppeteer";
import { addNewTopic } from "./business_logic/tengri_business_logic.js"


async function getOrCreateTopic(topicName) {
  const topic_id = await addNewTopic(topicName)

  console.log("Создана новая тема");
  return topic_id;
}

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://tengrinews.kz/news/", { waitUntil: "domcontentloaded" });

  let pagesLimit = 2;
  while (await page.$("body > div.my-app > main:nth-child(4) > section.first.rubric-second-container > ul > li:last-child > a.page-link") !== null) {
    if (pagesLimit > 2)
      break;

    pagesLimit++;

    const nextLink = await page.waitForSelector('body > div.my-app > main:nth-child(4) > section.first.rubric-second-container > ul > li:last-child > a.page-link', { visible: true })

    await page.waitForSelector('div.content.rubric > div.content_main > div.content_main_item');
    const newsList = await page.$$('div.content.rubric > div.content_main > div.content_main_item');

    for (let index = 0; index < newsList.length; index++) {
      if (index >= 7)
        break;
      const eachNews = newsList[index];

      const eachNewsLink = await eachNews.$('a')
      const linkHref = await eachNewsLink.evaluate((element) => element.href)

      const newTabPage = await browser.newPage();
      await newTabPage.goto(linkHref, { waitUntil: 'domcontentloaded' });

      const newsTitle = await newTabPage.waitForSelector('body > div.my-app > main:nth-child(4) > section.first > h1', { visible: true });

      const newsTitleText = await newsTitle.evaluate((element) => element.textContent.trim());

      const newsAuthor = await newTabPage.$('body > div.my-app > main:nth-child(4) > section.first > div > div.content_main > div.content_main_meta > div.content_main_meta_author > div > span', { visible: true });

      const newsAuthorFullname = null;

      if (newsAuthorFullname)
        newsAuthorFullname = await newsAuthor.evaluate((element) => element.textContent.trim());

      const newsContentMain = await newTabPage.waitForSelector('body > div.my-app > main:nth-child(4) > section.first > div > div.content_main > h2', { visible: true });

      const newsContentMainText = await newsContentMain.evaluate((element) => element.textContent.trim());

      const newsContentMainInner = await newTabPage.waitForSelector('body > div.my-app > main:nth-child(4) > section.first > div > div.content_main > div.content_main_inner', { visible: true });

      const newsParagraphs = await newsContentMainInner.$$('div.content_main_text > p', { visible: true });

      let newsTextContent = ""

      for (const parapraph of newsParagraphs) {
        const paragraphText = await parapraph.evaluate((element) => element.textContent.trim());
        newsTextContent += paragraphText + "\n";
      }

      newsTextContent = newsTextContent.trim();

      const newsDatePublished = await newTabPage.$eval(
        'meta[itemprop="datePublished"]',
        el => el.getAttribute('content')
      );

      const newTopic = await getOrCreateTopic('Новости');
      
      const authorName = "нет автора"
      
      console.log("ДАННЫЕ СТАТЬИ: ", newsTitleText,
      newsTextContent,
      newTopic,
      newsDatePublished,
      authorName)
      // console.log(newsAuthorFullname)
      // if (newsAuthorFullname !== null) 
      //   authorName = newsAuthorFullname

      const newArticle = await insertNewArticle(
        newsTitleText,
        newsTextContent,
        newTopic,
        newsDatePublished,
        authorName
      );

      const moreCommentsButton = await newTabPage.$('button.tn-button.more-comments')

      if (moreCommentsButton) {
        moreCommentsButton.click();
        await new Promise(r => setTimeout(r, 2000));

        const commentsList = await newTabPage.$$('div.tn-comment-accordion-content > div.overlay > div > div > div')

        for (let index = 0; index < commentsList.length; index++) {
          const commentDiv = commentsList[index];

          const textBlock = await commentDiv.$('div.tn-comment-item-content-text');
          if (textBlock) {
            const text = await textBlock.evaluate((element) => element.textContent.trim());

            const comment = await insertNewComment(
              newArticle.id,
              text,
              new Date(),
              'John Doe'
            )
          }
        }
      }
      else {
        const commentsList = await newTabPage.$$('div.tn-comment-prev > div');

        if (commentsList.length !== 0) {
          for (const commentDiv of commentsList) {
            const textBlock = await commentDiv.$('div.tn-comment-item-content-text');
            const text = await textBlock.evaluate((element) => element.textContent.trim());
          }
        }
      }

      await newTabPage.close();
    }

    await nextLink.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
}

scrape();
