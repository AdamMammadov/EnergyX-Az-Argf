// Yeniləmədən sonra köhnə JS/CSS ilə yeni HTML-in qarışmaması üçün qoruyucu test:
// index.html-dəki bütün yerli JS/CSS ?v= ilə versiyalanmalı və sw.js-dəki VERSION ilə eyni olmalıdır.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..", "frontend");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const swVersion = (sw.match(/const VERSION = "([^"]+)"/) || [])[1];

test("sw.js VERSION təyin olunub", () => {
  assert.ok(swVersion, "sw.js-də VERSION tapılmadı");
});

test("bütün yerli JS/CSS faylları versiyalıdır və SW ilə eyni versiyadadır", () => {
  const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length >= 6, "yerli JS/CSS istinadları tapılmadı");
  for (const ref of refs) {
    const m = ref.match(/^(.+)\?v=(.+)$/);
    assert.ok(m, `${ref} versiyasızdır (?v= yoxdur)`);
    assert.equal(m[2], swVersion, `${ref} versiyası sw.js VERSION (${swVersion}) ilə eyni deyil`);
    assert.ok(fs.existsSync(path.join(root, m[1])), `${m[1]} faylı mövcud deyil`);
  }
});

test("sw.js eyni faylları oflayn üçün öncədən keşləyir", () => {
  for (const f of ["css/pro.css", "css/layout.css", "css/theme.css", "js/engine.js", "js/pro.js", "js/extras.js", "js/ux.js", "js/lab.js", "js/home.js"]) {
    assert.ok(sw.includes(`"${f}"`), `${f} sw.js CORE siyahısında yoxdur`);
  }
});

test("app-version meta etiketi SW versiyası ilə eynidir", () => {
  const meta = (html.match(/<meta name="app-version" content="([^"]+)">/) || [])[1];
  assert.equal(meta, swVersion);
});

// Canlı saytda Chart.js CDN ünvanı 404 verirdi və bütün qrafiklər boş qalırdı.
// Kitabxanalar saytın öz serverində saxlanılır: xarici skript olmamalı, vendor faylları mövcud olmalıdır.
test("index.html xarici skript yükləmir, vendor kitabxanaları yerindədir", () => {
  const external = [...html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(external, [], "xarici skriptlər: " + external.join(", "));
  const vendor = [...html.matchAll(/<script[^>]+src="(vendor\/[^"?]+)"/g)].map((m) => m[1]);
  assert.ok(vendor.length >= 1, "vendor skripti tapılmadı");
  for (const v of vendor) {
    assert.ok(fs.existsSync(path.join(root, v)), `${v} mövcud deyil`);
    assert.ok(sw.includes(`"${v}"`), `${v} sw.js CORE siyahısında yoxdur`);
  }
  const pro = fs.readFileSync(path.join(root, "js", "pro.js"), "utf8");
  const lazy = (pro.match(/s\.src = "(vendor\/[^"]+)"/) || [])[1];
  assert.ok(lazy && fs.existsSync(path.join(root, lazy)), "jsPDF faylı tapılmadı: " + lazy);
});
