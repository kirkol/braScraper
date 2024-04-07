const ppt = require('puppeteer');
const jsdom = require('jsdom');
var fs = require('fs');
require('dotenv').config();

// get login & pass
const cred = {
  login: process.env.LOGIN,
  pass: process.env.PASS,
  page: process.env.PAGE,
};

const scrapBras = async () => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  const dom = new JSDOM(
    `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`,
  );
  let browser;
  let page;

  // launch a browser & log in the user
  try {
    browser = await ppt.launch({ headless: false }); // set to true after all checks (only for dev)
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(cred.page);
  } catch (err0) {
    console.log(err0); // handle err (write in separate file) LATER
  }

  // log in the user
  try {
    await Promise.all([
      await page.waitForSelector('#j_username'),
      await page.type('#j_username', cred.login, { delay: 300 }),
      await page.type('#j_password', cred.pass, { delay: 300 }),
      await page.click('#remember'),
    ]);
    await page.click('#login_btn');
  } catch (err1) {
    console.log(err1);
  }

  // get bra collections links from Collections sub menu (each collection link will need to be scrapped separately for its own sub-links)
  try {
    const mainNavUl = await page.waitForSelector('.nav_primary__list'); // wait for selector only
    const mainNavInnerHTML = await page.$eval(
      '.nav_primary__list',
      (el) => el.innerHTML,
    );

    const ulListHTMLelement = dom.window.document.createElement('ul');
    ulListHTMLelement.innerHTML = mainNavInnerHTML;

    const arrNavLis = [...ulListHTMLelement.children];
    const collectionsEl = arrNavLis.filter((el) =>
      el.querySelectorAll('a')[0].textContent.includes('Collections'),
    )[0]; // find "Collections" item from main menu items
    const arrCollectionsLis = [...collectionsEl.getElementsByTagName('li')];
    const links = arrCollectionsLis.map(
      (el) => el.getElementsByTagName('a')[0].href,
    );
    console.log(links);
  } catch (err2) {
    console.log(err2);
  }
  // await browser.close();
};

scrapBras();

// Przyda się, gdy trzeba będzie poczekać na załadowanie się kolejnej strony
//  page.waitForNavigation(waitOptions)
