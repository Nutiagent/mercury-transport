// Captures full-page screenshots of every route at three widths and reports console errors.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const base = process.argv[2] || "http://localhost:3100";
const outDir = process.argv[3] || "./shots";
const routes = (process.env.ROUTES || "/,/teenused,/teenused/puksiirabi,/teenused/ehitustehnika-vedu,/ettevottest,/kontakt,/privaatsus,/olematu-leht").split(",");
const widths = (process.env.WIDTHS || "390,768,1440").split(",").map(Number);
const fs = require("fs");
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : w < 1000 ? 1024 : 900 }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
  for (const r of routes) {
    const page = await ctx.newPage();
    const logs = [];
    page.on("console", (m) => { if (m.type() === "error" || (m.type()==="warning" && !/THREE\.Clock|PCFSoft/.test(m.text()))) logs.push(`${m.type()}: ${m.text()}`); });
    page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
    const res = await page.goto(base + r, { waitUntil: "networkidle", timeout: 120000 });
    await page.waitForTimeout(r === "/" ? 6000 : 1200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = `${outDir}/${w}${r.replace(/\//g, "_") || "_home"}.png`;
    await page.screenshot({ path: name, fullPage: process.env.FULL !== "0" });
    console.log(`${w} ${r} status=${res.status()} overflowX=${overflow} ${logs.length ? "\n   " + logs.join("\n   ") : ""}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
