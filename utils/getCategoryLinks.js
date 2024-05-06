const jsdom = require("jsdom");
const log = require("./log");

const getCategoryLinks = async (mainPage) => {
  const { JSDOM } = jsdom; // lets node env to create a HTML document
  const dom = new JSDOM(
    `<!DOCTYPE html><p>Working document for HTML DOM operations</p>`
  );
  let linksStr = "[]";
  try {
    await mainPage.waitForSelector(".nav_primary__list"); // wait for selector only
    const mainNavInnerHTML = await mainPage.$eval(
      ".nav_primary__list",
      (el) => el.innerHTML
    );

    const ulListHTMLelement = dom.window.document.createElement("ul");
    ulListHTMLelement.innerHTML = mainNavInnerHTML;

    const arrNavLis = [...ulListHTMLelement.children];
    const categoryEl = arrNavLis.filter((el) =>
      el.querySelectorAll("a")[0].textContent.includes("Collections")
    )[0]; // find "Collections" item from main menu items
    const arrCategoryLis = [...categoryEl.getElementsByTagName("li")];
    const links = arrCategoryLis.map((el) => ({
      link: el.getElementsByTagName("a")[0].href,
    }));
    log(`STEP 1 OF 5. Found: ${links.length} category links`);
    linksStr = JSON.stringify(links);
    return linksStr;
  } catch (err) {
    log("Err: Something wrong happened in getCategoryLinks.js ", err);
  }
  return linksStr;
};

module.exports = getCategoryLinks;
