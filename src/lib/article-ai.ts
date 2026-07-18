import type { Post } from "@/content/posts";
import type { DeepSeekMessage } from "@/lib/deepseek";

const DEFAULT_ARTICLE_SOURCE_LIMIT = 12000;
const MAX_CHAT_HISTORY = 8;
const SELECTION_CONTEXT_RADIUS = 220;

export type ArticleAiAction = "explain" | "translate";

export interface ArticleAiDocument {
  slug: string;
  title: string;
  author: string;
  date: string;
  description: string;
  categories: string[];
  tags: string[];
  plainText: string;
  source: string;
}

export interface ArticleAiTurn {
  role: "user" | "assistant";
  content: string;
}

export interface BuildSelectionMessagesOptions {
  article: ArticleAiDocument;
  action: ArticleAiAction;
  selectedText: string;
  surroundingText?: string;
}

type ArticleLike = Pick<
  Post,
  "slug" | "title" | "author" | "date" | "description" | "categories" | "tags" | "html"
>;

export function buildArticleAiDocument(
  article: ArticleLike,
  sourceLimit = DEFAULT_ARTICLE_SOURCE_LIMIT,
): ArticleAiDocument {
  const plainText = extractArticleText(article.html);

  return {
    slug: article.slug,
    title: article.title,
    author: article.author,
    date: article.date,
    description: article.description,
    categories: article.categories,
    tags: article.tags,
    plainText,
    source: truncateText(plainText, sourceLimit),
  };
}

export function buildArticleReaderMessages(
  article: ArticleAiDocument,
  turns: ArticleAiTurn[],
): DeepSeekMessage[] {
  return [
    {
      role: "system",
      content: [
        "你是这篇文章的伴读助手。",
        "你只把当前文章正文当作事实来源，帮助读者理解本文里已经写出来的内容。",
        "回答要求：",
        "1. 优先解释本文中的概念、步骤、结论和上下文关系，不要脱离文章内容自由发挥。",
        "2. 如果读者问到文章没有直接说明的部分，要明确说“本文没有直接说明”，再给出谨慎的推测边界。",
        "3. 默认使用简体中文，语气清楚、克制、耐心，不要套话，不要营销。",
        "4. 尽量直接回答问题；必要时可以引用文中的术语，但不要使用 Markdown 标题、表格或代码块。",
        "5. 如果文章里出现技术步骤，优先解释它为什么这样做、解决了什么问题、容易误解的点是什么。",
        "",
        formatArticleContext(article),
        "文章正文：",
        article.source,
      ].join("\n"),
    },
    ...turns.slice(-MAX_CHAT_HISTORY).map((turn) => ({
      role: turn.role,
      content: turn.content.trim(),
    })),
  ];
}

export function buildSelectionMessages({
  article,
  action,
  selectedText,
  surroundingText,
}: BuildSelectionMessagesOptions): DeepSeekMessage[] {
  const normalizedSelection = normalizeWhitespace(selectedText);
  const normalizedSurrounding = normalizeWhitespace(surroundingText ?? "");

  const taskInstructions =
    action === "explain"
      ? [
          "请解释这段被选中的文字在本文里的意思。",
          "先直接说明它在文中的含义，再补充必要的背景或术语解释。",
        ]
      : [
          "请把这段被选中的文字翻译成自然、准确的简体中文。",
          "如果原文本身已经是中文，请改写成更白话、更容易理解的中文说法。",
        ];

  return [
    {
      role: "system",
      content: [
        "你正在为一篇中文文章做划词伴读。",
        "你只把当前文章正文当作事实来源，不要编造本文没有写出的信息。",
        "输出要求：",
        "1. 直接给结果，不要写前言、标题或客套话。",
        "2. 保持 2 到 5 句，尽量紧凑。",
        "3. 不使用 Markdown 标题、列表、表格或代码块。",
        "4. 如果选中的内容存在歧义，就结合提供的上下文摘录解释。",
        ...taskInstructions,
        "",
        formatArticleContext(article),
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `选中文本：${normalizedSelection}`,
        normalizedSurrounding ? `上下文摘录：${normalizedSurrounding}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

export function buildSelectionExcerpt(
  article: Pick<ArticleAiDocument, "plainText">,
  selectedText: string,
): string {
  const normalizedSelection = normalizeWhitespace(selectedText);
  if (!normalizedSelection) return "";

  const candidates = [
    normalizedSelection,
    normalizedSelection.slice(0, Math.min(72, normalizedSelection.length)).trim(),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const index = article.plainText.indexOf(candidate);
    if (index < 0) continue;

    const start = Math.max(0, index - SELECTION_CONTEXT_RADIUS);
    const end = Math.min(article.plainText.length, index + candidate.length + SELECTION_CONTEXT_RADIUS);

    return `${start > 0 ? "..." : ""}${article.plainText.slice(start, end)}${end < article.plainText.length ? "..." : ""}`;
  }

  return truncateText(normalizedSelection, SELECTION_CONTEXT_RADIUS * 2);
}

export function isMeaningfulSelection(value: string): boolean {
  return normalizeWhitespace(value).length >= 2;
}

export function getSelectionActionLabel(action: ArticleAiAction): string {
  return action === "explain" ? "AI 解释" : "AI 翻译";
}

export function toArticleAiErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Missing DEEPSEEK_API_KEY")) {
    return "缺少 DEEPSEEK_API_KEY，暂时无法调用 DeepSeek。";
  }

  if (message.includes("HTTP 429")) {
    return "DeepSeek 当前较忙，请稍后再试。";
  }

  if (/HTTP 5\d{2}/u.test(message)) {
    return "DeepSeek 服务暂时不可用，请稍后再试。";
  }

  if (message.includes("Failed to fetch")) {
    return "无法连接到 DeepSeek 接口，请检查本地代理或线上 API。";
  }

  return "DeepSeek 暂时没有返回结果，请稍后重试。";
}

export function extractArticleText(html: string): string {
  if (typeof DOMParser !== "undefined") {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
    return normalizeWhitespace(text);
  }

  return normalizeWhitespace(
    html
      .replace(/<style[\s\S]*?<\/style>/giu, " ")
      .replace(/<script[\s\S]*?<\/script>/giu, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/giu, " "),
  );
}

function formatArticleContext(article: ArticleAiDocument): string {
  return [
    `文章标题：${article.title}`,
    `作者：${article.author}`,
    `简介：${article.description || "无"}`,
    `分类：${article.categories.join(" / ") || "未分类"}`,
    `标签：${article.tags.join(" / ") || "无"}`,
  ].join("\n");
}

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trimEnd()}...`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
