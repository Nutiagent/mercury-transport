// Renders the static hero fallbacks and the Open Graph image from the live 3D scene.
// Usage: start the site (npm run dev or npm start), then: node scripts/render-stills.mjs [baseUrl]
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");

const base = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

async function still(out, width, height, dpr) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr });
  await page.goto(base + "/?nointro", { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: "[data-overlay],header,nextjs-portal{visibility:hidden!important} picture{display:none!important}" });
  await page.waitForFunction(() => document.querySelector("canvas"), null, { timeout: 60000 });
  await page.waitForTimeout(+(process.env.WAIT || 20000));
  await page.screenshot({ path: out, type: "jpeg", quality: 84, timeout: 240000 });
  await page.close();
  console.log("wrote", out);
}

await still("public/images/hero-desktop.jpg", 1920, 1080, 1);
await still("public/images/hero-mobile.jpg", 430, 932, 2);

// Open Graph: static hero (uses the still just rendered) with the headline
const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto(base + "/?static", { waitUntil: "networkidle" });
await og.addStyleTag({
  content:
    "header nav, header [aria-controls], nextjs-portal, [data-hero-mode] .label, [data-hero-mode] p:not(.label), [data-hero-mode] a {display:none!important} [data-hero-mode] h1{font-size:78px!important}",
});
await og.waitForTimeout(2500);
await og.screenshot({ path: "public/og.jpg", type: "jpeg", quality: 86, timeout: 120000 });
console.log("wrote public/og.jpg");
await browser.close();
