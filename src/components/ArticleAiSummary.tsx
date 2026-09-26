import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Kicker } from "@/components/Editorial";
import { Button } from "@/components/ui/button";
import type { Post } from "@/content/posts";
import { callDeepSeekTask } from "@/lib/deepseek";
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
      const nextSummary = normalizeSummary(
        await callDeepSeekTask(
          {
            task: "summary",
            slug: post.slug,
            content: articleSource,
          },
          { signal: controller.signal },
        ),
      );

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

  if (state === "error") {
    return (
      <section
        className="mt-5 border border-rule-soft/45 bg-paper-soft/45 px-4 py-2.5 md:px-5"
        aria-labelledby="article-ai-summary-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Kicker variant="stamp">DeepSeek Brief</Kicker>
              <h2
                id="article-ai-summary-title"
                className="font-display text-[18px] font-semibold leading-[1.25] text-ink-strong"
              >
                AI 摘要暂不可用
              </h2>
            </div>
            <p className="mt-1 font-serif text-[14px] leading-[1.6] text-ink-muted">
              正文内容不受影响。
              <span className="ml-2 font-ui text-[10px] uppercase tracking-[0.12em]">
                {errorMessage}
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 shrink-0 px-2.5"
            onClick={() => void generateSummary(true)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            再试一次
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-5 border border-rule-soft/45 bg-paper-soft/45 px-4 py-3.5 md:px-5"
      aria-labelledby="article-ai-summary-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Kicker variant="stamp">DeepSeek Brief</Kicker>
            <h2
              id="article-ai-summary-title"
              className="font-display text-[19px] font-semibold leading-[1.25] text-ink-strong"
            >
              AI 摘要
            </h2>
          </div>
          <p className="mt-1 font-serif text-[14px] italic leading-[1.65] text-ink-muted">
            一段放在正文前的导读，帮你更快进入这篇文章。
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 shrink-0 px-2.5"
          onClick={() => void generateSummary(true)}
          disabled={state === "loading"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`} />
          重写一版
        </Button>
      </div>

      <div className="mt-3 border-l-2 border-stamp/45 pl-3 md:pl-4">
        {state === "ready" ? (
          <p
            className="text-pretty font-serif text-[16px] leading-[1.78] text-ink-body"
            aria-live="polite"
          >
            {summary}
          </p>
        ) : null}

        {state === "loading" ? (
          <p className="font-serif text-[16px] leading-[1.78] text-ink-body" aria-live="polite">
            DeepSeek 正在替这篇文章整理一则导读
            <span className="ml-1 inline-block h-5 w-px animate-pulse bg-stamp align-[-2px]" />
          </p>
        ) : null}

      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-rule-soft/35 pt-2.5">
        <p className="font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          AI summary generated by DeepSeek
        </p>
        <p className="font-ui text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
          For quick reading only
        </p>
      </div>
    </section>
  );
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
