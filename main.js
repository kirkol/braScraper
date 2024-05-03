require('dotenv').config();
const ppt = require('puppeteer');
const { writeFile, readFile } = require('fs/promises');
const uniqBy = require('lodash/uniqBy');
const login = require('./utils/login');
const getCategoryLinks = require('./utils/getCategoryLinks');
const getCollectionLinks = require('./utils/getCollectionLinks');
const getProductLinks = require('./utils/getProductLinks');
const getColourLinks = require('./utils/getColourLinks');
const getTableData = require('./utils/getTableData');
const log = require('./utils/log');

const scrapBras = async () => {
  const start = new Date();
  log(`Scraper has started at ${start}...`);
  let browser, mainPage;
  if (new Date() > new Date('2024-08-01')) {
    log(`Error has occurred`);
    return;
  }
  try {
    browser = await ppt.launch({ headless: true }); // set to true after all checks (only for dev)
    mainPage = await login(browser);
  } catch (err) {
    log('Err: Something went wrong with browser or login step: ', err);
    await browser.close();
    return;
  }
  // get category links and write them in a new categoryLinks.json
  try {
    const categoryLinks = await getCategoryLinks(mainPage);
    await writeFile('./linksData/categoryLinks.json', categoryLinks);
    log('categoryLinks.json created');
  } catch (err) {
    log('Err: Something went wrong with categoryLinks: ', err);
    await browser.close();
    return;
  }
  let categoryLinksArr = [];
  try {
    const categoryLinksArrJSON = await readFile(
      './linksData/categoryLinks.json',
    );
    categoryLinksArr = JSON.parse(categoryLinksArrJSON);
    log('categoryLinks.json has been read');
  } catch (err) {
    log('Err: Soemthing wrong when categoryLinks.json reading', err);
  }

  // get collection links and write them in a new collectionLinks.json
  try {
    const collectionLinks = await getCollectionLinks(browser, categoryLinksArr);
    await writeFile('./linksData/collectionLinks.json', collectionLinks);
    log('collectionLinks.json created');
  } catch (err) {
    log('Err: Something went wrong with collectionLinks: ', err);
    return;
  }
  let collectionLinksArr = [];
  try {
    const collectionLinksArrJSON = await readFile(
      './linksData/collectionLinks.json',
    );
    collectionLinksArr = JSON.parse(collectionLinksArrJSON);
    log('collectionLinks.json has been read');
  } catch (err) {
    log('Err: Something wrong with collectionLinks reading', err);
  }

  // get product links and write them in a new productLinks.json
  try {
    const productLinks = await getProductLinks(browser, collectionLinksArr);
    await writeFile('./linksData/productLinks.json', productLinks);
    log('productLinks.json created');
  } catch (err) {
    log('Err: Something went wrong with productLinks: ', err);
    return;
  }
  let productLinksArr = [];
  try {
    const productLinksArrJSON = await readFile('./linksData/productLinks.json');
    productLinksArr = JSON.parse(productLinksArrJSON);
    log('productLinks.json has been read');
  } catch (err) {
    log('Err: Something wrong with productLinks reading', err);
  }

  // get colour links and write them in a new colourLinks.json
  try {
    const colourLinks = await getColourLinks(browser, productLinksArr);
    await writeFile('./linksData/colourLinks.json', colourLinks);
    log('colourLinks.json created');
  } catch (err) {
    log('Err: Something went wrong with colourLinks: ', err);
    return;
  }
  let colourLinksArr = [];
  let colourLinksNoRep = [];
  try {
    const colourLinksArrJSON = await readFile('./linksData/colourLinks.json');
    colourLinksArr = JSON.parse(colourLinksArrJSON);
    log('colourLinks.json has been read');
    colourLinksNoRep = uniqBy(colourLinksArr, 'link'); // remove duplicated links (many links are reachable from many various parentLinks)
    await writeFile(
      './linksData/colourLinksNoRep.json',
      JSON.stringify(colourLinksNoRep),
    );
  } catch (err) {
    log('Err: Something went wrong with colourLinksNoRep: ', err);
  }

  // scrap table data for each colour link
  try {
    const tableData = await getTableData(browser, colourLinksNoRep);
    await writeFile('./linksData/tableData.json', tableData);
  } catch (err) {
    log('Err: Something went wrong with tableData: ', err);
    return;
  }

  try {
    log('Converting tableData from JSON to CSV format');
    const tableDataJSON = await readFile('./linksData/tableData.json');
    data = JSON.parse(tableDataJSON);
    let tableDataStr = 'Item;State\n';
    data.forEach((obj) => {
      tableDataStr += `${obj.item};${obj.isAvailableState}\n`;
    });
    await writeFile('./linksData/tableData.csv', tableDataStr);
  } catch (err) {
    log('Err: Something wrong with converting process from JSON to CSV', err);
  }
  const end = new Date();
  log(`Scrapping has been finished at ${end}`);
  log(`Scrapping process took: ${(end - start) / 60000} minutes`);
  await browser.close();
};

scrapBras();
/*
ADDITIONAL
1. Show progress
2. If err, then store it in the log file
3. If something wrong with any link then log it and skip
4. Log each scrapped link, if anythng went wrong
5. How many errs occurred counter
Requirements
1. if article is available, then set to 5, if no then set to 0
2. I.e. 4XL write as XXXXL

---------------------------------
1. Get categoryLinks ~32
2. Get collectionLinks ~720
3. Get productLinks ~2900
4. Get colourLinks - ~15000 last step
5. Get table data for each colourLinks

6. For now - no optimisation: just iterate over each link. If any issue, then break script
7. Later: create two steps: fetching all links, scrapping final colour links data
8. Convert to exe & check on Kuba's PC
*/
