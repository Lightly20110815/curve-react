export const site = {
  name: "The Curve Times",
  url: "https://chiyu.it",
  description: "A quiet corner built with code and words.",
  author: "Sy",
  githubUrl: "http://github.com/lightly20110815/",
  email: "swanyang7@gmail.com",
  rssPath: "/rss.xml",
} as const;

export const siteEmailHref = `mailto:${site.email}`;
export const siteContactMailHref =
  `${siteEmailHref}?subject=${encodeURIComponent("A letter to The Curve Times")}`;

export function toSiteUrl(pathname = "/"): string {
  return new URL(pathname, site.url).toString();
}
