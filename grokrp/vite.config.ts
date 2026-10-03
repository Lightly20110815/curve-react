import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const dir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dir, "..");

function overrideAliases() {
  const aliases: { find: string; replacement: string }[] = [];

  function walk(current: string) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(entry.name) || entry.name === "main.tsx" || entry.name === "vite.config.ts") {
        continue;
      }
      const rel = path.relative(dir, full).replace(/\\/g, "/").replace(/\.tsx?$/, "");
      aliases.push({ find: `@/${rel}`, replacement: full });
    }
  }

  walk(dir);
  aliases.sort((a, b) => b.find.length - a.find.length);
  aliases.push({ find: "@", replacement: path.join(projectRoot, "src") });
  return aliases;
}

export default defineConfig({
  root: dir,
  publicDir: path.join(projectRoot, "public"),
  envDir: projectRoot,
  plugins: [react()],
  resolve: {
    alias: overrideAliases(),
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: path.join(dir, "tailwind.config.ts") }),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 9888,
    host: true,
    strictPort: true,
  },
});
