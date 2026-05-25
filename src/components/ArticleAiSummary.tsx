import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Kicker } from "@/components/Editorial";
import { Button } from "@/components/ui/button";
import type { Post } from "@/content/posts";

const API_URL = import.meta.env.DEV
  ? "http://localhost:3000/api/deepseek"
  : "/api/deepseek";
const CACHE_VERSION = "v1";
const MAX_SOURCE_CHARS = 3200;

type SummaryState = "loading" | "ready" | "error";

interface SummaryCacheRecord {
  summary: string;
}

interface Props {
  post: Pick<Post, "slug" | "date" | "title" | "description" | "categories" | "tags" | "html">;
}

export function ArticleAiSummary({ post }: Props) {
  const [state, setState] = useState<SummaryState>("loading");
  const [summary, setSummary] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const contentSignature = useMemo(() => hashString(post.html), [post.html]);
  const cacheKey = useMemo(
    () => `article-ai-summary:${CACHE_VERSION}:${post.slug}:${post.date}:${contentSignature}`,
    [contentSignature, post.date, post.slug],
  );
  const articleSource = useMemo(() => buildArticleSource(post.html), [post.html]);

  useEffect(() => {
    const cached = readCache(cacheKey);
    if (cached) {
      setSummary(cached.summary);
      setState("ready");
      return;
    }

    void generateSummary();

    return () => {
      abortRef.current?.abort();
    };
  }, [cacheKey]);

  async function generateSummary(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = readCache(cacheKey);
      if (cached) {
        setSummary(cached.summary);
        setState("ready");
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "deepseek-chat",
          stream: false,
          temperature: 0.65,
          max_tokens: 180,
          messages: buildMessages(post, articleSource),
        }),
      });

      if (!response.ok) {
        const raw = await response.text().catch(() => "");
        throw new Error(raw || `HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
      const nextSummary = normalizeSummary(payload.choices?.[0]?.message?.content ?? "");

      if (!nextSummary) {
        throw new Error("EMPTY_SUMMARY");
      }

      if (controller.signal.aborted) return;

      setSummary(nextSummary);
      setState("ready");
      writeCache(cacheKey, { summary: nextSummary });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      setState("error");
      setErrorMessage(toErrorMessage(error));
    }
  }

  return (
    <section
      className="mt-8 border-y-[3px] border-double border-rule bg-paper-soft/55 px-4 py-5 md:px-5 lg:px-6"
      aria-labelledby="article-ai-summary-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Kicker variant="stamp">DeepSeek Brief</Kicker>
          <h2
            id="article-ai-summary-title"
            className="mt-2 font-display text-[24px] font-semibold leading-[1.25] text-ink-strong"
          >
            AI 摘要
          </h2>
          <p className="mt-2 font-serif text-[15px] italic leading-[1.8] text-ink-muted">
            一段放在正文前的导读，帮你更快进入这篇文章。
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => void generateSummary(true)}
          disabled={state === "loading"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`} />
          {state === "error" ? "再试一次" : "重写一版"}
        </Button>
      </div>

      <div className="mt-4 border-l-2 border-stamp/45 pl-4 md:pl-5">
        {state === "ready" ? (
          <p
            className="text-pretty font-serif text-[17px] leading-[1.95] text-ink-body"
            aria-live="polite"
          >
            {summary}
          </p>
        ) : null}

        {state === "loading" ? (
          <p className="font-serif text-[17px] leading-[1.95] text-ink-body" aria-live="polite">
            DeepSeek 正在替这篇文章整理一则导读
            <span className="ml-1 inline-block h-5 w-px animate-pulse bg-stamp align-[-2px]" />
          </p>
        ) : null}

        {state === "error" ? (
          <div aria-live="polite">
            <p className="font-serif text-[17px] leading-[1.95] text-ink-body">
              这一栏暂时没有等到 DeepSeek 的导读，正文内容不受影响。
            </p>
            <p className="mt-2 font-ui text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              {errorMessage}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft/35 pt-3">
        <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          AI summary generated by DeepSeek
        </p>
        <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          For quick reading only
        </p>
      </div>
    </section>
  );
}

function buildMessages(
  post: Pick<Post, "title" | "description" | "categories" | "tags">,
  articleSource: string,
) {
  return [
    {
      role: "system",
      content: [
        "你是这份中文个人刊物的编辑助理。",
        "你的任务是阅读文章，并写一段简洁、克制、可信的中文摘要，放在正文前作为导读。",
        "要求：",
        "1. 只总结文中已经明确出现的内容，不要补充作者没写过的背景、观点或结论。",
        "2. 保持作者原有气质，语气温和、克制，不要营销，不要故作夸张。",
        "3. 输出 2 到 3 句，总长度控制在 80 到 140 个汉字之间。",
        "4. 不用项目符号，不加标题，不加引号，不要出现“本文”“这篇文章主要讲了”这类套话。",
        "5. 如果文章偏技术，就点明问题、做法和结果；如果偏随笔，就点明情绪、场景和核心意象。",
        "6. 只输出摘要正文。",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `标题：${post.title}`,
        `简介：${post.description || "无"}`,
        `栏目：${post.categories.join("、") || "未分类"}`,
        `标签：${post.tags.join("、") || "无"}`,
        "",
        "正文节选：",
        articleSource,
      ].join("\n"),
    },
  ];
}

function buildArticleSource(html: string): string {
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_SOURCE_CHARS) return normalized;
  return `${normalized.slice(0, MAX_SOURCE_CHARS)}…`;
}

function normalizeSummary(value: string): string {
  return value
    .replace(/^\s*摘要[:：]?\s*/u, "")
    .replace(/^["“”]|["“”]$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readCache(key: string): SummaryCacheRecord | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SummaryCacheRecord;
    if (!parsed || typeof parsed.summary !== "string" || !parsed.summary.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key: string, payload: SummaryCacheRecord) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage failures and keep the UI functional.
  }
}

function toErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Missing DEEPSEEK_API_KEY")) {
    return "DEEPSEEK_API_KEY is missing";
  }

  if (message === "EMPTY_SUMMARY") {
    return "DeepSeek returned an empty summary";
  }

  if (/^HTTP \d+$/u.test(message)) {
    return message;
  }

  return "DeepSeek request failed";
}

function hashString(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}
