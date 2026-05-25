/**
 * Build-time content pipeline.
 *
 * Reads content/posts/*.md, parses frontmatter with gray-matter,
 * converts markdown body to HTML via unified (remark/rehype + shiki highlighting),
 * and emits a single posts.json consumed at runtime by the React app.
 *
 * Why bundle into JSON instead of MDX:
 * - Content is plain prose; no need to embed React components.
 * - Pre-rendered HTML keeps the runtime tiny and SSG output stable.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { site, toSiteUrl } from "../src/lib/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const NOTES_DIR = path.join(ROOT, "content", "notes");
const OUT_DIR = path.join(ROOT, "src", "content", "generated");
const OUT_POSTS = path.join(OUT_DIR, "posts.json");
const OUT_NOTES = path.join(OUT_DIR, "notes.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_RSS = path.join(PUBLIC_DIR, "rss.xml");

interface RawFrontmatter {
  title?: string;
  date?: string;
  author?: string;
  description?: string;
  categories?: string[] | string;
  tags?: string[] | string;
  cover?: string;
  articleGPT?: boolean;
  draft?: boolean;
  [key: string]: unknown;
}

interface ParsedMarkdown<TFrontmatter extends RawFrontmatter> {
  slug: string;
  data: TFrontmatter;
  content: string;
  html: string;
}

const DIRECTIVE_OPEN_RE = /^:::\s*([a-zA-Z0-9_-]+)?\s*(.*)$/;

function getFenceChar(line: string): "`" | "~" | null {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("```")) return "`";
  if (trimmed.startsWith("~~~")) return "~";
  return null;
}

function getDirectiveTitle(type: string | undefined, rawTitle: string): string {
  if (rawTitle.trim()) return rawTitle.trim();

  switch (type) {
    case "danger":
      return "Caution";
    case "warning":
      return "Warning";
    case "info":
      return "Info";
    case "tip":
      return "Tip";
    case "card":
      return "Note";
    default:
      return "Note";
  }
}

function directiveToBlockquote(
  type: string | undefined,
  rawTitle: string,
  bodyLines: string[],
): string[] {
  const title = getDirectiveTitle(type, rawTitle);
  const output = [`> **${title}**`];

  if (bodyLines.length > 0) output.push(">");

  for (const line of bodyLines) {
    output.push(line.trim() ? `> ${line}` : ">");
  }

  return output;
}

function transformDirectiveBlocks(content: string): string {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let activeFence: "`" | "~" | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceChar = getFenceChar(line);

    if (fenceChar) {
      activeFence = activeFence === fenceChar ? null : activeFence ?? fenceChar;
      output.push(line);
      continue;
    }

    if (!activeFence) {
      const match = line.trim().match(DIRECTIVE_OPEN_RE);
      if (match) {
        const [, type, rawTitle] = match;
        const bodyLines: string[] = [];

        index += 1;
        while (index < lines.length && lines[index].trim() !== ":::") {
          bodyLines.push(lines[index]);
          index += 1;
        }

        output.push(...directiveToBlockquote(type, rawTitle, bodyLines));
        continue;
      }
    }

    output.push(line);
  }

  return output.join("\n");
}

function stripLeadingTitleHeading(content: string): string {
  const lines = content.split("\n");
  const output: string[] = [];
  let activeFence: "`" | "~" | null = null;
  let removedHeading = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceChar = getFenceChar(line);

    if (fenceChar) {
      activeFence = activeFence === fenceChar ? null : activeFence ?? fenceChar;
      output.push(line);
      continue;
    }

    if (!activeFence && !removedHeading && /^#\s+/.test(line.trim())) {
      removedHeading = true;

      while (index + 1 < lines.length && lines[index + 1].trim() === "") {
        index += 1;
      }

      continue;
    }

    output.push(line);
  }

  return output.join("\n").replace(/^\s+/, "");
}

function normalizeMarkdown(content: string): string {
  return stripLeadingTitleHeading(transformDirectiveBlocks(content));
}

export interface PostRecord {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  categories: string[];
  tags: string[];
  cover?: string;
  articleGPT: boolean;
  html: string;
  readingMinutes: number;
  wordCount: number;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark" },
    keepBackground: false,
  })
  .use(rehypeStringify, { allowDangerousHtml: true });

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function slugify(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function normalizeDate(date: string | undefined): string {
  return date ? new Date(date).toISOString() : new Date().toISOString();
}

function estimateReading(text: string): { wordCount: number; readingMinutes: number } {
  // Mixed CJK + ASCII estimate: count CJK chars + ASCII words.
  const cjk = (text.match(/[㐀-鿿]/g) ?? []).length;
  const ascii = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  const wordCount = cjk + ascii;
  // CJK ~ 400 chars/min, English ~ 200 wpm — use 350 as a blended rate.
  const readingMinutes = Math.max(1, Math.round(wordCount / 350));
  return { wordCount, readingMinutes };
}

async function readMarkdownFile<TFrontmatter extends RawFrontmatter>(
  dir: string,
  filename: string,
): Promise<ParsedMarkdown<TFrontmatter>> {
  const filePath = path.join(dir, filename);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const normalizedContent = normalizeMarkdown(content);
  const file = await processor.process(normalizedContent);

  return {
    slug: slugify(filename),
    data: data as unknown as TFrontmatter,
    content: normalizedContent,
    html: String(file),
  };
}

async function processPost(filename: string): Promise<PostRecord | null> {
  const { slug, data, content, html } = await readMarkdownFile<RawFrontmatter>(
    POSTS_DIR,
    filename,
  );

  if (data.draft) return null;

  const stats = estimateReading(content);

  return {
    slug,
    title: data.title?.toString() ?? slug,
    date: normalizeDate(data.date),
    author: data.author?.toString() ?? "Sy",
    description: data.description?.toString() ?? "",
    categories: toArray(data.categories),
    tags: toArray(data.tags),
    cover: typeof data.cover === "string" ? data.cover : undefined,
    articleGPT: typeof data.articleGPT === "boolean" ? data.articleGPT : true,
    html,
    wordCount: stats.wordCount,
    readingMinutes: stats.readingMinutes,
  };
}

export interface NoteRecord {
  slug: string;
  title: string;
  date: string;
  mood?: string;
  tags: string[];
  description: string;
  html: string;
  top: boolean;
}

interface NoteFrontmatter extends RawFrontmatter {
  mood?: string;
  top?: boolean;
}

async function processNote(filename: string): Promise<NoteRecord | null> {
  const { slug, data, html } = await readMarkdownFile<NoteFrontmatter>(NOTES_DIR, filename);

  return {
    slug,
    title: data.title?.toString() ?? slug,
    date: normalizeDate(data.date),
    mood: typeof data.mood === "string" ? data.mood : undefined,
    tags: toArray(data.tags),
    description: data.description?.toString() ?? "",
    html,
    top: Boolean(data.top),
  };
}

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir)).filter((f) => f.toLowerCase().endsWith(".md"));
  } catch {
    console.warn(`[content] no dir at ${dir}`);
    return [];
  }
}

async function buildRecords<TRecord>(
  files: string[],
  processFile: (filename: string) => Promise<TRecord | null>,
  label: string,
): Promise<TRecord[]> {
  const records: TRecord[] = [];

  for (const filename of files) {
    try {
      const record = await processFile(filename);
      if (record) records.push(record);
    } catch (err) {
      console.error(`[content] failed to process ${label} ${filename}:`, err);
    }
  }

  return records;
}

function sortNewestFirst<TRecord extends { date: string }>(a: TRecord, b: TRecord): number {
  return a.date < b.date ? 1 : -1;
}

function sortNotes(a: NoteRecord, b: NoteRecord): number {
  if (a.top !== b.top) return a.top ? -1 : 1;
  return sortNewestFirst(a, b);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRss(posts: PostRecord[]): string {
  const items = posts
    .map((post) => {
      const link = toSiteUrl(`/posts/${post.slug}`);
      const categories = [...post.categories, ...post.tags]
        .map((term) => `    <category>${xmlEscape(term)}</category>`)
        .join("\n");

      return [
        "  <item>",
        `    <title>${xmlEscape(post.title)}</title>`,
        `    <link>${xmlEscape(link)}</link>`,
        `    <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `    <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `    <author>${xmlEscape(site.email)} (${xmlEscape(post.author)})</author>`,
        `    <description>${xmlEscape(post.description)}</description>`,
        categories,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuildDate = posts[0]?.date ?? new Date().toISOString();

  return [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">",
    "<channel>",
    `  <title>${xmlEscape(site.name)}</title>`,
    `  <link>${xmlEscape(site.url)}</link>`,
    `  <description>${xmlEscape(site.description)}</description>`,
    "  <language>zh-CN</language>",
    `  <atom:link href="${xmlEscape(toSiteUrl(site.rssPath))}" rel="self" type="application/rss+xml" />`,
    `  <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>`,
    "  <ttl>60</ttl>",
    items,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const postFiles = await readDirSafe(POSTS_DIR);
  const noteFiles = await readDirSafe(NOTES_DIR);

  const posts = await buildRecords(postFiles, processPost, "post");
  posts.sort(sortNewestFirst);

  const notes = await buildRecords(noteFiles, processNote, "note");
  notes.sort(sortNotes);

  await fs.writeFile(OUT_POSTS, JSON.stringify(posts, null, 2), "utf8");
  await fs.writeFile(OUT_NOTES, JSON.stringify(notes, null, 2), "utf8");
  await fs.writeFile(OUT_RSS, buildRss(posts), "utf8");
  console.log(
    `[content] wrote ${posts.length} posts, ${notes.length} notes, rss -> ${path.relative(ROOT, OUT_DIR)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
