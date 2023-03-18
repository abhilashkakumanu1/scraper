import puppeteer from "puppeteer";

export const getHtml = async (url) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // waited for unlimited time till the page loads
  await page.setDefaultNavigationTimeout(0);

  await page.goto(url, { waitUntil: "networkidle0" });

  const html = await page.content();
  await browser.close();
  return html;
};
