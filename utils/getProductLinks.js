const jsdom = require('jsdom');
const delay = require('./delay');
const log = require('./log');

const cred = {
  host: process.env.HOST,
};

const getProductLinks = async (browser, collectionLinksArr) => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  let fullProductLinksArr = [];
  for (let tabNo = 0; tabNo < collectionLinksArr.length; tabNo++) {
    try {
      log(
        `STEP 3 OF 5. Scrapped ${tabNo} of collection links. Still remains: ${
          collectionLinksArr.length - tabNo
        }`,
      );
      const dom = new JSDOM(
        `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`,
      );
      const tab = await browser.newPage();
      const collectionLink = collectionLinksArr[tabNo].link;
      await tab.setViewport({ width: 1366, height: 768 });
      await tab.goto(cred.host + collectionLink);
      await tab.waitForSelector('ul.product-grid'); // wait for selector only
      const ulListInnerHTML = await tab.$eval(
        'ul.product-grid',
        (el) => el.innerHTML,
      );
      const ulListHTMLelement = dom.window.document.createElement('ul');
      ulListHTMLelement.innerHTML = ulListInnerHTML;
      const arrProductLis = [...ulListHTMLelement.children];
      fullProductLinksArr = [
        ...fullProductLinksArr,
        ...arrProductLis.map((el) => ({
          parentCollectionLink: collectionLink,
          link: el.getElementsByTagName('a')[0].href,
        })),
      ];
      await delay(2000); // wait 3secs before closing the tab
      await tab.close();
    } catch (err) {
      log(
        `Err: Something went wrong during scrapping one of collection pages - page URL: ${collectionLinksArr[tabNo]?.link}`,
        err,
      );
      continue;
    }
    await delay(1000); // wait 2secs before opening the next tabNo
  }
  log(`Found: ${fullProductLinksArr.length} product links`);
  return JSON.stringify(fullProductLinksArr);
};

module.exports = getProductLinks;
