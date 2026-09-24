import { readFileSync, writeFileSync } from "node:fs";

const lrc = readFileSync("/Users/syyann/Documents/反乌托邦Pt2_1080P.lrc", "utf8");

const lines = [];
for (const raw of lrc.split(/\r?\n/)) {
  const m = raw.match(/^\[(\d+):(\d+)\.(\d+)\](.*)$/);
  if (!m) continue;
  const start = Number(m[1]) * 60 + Number(m[2]) + Number(m[3]) / 100;
  const text = m[4].trim();
  if (text) lines.push({ text, start });
}

const out = lines.map((entry, i) => {
  const next = lines[i + 1];
  const end = next ? next.start : entry.start + 2.8;
  const backing = /^（.*）$/.test(entry.text);
  const chars = Array.from(entry.text);
  const span = Math.max(0.001, end - entry.start);
  const words = chars.map((ch, ci) => ({
    text: ch,
    start: entry.start + (ci / chars.length) * span,
    end: entry.start + ((ci + 1) / chars.length) * span,
  }));
  return { line: entry.text, start: entry.start, end, backing, words };
});

writeFileSync(
  "/Users/syyann/curve-react/src/content/dystopia-lyrics.json",
  JSON.stringify(out, null, 2) + "\n",
);
console.log(`wrote ${out.length} lines, last end=${out[out.length - 1].end.toFixed(2)}`);
