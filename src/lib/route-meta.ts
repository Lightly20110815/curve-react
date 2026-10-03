import { site } from "@/lib/site";
import { getPostBySlug } from "@/content/posts";

const STATIC_TITLES: Record<string, string> = {
  "/": "头版",
  "/epheia": "EPHEIA · 依菲雅",
  "/archives": "存档 · Archives",
  "/categories": "版块 · Sections",
  "/tags": "索引 · Index",
  "/notes": "随笔 · Opinion",
  "/photos": "光影 · Gallery",
  "/countdown": "倒计时 · Countdown",
  "/links": "友链 · Links",
  "/about": "编者 · Masthead",
};

/** Human page name for a pathname, used as the browser tab title. */
export function resolvePageTitle(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "") || "/";

  const staticTitle = STATIC_TITLES[clean];
  if (staticTitle) return staticTitle;

  const post = clean.match(/^\/posts\/(.+)$/);
  if (post) return getPostBySlug(decodeURIComponent(post[1]))?.title ?? "未找到";

  const category = clean.match(/^\/categories\/(.+)$/);
  if (category) return `${decodeURIComponent(category[1])} · 版块`;

  const tag = clean.match(/^\/tags\/(.+)$/);
  if (tag) return `${decodeURIComponent(tag[1])} · 索引`;

  return "未找到";
}

export function formatDocumentTitle(pathname: string): string {
  return `${resolvePageTitle(pathname)} · ${site.name}`;
}
