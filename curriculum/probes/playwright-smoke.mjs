import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto("data:text/html,<title>advanced-js-preflight</title>");
  const title = await page.title();
  if (title !== "advanced-js-preflight") {
    throw new Error(`Unexpected smoke-page title: ${title}`);
  }
  console.log(JSON.stringify({ chromium: browser.version(), title }));
} finally {
  await browser.close();
}
