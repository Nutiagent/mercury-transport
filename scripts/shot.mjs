// Usage: node scripts/shot.mjs <url> <out.png> <width> <height> [scrollY] [fullPage]
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const [url, out, w = "1440", h = "900", scrollY = "0", full = "0"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
if (process.env.HIDE) await page.addStyleTag({ content: "[data-overlay],header{visibility:hidden!important}" });
await page.waitForTimeout(+(process.env.WAIT || 6000));
if (+scrollY) { await page.evaluate((y) => window.scrollTo(0, y), +scrollY); await page.waitForTimeout(3500); }
await page.screenshot({ path: out, fullPage: full === "1", timeout: 120000 });
console.log(logs.join("\n") || "no console errors");
await browser.close();
