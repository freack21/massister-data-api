const CONFIG = require("./config");
const puppeteer = require("puppeteer-core");

module.exports = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CONFIG.chrome || "/usr/bin/google-chrome-stable",
      headless: false,
      defaultViewport: null,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    });
    return Promise.resolve(browser);
  } catch (error) {
    return Promise.reject(error);
  }
};
