const jsdom = require("jsdom");
const delay = require("./delay");
const log = require("./log");

const cred = {
  host: process.env.HOST,
};

const getCollectionLinks = async (browser, categoryLinksArr) => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  let fullCollectionLinksArr = [];
  const linksAmount = categoryLinksArr.length;
  for (let tabNo = 0; tabNo < categoryLinksArr.length; tabNo++) {
    try {
      log(
        `STEP 2 OF 5. Scrapped ${tabNo} of category links. Still remains: ${
          categoryLinksArr.length - tabNo
        }`
      );
      const dom = new JSDOM(
        `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`
      );
      const tab = await browser.newPage();
      const categoryLink = categoryLinksArr[tabNo].link;
      await tab.setViewport({ width: 1366, height: 768 });
      await tab.goto(cred.host + categoryLink);
      await tab.waitForSelector(".range-promo__list"); // wait for selector only
      const ulListInnerHTML = await tab.$$eval(".range-promo__list", (lists) =>
        lists.map((list) => list.innerHTML)
      );
      const ulListHTMLelement = dom.window.document.createElement("ul");
      ulListHTMLelement.innerHTML = ulListInnerHTML;
      const arrCollectionLis = [...ulListHTMLelement.children];
      fullCollectionLinksArr = [
        ...fullCollectionLinksArr,
        ...arrCollectionLis.map((el) => ({
          parentCategoryLink: categoryLink,
          link: el.getElementsByTagName("a")[0].href,
        })),
      ];
      await delay(2000); // wait 3secs before closing the tab
      await tab.close();
    } catch (err) {
      log(
        `Err: Something went wrong during scrapping one of category pages - page URL: ${categoryLinksArr[tabNo]?.link}`,
        err
      );
      continue;
    }
    await delay(1000); // wait 2secs before opening the next tabNo
  }
  log(`Found: ${fullCollectionLinksArr.length} collection links`);
  return JSON.stringify(fullCollectionLinksArr);
};

module.exports = getCollectionLinks;
