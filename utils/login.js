const log = require("./log");
// get login & pass
const cred = {
  login: process.env.LOGIN,
  pass: process.env.PASS,
  loginPage: process.env.LOGIN_PAGE,
};

const login = async (browser) => {
  let page;

  // 0. Always launch the browser & log in the user
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(`${cred.loginPage}`);
  } catch (err) {
    log("Err: ", err); // handle err (write in separate file) LATER
    throw "Login error";
  }

  try {
    await Promise.all([
      await page.waitForSelector("#j_username"),
      await page.type("#j_username", cred.login, { delay: 300 }),
      await page.type("#j_password", cred.pass, { delay: 300 }),
      await page.click("#remember"),
    ]);
    await page.click("#login_btn");
    log("Log in accomplished");
  } catch (err) {
    log("Err: Something went wrong with login stage", err);
    throw "Login error";
  }

  return page;
};

module.exports = login;
