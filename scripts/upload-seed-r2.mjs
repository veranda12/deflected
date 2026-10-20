// Uploads seed-assets/images and seed-assets/clients to the R2 media bucket under seed/<name>.<ext>,
// matching the media rows created by `npm run db:seed`. Requires `wrangler login`.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

const bucket = process.env.R2_MEDIA_BUCKET ?? "deflected-media";
const TYPES = { webp: "image/webp", png: "image/png" };
for (const dir of ["seed-assets/images", "seed-assets/clients"]) {
  for (const file of readdirSync(dir).filter((f) => /\.(webp|png)$/.test(f))) {
    const ext = file.split(".").pop();
    console.log(`uploading ${dir}/${file}`);
    execFileSync("npx", ["wrangler", "r2", "object", "put", `${bucket}/seed/${file}`, "--file", `${dir}/${file}`, "--content-type", TYPES[ext], "--remote"], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
  }
}
