import puppeteer from "puppeteer";

export async function scrapeFlipkart(query) {
  const searchURL = `https://www.flipkart.com/search?q=${encodeURIComponent(
    query
  )}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(searchURL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for any of the common selectors
    await Promise.any([
      page.waitForSelector("a.s1Q9rs", { timeout: 15000 }),
      page.waitForSelector("div._4rR01T", { timeout: 15000 }),
      page.waitForSelector("a.CGtC98", { timeout: 15000 }),
    ]).catch(() => {});

    const product = await page.evaluate(() => {
      const title =
        document.querySelector("a.s1Q9rs, ._4rR01T, a.CGtC98")?.innerText.trim() ||
        "";
      const priceText =
        document
          .querySelector("._30jeq3, .Nx9bqj")
          ?.innerText.replace(/[₹,]/g, "") || null;
      const price = priceText ? parseInt(priceText) : null;
      const href =
        document.querySelector("a.s1Q9rs, a._1fQZEK, a.CGtC98")?.getAttribute("href") ||
        "";
      const link = href.startsWith("http")
        ? href
        : href
        ? `https://www.flipkart.com${href}`
        : "";
      const image =
        document.querySelector("img._396cs4, img._2r_T1I, img.DByuf4")?.getAttribute("src") ||
        "";

      return { title, price, link, image };
    });

    await browser.close();
    return { site: "Flipkart", ...product };
  } catch (error) {
    console.error("Flipkart scraper failed:", error.message);
    if (browser) await browser.close();
    return { site: "Flipkart", error: "Failed to fetch data" };
  }
}
