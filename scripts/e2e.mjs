// End-to-end checks of interactive behaviour. Usage: node scripts/e2e.mjs <configuredBase> <unconfiguredBase> <outDir>
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");
const [ok, nc, out = "."] = process.argv.slice(2);
const results = [];
const check = (name, cond, extra = "") => { results.push(`${cond ? "PASS" : "FAIL"}  ${name} ${extra}`); };
const gl = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const browser = await chromium.launch({ args: gl });
const errors = [];
const watch = (p) => { p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errors.push(m.text())); };

// 1. Urgent form: preselect, validation, success
{
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); watch(p);
  await p.goto(`${ok}/kontakt?teenus=puksiirabi#paring`, { waitUntil: "networkidle" });
  check("service preselected from ?teenus", await p.isChecked("input[value=puksiirabi]"));
  check("urgent call banner visible", await p.getByText("Seisad tee ääres?").isVisible());
  check("email optional for urgent", (await p.locator("input[name=email]").getAttribute("required")) === null);
  await p.click("button[type=submit]");
  check("client validation shows errors", await p.getByText("Kirjuta, kus sõiduk asub.").isVisible());
  check("focus moves to first invalid field", (await p.evaluate(() => document.activeElement?.getAttribute("name"))) === "pickup");
  check("aria-invalid set", (await p.getAttribute("input[name=pickup]", "aria-invalid")) === "true");
  await p.screenshot({ path: `${out}/form-errors.png`, fullPage: false });
  await p.fill("input[name=pickup]", "Tallinn, Peterburi tee 50");
  await p.fill("input[name=details]", "Audi A4, ei käivitu");
  await p.selectOption("select[name=urgency]", "kohe");
  await p.fill("input[name=name]", "Jaan Tamm");
  await p.fill("input[name=phone]", "+372 5123 4567");
  await p.waitForTimeout(2600);
  await p.click("button[type=submit]");
  await p.waitForSelector("text=Päring vastu võetud", { timeout: 15000 });
  check("success only after server accepted", await p.getByText("Aitäh, Jaan!").isVisible());
  await p.screenshot({ path: `${out}/form-success.png` });
  await p.close();
}
// 2. Field switching + not configured
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  await p.goto(`${nc}/kontakt`, { waitUntil: "networkidle" });
  check("no fields before service chosen", (await p.locator("input[name=pickup]").count()) === 0);
  check("honest notice when not configured", await p.getByText("veebivormi e-posti saatmine ei ole veel seadistatud").isVisible());
  await p.click("text=Ehitustehnika vedu");
  check("construction shows date field", (await p.locator("input[name=date]").count()) === 1);
  check("construction has no urgency select", (await p.locator("select[name=urgency]").count()) === 0);
  check("details label adapts", (await p.locator("label", { hasText: /^Tehnika/ }).count()) === 1);
  await p.fill("input[name=pickup]", "Tallinn");
  await p.fill("input[name=destination]", "Pärnu");
  await p.fill("input[name=details]", "Minikopp 1,8 t");
  await p.fill("input[name=name]", "Mari");
  await p.fill("input[name=phone]", "+37255555555");
  await p.fill("input[name=email]", "mari@example.com");
  await p.waitForTimeout(2600);
  await p.click("button[type=submit]");
  await p.waitForSelector("[role=alert] >> text=Veebivorm ei ole veel ühendatud", { timeout: 15000 });
  check("not_configured failure shown, no success", (await p.getByText("Päring vastu võetud").count()) === 0);
  check("mailto fallback offered", (await p.locator("a[href^='mailto:mercuryveod@gmail.com?subject=']").count()) === 1);
  check("entered data kept", (await p.inputValue("input[name=name]")) === "Mari");
  await p.screenshot({ path: `${out}/form-notconfigured.png`, fullPage: true });
  await p.close();
}
// 3. Mobile menu
{
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } }); watch(p);
  await p.goto(`${ok}/teenused`, { waitUntil: "networkidle" });
  await p.click("button[aria-controls=mobiilimenyy]");
  check("menu opens", await p.locator("#mobiilimenyy").isVisible());
  check("aria-expanded true", (await p.getAttribute("button[aria-controls=mobiilimenyy]", "aria-expanded")) === "true");
  await p.screenshot({ path: `${out}/menu-open.png` });
  await p.keyboard.press("Escape");
  check("Escape closes menu", !(await p.locator("#mobiilimenyy").isVisible()));
  await p.click("button[aria-controls=mobiilimenyy]");
  await p.locator("#mobiilimenyy").getByRole("link", { name: /Ettevõttest/ }).click();
  await p.waitForURL("**/ettevottest");
  await p.waitForTimeout(400);
  check("menu link navigates and closes", !(await p.locator("#mobiilimenyy").isVisible()));
  await p.close();
}
// 4. All internal links resolve
{
  const p = await browser.newPage(); watch(p);
  const seen = new Set(); const bad = [];
  for (const r of ["/", "/teenused", "/teenused/puksiirabi", "/ettevottest", "/kontakt", "/privaatsus"]) {
    await p.goto(ok + r, { waitUntil: "domcontentloaded" });
    const hrefs = await p.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
    hrefs.forEach((h) => seen.add(h.split("#")[0]));
  }
  for (const h of seen) { const res = await p.request.get(ok + h); if (res.status() !== 200) bad.push(`${h}:${res.status()}`); }
  check(`internal links (${seen.size}) return 200`, bad.length === 0, bad.join(" "));
  await p.close();
}
// 5. Service selector keyboard
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } }); watch(p);
  await p.goto(`${ok}/`, { waitUntil: "networkidle" });
  await p.focus("[role=tab][aria-selected=true]");
  await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown");
  check("arrow keys switch service tab", (await p.locator("[role=tab][aria-selected=true]").innerText()).includes("EHITUSTEHNIKA") || (await p.locator("[role=tab][aria-selected=true]").innerText()).toLowerCase().includes("ehitustehnika"));
  check("panel CTA preselects service", (await p.locator("[role=tabpanel] a", { hasText: "Küsi pakkumist" }).getAttribute("href")) === "/kontakt?teenus=ehitustehnika-vedu#paring");
  // 6. 3D hero desktop
  check("desktop hero uses 3D", (await p.getAttribute("[data-hero-mode]", "data-hero-mode")) === "3d");
  check("canvas mounted", (await p.locator("canvas").count()) === 1);
  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
  await p.waitForTimeout(3500);
  check("side-view services layer visible after scroll", await p.getByText("Üks platvorm. Neli lahendust.").isVisible());
  await p.screenshot({ path: `${out}/hero-side.png` });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(1500);
  await p.close();
}
await browser.close();
// 7. Reduced motion → static
{
  const b = await chromium.launch({ args: gl });
  const ctx = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); watch(p);
  await p.goto(`${ok}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  check("reduced motion → static hero", (await p.getAttribute("[data-hero-mode]", "data-hero-mode")) === "static" && (await p.locator("canvas").count()) === 0);
  check("reduced motion → no scroll pin", (await p.evaluate(() => document.querySelector("[data-hero-mode]").getBoundingClientRect().height)) <= 950);
  await p.screenshot({ path: `${out}/reduced.png` });
  await b.close();
}
// 8. No WebGL → static
{
  const b = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis"] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); watch(p);
  await p.goto(`${ok}/`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  check("no WebGL → static hero, CTAs present", (await p.getAttribute("[data-hero-mode]", "data-hero-mode")) === "static" && (await p.getByRole("link", { name: /Helista kohe/ }).first().isVisible()));
  await p.screenshot({ path: `${out}/nowebgl.png` });
  await b.close();
}
console.log(results.join("\n"));
console.log(errors.length ? "CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n") : "No console errors");
