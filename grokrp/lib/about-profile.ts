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
  "这里记代码、文章，也记那些不太像样的情绪。",
  "没有发刊周期。想写了才发，发出去的就是当时写下的样子。",
] as const;

export const aboutPullQuote = {
  attribution: "hello-world, 第一篇",
  content: "这里是一个小小的角落，一个勉强算是“家”的地方。",
} as const;

export const aboutColophonEntries: ColophonEntry[] = [
  { label: "框架", value: "Vite + React 18" },
  { label: "样式", value: "Tailwind CSS" },
  { label: "字体", value: "刊头 Georgia，正文系统宋体，界面 Inter" },
  { label: "文章", value: "Markdown，构建时生成 JSON" },
  { label: "电台", value: "本地音频" },
  { label: "托管", value: "静态文件" },
] as const;

export const aboutContactCopy = {
  heading: "来信",
  body: "邮件、GitHub Issue、随笔评论，哪个顺手用哪个。我不一定回得快，但一定会读。",
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
