const jsdom = require("jsdom");
const delay = require("./delay");
const log = require("./log");

const cred = {
  host: process.env.HOST,
};

const getTableData = async (browser, colourLinksArr) => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  let fullDataArr = [];
  for (let tabNo = 0; tabNo < colourLinksArr.length; tabNo++) {
    log(
      `STEP 5 OF 5. Scrapped ${tabNo} of ${
        colourLinksArr.length
      } colour links. Still remains: ${colourLinksArr.length - tabNo}`
    );
    let tabTableData = [];
    try {
      const dom = new JSDOM(
        `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`
      );

      const tab = await browser.newPage();
      const colourLink = colourLinksArr[tabNo].link;
      const productCode = colourLink.split("/").at(-1);
      await tab.setViewport({ width: 1366, height: 768 });
      await tab.goto(cred.host + colourLink);
      await tab.waitForSelector("table.scroll-table__table"); // wait for selector only
      await tab.waitForSelector("table.scroll-table__table > thead > tr > th");
      const tableInnerHTML = await tab.$eval(
        "table.scroll-table__table",
        (el) => el.innerHTML
      );
      const tableHTMLelement = dom.window.document.createElement("table");
      tableHTMLelement.innerHTML = tableInnerHTML;
      const headerElsArr = [
        ...tableHTMLelement.querySelectorAll("thead > tr > th"),
      ];
      const bodyRowsArr = [...tableHTMLelement.querySelectorAll("tbody > tr")];
      const bodyRowsHeadersArr = [
        ...bodyRowsArr.map((br) => br.querySelector("th")),
      ].filter((el) => el);
      const itemsDataArrs = [
        ...bodyRowsArr.map((row) => row.querySelectorAll("td")),
      ];
      itemsDataArrs.forEach((itemDataArr, idy) => {
        const isRowHeaders = bodyRowsHeadersArr.length > 0;
        const circumference = isRowHeaders
          ? bodyRowsHeadersArr[idy]?.textContent
          : "";
        itemDataArr.forEach((dt, idx) => {
          const sizeLetter =
            headerElsArr[isRowHeaders ? idx + 1 : idx]?.textContent || "";
          let sizeLetterFitted = sizeLetter;
          if (sizeLetter.includes("XXL")) sizeLetterFitted = "2L";
          if (sizeLetter.includes("3XL")) sizeLetterFitted = "3L";
          if (sizeLetter.includes("4XL")) sizeLetterFitted = "4L";
          const state = dt.querySelector(".in_stock") ? 5 : 0;
          tabTableData = [
            ...tabTableData,
            {
              item:
                productCode +
                (circumference + sizeLetterFitted).replaceAll("\n", ""),
              isAvailableState: state,
            },
          ];
        });
      });
      fullDataArr = [...fullDataArr, ...tabTableData];
      await delay(2000); // wait 3secs before closing the tab
      await tab.close();
    } catch (err) {
      log(
        `Err: Something went wrong during scrapping one of colour pages: - page URL: ${colourLinksArr[tabNo]?.link}`,
        err
      );
      continue;
    }
    await delay(1000); // wait 2secs before opening the next tabNo
  }
  return JSON.stringify(fullDataArr);
};

module.exports = getTableData;
