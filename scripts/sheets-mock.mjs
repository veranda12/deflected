// Local mock of the Google OAuth token endpoint and Sheets values API, used to
// test the inquiry -> Sheets sync (signing, append, retry, dedupe) without real
// credentials. Run: node scripts/sheets-mock.mjs   (port 4555)
// Control: POST /__mode?m=ok|fail|fail-after-write   GET /__rows
import { generateKeyPairSync, createVerify } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
mkdirSync(".dev", { recursive: true });
writeFileSync(".dev/mock-sa-key.pem", privateKey.export({ type: "pkcs8", format: "pem" }));

const rows = [];
let mode = "ok";
const tokens = new Set();

function b64urlDecode(s) {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let body = "";
  for await (const chunk of req) body += chunk;
  const send = (code, data) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  if (url.pathname === "/__mode") {
    mode = url.searchParams.get("m") ?? "ok";
    return send(200, { mode });
  }
  if (url.pathname === "/__rows") return send(200, { rows });

  if (url.pathname === "/token") {
    const assertion = new URLSearchParams(body).get("assertion") ?? "";
    const [h, c, sig] = assertion.split(".");
    const verify = createVerify("RSA-SHA256");
    verify.update(`${h}.${c}`);
    const ok = sig && verify.verify(publicKey, b64urlDecode(sig));
    const claims = ok ? JSON.parse(b64urlDecode(c).toString()) : null;
    if (!ok || claims.scope !== "https://www.googleapis.com/auth/spreadsheets") return send(401, { error: "invalid_grant" });
    const token = `tok_${Math.random().toString(36).slice(2)}`;
    tokens.add(token);
    return send(200, { access_token: token, expires_in: 3600 });
  }

  if (url.pathname.startsWith("/v4/spreadsheets/")) {
    const auth = (req.headers.authorization ?? "").replace("Bearer ", "");
    if (!tokens.has(auth)) return send(401, { error: "unauthenticated" });
    if (req.method === "GET") return send(200, { values: rows.map((r) => [r[0]]) });
    if (req.method === "POST" && url.pathname.includes(":append")) {
      if (mode === "fail") return send(503, { error: "backendError" });
      const { values } = JSON.parse(body);
      rows.push(...values);
      if (mode === "fail-after-write") return send(500, { error: "internal" });
      return send(200, { updates: { updatedRows: values.length } });
    }
  }
  send(404, { error: "not found" });
});

server.listen(4555, () => console.log("sheets mock on http://localhost:4555"));
