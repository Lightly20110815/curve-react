export const site = {
  name: "Sy 的数字花园",
  nameEn: "Sy's Digital Garden",
  url: "https://404yann.com",
  description: "一座深夜的数字花园。写给某个深夜路过的你。",
  author: "Sy",
  githubUrl: "https://github.com/lightly20110815/",
  email: "swanyang7@gmail.com",
  rssPath: "/rss.xml",
} as const;

export const siteEmailHref = `mailto:${site.email}`;
export const siteContactMailHref =
  `${siteEmailHref}?subject=${encodeURIComponent("来自花园访客的一封信")}`;

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const comments = {
  enabled: true,
  twikoo: {
    js: viteEnv.VITE_TWIKOO_JS || "https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js",
    envId: viteEnv.VITE_TWIKOO_ENV_ID || "https://twikoo.ddnsy.fun/",
    lang: viteEnv.VITE_TWIKOO_LANG || "zh-CN",
    region: viteEnv.VITE_TWIKOO_REGION || "",
  },
} as const;

export function toSiteUrl(pathname = "/"): string {
  return new URL(pathname, site.url).toString();
}
