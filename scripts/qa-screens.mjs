// Responsive QA: loads pages at several widths in headless Chrome, scrolls to
// trigger reveal animations, reports horizontal overflow and small tap targets,
// and saves full-page screenshots.
// Usage: node --experimental-websocket scripts/qa-screens.mjs [baseUrl] [outDir] [widths] [paths]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? ".dev/qa";
const widths = (process.argv[4] ?? "360,390,768,1440").split(",").map(Number);
const paths = (process.argv[5] ?? "/,/tentang,/layanan,/katalog,/produk/kaos-cotton-combed,/portofolio,/portofolio/pln-sinjai-jersey-set,/kontak").split(",");
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
mkdirSync(out, { recursive: true });

const proc = spawn(chrome, ["--headless=new", "--remote-debugging-port=9333", "--no-first-run", "--hide-scrollbars", `--user-data-dir=${out}/profile`, "about:blank"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const targets = await (await fetch("http://127.0.0.1:9333/json")).json();
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const evalJs = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable");
const report = [];
for (const w of widths) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: w < 800 ? 844 : 900, deviceScaleFactor: 1, mobile: process.env.QA_NOMOBILE ? false : w < 800 });
  for (const p of paths) {
    await send("Page.navigate", { url: base + p });
    await sleep(2500);
    // Scroll through the page so IntersectionObserver reveals everything.
    await evalJs(`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,90))}scrollTo(0,0);await new Promise(r=>setTimeout(r,1300))})()`);
    const info = await evalJs(`(()=>{
      const vw=document.documentElement.clientWidth;
      const wide=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>vw+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('[aria-hidden=true],.overflow-x-auto,.overflow-hidden,dialog')};
      const over=[...document.querySelectorAll('body *')].filter(e=>wide(e)&&![...e.children].some(wide)).slice(0,5).map(e=>e.tagName+'.'+String(e.className).slice(0,60)+' r='+Math.round(e.getBoundingClientRect().right));
      const small=[...document.querySelectorAll('a,button,input,select,textarea,label[class*=cursor]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.height<40&&!e.closest('nav[aria-label=Breadcrumb],footer,p,dd,li.text-sm')&&getComputedStyle(e).position!=='absolute'}).slice(0,6).map(e=>(e.innerText||e.getAttribute('aria-label')||e.name||'').trim().slice(0,30)+' '+Math.round(e.getBoundingClientRect().height)+'px');
      return {rendered:!!document.querySelector("#konten h1"),scrollW:document.documentElement.scrollWidth,vw,over,small,h:document.documentElement.scrollHeight}})()`);
    // Grow the viewport to the full document height, then capture it in one shot.
    const fullH = Math.min(16000, info.h);
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: fullH, deviceScaleFactor: 1, mobile: process.env.QA_NOMOBILE ? false : w < 800 });
    await sleep(600);
    const { result } = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: w < 800 ? 844 : 900, deviceScaleFactor: 1, mobile: process.env.QA_NOMOBILE ? false : w < 800 });
    const name = `${w}${p.replace(/\//g, "_") || "_home"}.jpg`;
    writeFileSync(`${out}/${name}`, Buffer.from(result.data, "base64"));
    report.push({ w, p, overflow: info.scrollW > info.vw, ...info });
    console.log(`${w}px ${p}: ${info.rendered ? "" : "NOT RENDERED "}scrollW=${info.scrollW} vw=${info.vw} ${info.scrollW > info.vw ? "OVERFLOW " + info.over.join(" | ") : "ok"}${info.small.length ? " small:" + info.small.join(", ") : ""}`);
  }
}
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
ws.close();
proc.kill();
process.exit(0);
