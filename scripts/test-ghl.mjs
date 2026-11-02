// Checks the GHL export in a browser. Usage: node scripts/serve-ghl.mjs & node scripts/test-ghl.mjs http://localhost:4300 <outDir>
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const [base = "http://localhost:4300", out = "."] = process.argv.slice(2);
const results = [], errors = [];
const check = (n, c, x = "") => results.push(`${c ? "PASS" : "FAIL"}  ${n} ${x}`);
const b = await chromium.launch();
const watch = (p) => { p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text())); };

// Every page at three widths: renders, no overflow
for (const w of [390, 768, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 } });
  for (const r of ["/", "/teenused", "/puksiirabi", "/soidukite-vedu", "/ehitustehnika-vedu", "/haagisveod", "/ettevottest", "/kontakt", "/privaatsus"]) {
    const p = await ctx.newPage(); watch(p);
    const res = await p.goto(base + r, { waitUntil: "networkidle" });
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const font = await p.evaluate(() => document.fonts.check("800 16px Archivo"));
    check(`${w} ${r} loads, no overflow, font`, res.status() === 200 && ov <= 0 && font, `overflow=${ov} font=${font}`);
    if (w !== 768) await p.screenshot({ path: `${out}/${w}${r.replace(/\//g, "_")}.png`, fullPage: r !== "/" });
    await p.close();
  }
  await ctx.close();
}

// Desktop interactions
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const hv = "[data-film-video]";
  await p.waitForFunction((s) => { const v = document.querySelector(s); return v && !v.paused && v.currentTime > 0.3; }, hv, { timeout: 45000 }).catch(() => {});
  check("film autoplays", await p.evaluate((s) => !document.querySelector(s).paused, hv));
  check("film visible after start", await p.evaluate((s) => document.querySelector(s).classList.contains("opacity-100"), hv));
  check("timecode updates", /^00:0\d \/ 00:10$/.test(await p.locator("[data-film-time]").innerText()));
  await p.getByRole("button", { name: "Peata video" }).first().click();
  check("pause works", await p.evaluate((s) => document.querySelector(s).paused, hv));
  await p.getByRole("button", { name: "Mängi video" }).first().click(); await p.waitForTimeout(400);
  check("play works", await p.evaluate((s) => !document.querySelector(s).paused, hv));
  // tabs
  await p.focus("[role=tab][aria-selected=true]");
  await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown");
  check("tabs: arrow keys", (await p.locator("[role=tab][aria-selected=true]").innerText()).toLowerCase().includes("ehitustehnika"));
  check("tabs: one visible panel, correct link", (await p.locator("[role=tabpanel]:not([hidden])").count()) === 1 && (await p.locator("[role=tabpanel]:not([hidden]) a", { hasText: "Loe lähemalt" }).getAttribute("href")) === "/ehitustehnika-vedu");
  // chapters
  const label = () => p.locator("[data-counter]").innerText();
  await p.evaluate(() => { const el = document.querySelector("li[data-index='2']"); scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.3); });
  await p.waitForTimeout(1500);
  check("chapters switch on scroll", (await label()) === "03" && (await p.locator("[data-cap-label]").innerText()).toLowerCase() === "laadimine");
  check("one chapter clip playing", await p.evaluate(() => [...document.querySelectorAll("[data-sticky-video]")].filter((v) => !v.paused).length === 1));
  check("hero film paused off screen", await p.evaluate((s) => document.querySelector(s).paused, hv));
  check("header turns solid on scroll", await p.evaluate(() => document.querySelector("header").classList.contains("backdrop-blur-xl")));
  await p.screenshot({ path: `${out}/chapters.png` });
  await p.close();
}
// Mobile menu
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); watch(p);
  await p.goto(base + "/teenused", { waitUntil: "networkidle" });
  await p.click("button[aria-controls=mobiilimenyy]");
  check("menu opens", await p.locator("#mobiilimenyy").isVisible());
  await p.keyboard.press("Escape");
  check("Escape closes menu", !(await p.locator("#mobiilimenyy").isVisible()));
  await p.click("button[aria-controls=mobiilimenyy]");
  await p.locator("#mobiilimenyy a", { hasText: "Kontakt" }).click();
  await p.waitForURL("**/kontakt");
  check("menu link navigates", true);
  check("form slot has fallback", await p.locator("[data-ghl-form-fallback]").isVisible());
  await p.close();
}
// Reduced motion
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage(); watch(p);
  await p.goto(base + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(2000);
  check("reduced motion: nothing autoplays", await p.evaluate(() => [...document.querySelectorAll("video")].every((v) => v.paused)));
  check("reduced motion: play offered", (await p.getByRole("button", { name: "Mängi video" }).count()) >= 1);
  await ctx.close();
}
await b.close();
console.log(results.join("\n"));
console.log(errors.length ? "CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n") : "No console errors");
