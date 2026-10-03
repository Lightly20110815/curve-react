import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Config } from "tailwindcss";
import root from "../tailwind.config";

const dir = path.dirname(fileURLToPath(import.meta.url));
const rootExtend = root.theme?.extend ?? {};

const config: Config = {
  ...root,
  content: [
    path.join(dir, "index.html"),
    path.join(dir, "**/*.{ts,tsx}"),
    path.join(dir, "../src/**/*.{ts,tsx}"),
  ],
  theme: {
    ...root.theme,
    extend: {
      ...rootExtend,
      fontFamily: {
        ...(rootExtend.fontFamily ?? {}),
        masthead: [
          "Georgia",
          '"Times New Roman"',
          '"Songti SC"',
          '"Source Han Serif SC"',
          '"Noto Serif CJK SC"',
          "STSong",
          "SimSun",
          "serif",
        ],
      },
    },
  },
};

export default config;
