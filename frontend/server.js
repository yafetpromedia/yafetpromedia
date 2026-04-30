/**
 * Production entry for hosts that require a concrete startup file (e.g. cPanel Node.js).
 * Run after `next build`. Uses PORT from the environment.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const hostname = "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
