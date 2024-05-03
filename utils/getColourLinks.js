const jsdom = require('jsdom');
const delay = require('./delay');
const log = require('./log');

const cred = {
  host: process.env.HOST,
};

const getColourLinks = async (browser, productLinksArr) => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  let fullColourLinksArr = [];
  for (let tabNo = 0; tabNo < productLinksArr.length; tabNo++) {
    try {
      log(
        `STEP 4 OF 5. Scrapped ${tabNo} of product links. Still remains: ${
          productLinksArr.length - tabNo
        }`,
      );
      const dom = new JSDOM(
        `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`,
      );

      const tab = await browser.newPage();
      const productLink = productLinksArr[tabNo].link;
      await tab.setViewport({ width: 1366, height: 768 });
      await tab.goto(cred.host + productLink);
      await tab.waitForSelector('ul.colour-list'); // wait for selector only
      const ulListInnerHTML = await tab.$eval(
        'ul.colour-list',
        (el) => el.innerHTML,
      );
      const ulListHTMLelement = dom.window.document.createElement('ul');
      ulListHTMLelement.innerHTML = ulListInnerHTML;
      const arrProductLis = [...ulListHTMLelement.children];
      const arrProductLisFiltered = arrProductLis.filter(
        (el) => el.nodeName === 'LI',
      );
      fullColourLinksArr = [
        ...fullColourLinksArr,
        ...arrProductLisFiltered.map((el) => ({
          parentProductLink: productLink,
          link: el.getElementsByTagName('a')[0].href,
        })),
      ];
      await delay(2000); // wait 3secs before closing the tab
      await tab.close();
    } catch (err) {
      log(
        `Err: Something went wrong during scrapping one of product pages - page URL: ${productLinksArr[tabNo]?.link}`,
        err,
      );
      continue;
    }
    await delay(1000); // wait 2secs before opening the next tabNo
  }
  log(
    `Found: ${fullColourLinksArr.length} colour links - that\'s the last stage of fetching links`,
  );
  return JSON.stringify(fullColourLinksArr);
};

module.exports = getColourLinks;
