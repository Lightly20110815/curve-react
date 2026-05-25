export const site = {
  name: "The Curve Times",
  url: "https://chiyu.it",
  description: "A quiet corner built with code and words.",
  author: "Sy",
  githubUrl: "https://github.com/lightly20110815/",
  email: "swanyang7@gmail.com",
  rssPath: "/rss.xml",
} as const;

export const siteEmailHref = `mailto:${site.email}`;
export const siteContactMailHref =
  `${siteEmailHref}?subject=${encodeURIComponent("A letter to The Curve Times")}`;

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
