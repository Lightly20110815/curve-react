export interface ColophonEntry {
  label: string;
  value: string;
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
  { label: "工具", value: "Vite + React 18" },
  { label: "版式", value: "Tailwind CSS v4" },
  { label: "字体", value: "霞鹜文楷 Screen" },
  { label: "排字", value: "Markdown 构建期管线" },
  { label: "电台", value: "本地音频 · HTML5 audio" },
  { label: "土壤", value: "静态站点，哪里都能种" },
] as const;

export const aboutContactCopy = {
  heading: "想说点什么？随时来信。",
  body:
    "邮件、GitHub Issue、随笔评论，哪个顺手用哪个。我不一定回得快，但一定会读。",
} as const;
