import { site } from "@/lib/site";

export interface ColophonEntry {
  label: string;
  value: string;
}

export interface TerminalBootLine {
  kind: "system" | "prompt" | "output" | "accent" | "muted";
  text: string;
}

export const aboutIntroHeading = "我是 Sy。";

export const aboutIntroParagraphs = [
  "住在某个时区的人类。喜欢把代码当作纸笔，把日子写得轻一点。这里不是教程站，更像一份公开的便签本，写给可能在某个深夜路过的你。",
  "我没有发刊周期，也不打算保证更新频率。一切以“想写”为准。所以你看到的每一篇文章，都是某个时刻的我，写给某个时刻的你。",
] as const;

export const aboutPullQuote = {
  attribution: "hello-world, 第一篇",
  content: "这里是一个小小的角落，一个勉强算是“家”的地方。",
} as const;

export const aboutColophonEntries: ColophonEntry[] = [
  { label: "Press · 排版机", value: "Vite + React 18" },
  { label: "Layout · 版式", value: "Tailwind CSS" },
  { label: "Type · 字体", value: "Playfair Display · Cormorant · Noto Serif SC" },
  { label: "Composing · 排字", value: "Markdown → JSON 构建期管线" },
  { label: "Music · 报刊电台", value: "Meting API · HTML5 audio" },
  { label: "Hosting · 印厂", value: "Static site, anywhere" },
] as const;

export const aboutContactCopy = {
  heading: "想说点什么？随时来信。",
  body:
    "邮件、GitHub Issue、随笔评论 — 哪个顺手用哪个。我不一定回得快，但一定会读。",
} as const;

export function buildTerminalAboutScript(): TerminalBootLine[] {
  return [
    { kind: "system", text: "[boot] Konami code accepted. Switching to CRT shell..." },
    { kind: "system", text: "[boot] Loading hidden profile routine from /masthead/about.sys" },
    { kind: "prompt", text: "visitor@curve:~$ whoami" },
    { kind: "accent", text: "Sy // GitHub: lightly20110815" },
    { kind: "prompt", text: "visitor@curve:~$ cat about.txt" },
    ...aboutIntroParagraphs.map((text) => ({ kind: "output" as const, text })),
    { kind: "prompt", text: "visitor@curve:~$ cat quote.txt" },
    { kind: "accent", text: aboutPullQuote.content },
    { kind: "muted", text: `// ${aboutPullQuote.attribution}` },
    { kind: "prompt", text: "visitor@curve:~$ ls stack/" },
    ...aboutColophonEntries.map((entry) => ({
      kind: "output" as const,
      text: `${entry.label}: ${entry.value}`,
    })),
    { kind: "prompt", text: "visitor@curve:~$ print contact --all" },
    { kind: "output", text: aboutContactCopy.body },
    { kind: "output", text: `GitHub: ${site.githubUrl}` },
    { kind: "output", text: `Email: ${site.email}` },
    { kind: "system", text: "[hint] Press ESC to return to paper mode. Open /about for the full page." },
  ];
}
