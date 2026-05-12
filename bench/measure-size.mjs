// Measures the gzipped + raw size of every artifact produced by `vite build`.
//
// Run after `npm run build`. Writes bench/size.json.
//
// We don't ship a bundler script — Vite handles that. This is purely a
// reporting layer so the README can show a real number.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { promisify } from "node:util";

const gzip = promisify(zlib.gzip);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DIST = path.join(ROOT, "dist");

async function* walk(dir) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function main() {
  if (!(await fs.stat(DIST).catch(() => null))) {
    console.error("dist/ not found — run `npm run build` first");
    process.exit(2);
  }
  const out = [];
  for await (const file of walk(DIST)) {
    const buf = await fs.readFile(file);
    const gz = await gzip(buf, { level: 9 });
    out.push({
      file: path.relative(DIST, file).replace(/\\/g, "/"),
      raw_bytes: buf.length,
      gzipped_bytes: gz.length,
    });
  }
  out.sort((a, b) => b.raw_bytes - a.raw_bytes);
  const sums = out.reduce(
    (acc, x) => ({ raw: acc.raw + x.raw_bytes, gz: acc.gz + x.gzipped_bytes }),
    { raw: 0, gz: 0 },
  );
  const report = {
    totals: {
      raw_bytes: sums.raw, raw_kb: +(sums.raw / 1024).toFixed(2),
      gzipped_bytes: sums.gz, gzipped_kb: +(sums.gz / 1024).toFixed(2),
    },
    files: out,
  };
  await fs.writeFile(
    path.join(ROOT, "bench", "size.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}

main();
