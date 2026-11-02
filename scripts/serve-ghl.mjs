// Serves the GHL export locally the way GHL would route it. Usage: node scripts/serve-ghl.mjs [port]
import http from "http";
import fs from "fs";
import path from "path";
const root = process.cwd();
const dist = path.join(root, "ghl/dist");
const pages = JSON.parse(fs.readFileSync(path.join(dist, "pages.json"), "utf8"));
const types = { ".css": "text/css", ".js": "text/javascript", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".html": "text/html; charset=utf-8" };
const port = Number(process.argv[2] || 4300);
http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file;
    if (url.startsWith("/media/")) file = path.join(root, "public", url);
    else if (url === "/mercury.css" || url === "/mercury.js") file = path.join(dist, url);
    else {
      const p = pages.find((x) => x.path === url.replace(/\/$/, "") || (url === "/" && x.path === "/"));
      file = p ? path.join(dist, "preview", `${p.page}.html`) : null;
    }
    if (!file || !fs.existsSync(file)) { res.writeHead(404); return res.end("404"); }
    const stat = fs.statSync(file);
    const type = types[path.extname(file)] || "application/octet-stream";
    const range = req.headers.range;
    if (range && type === "video/mp4") {
      const [s, e] = range.replace("bytes=", "").split("-");
      const start = Number(s), end = e ? Number(e) : stat.size - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Accept-Ranges": "bytes" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`GHL preview on http://localhost:${port}`));
