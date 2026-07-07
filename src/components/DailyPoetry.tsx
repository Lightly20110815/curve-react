/**
 * 每日一诗 — 今日诗词 API（v1.jinrishici.com），带本地备选。
 *
 * 相比旧站的 DeepSeek 生成版做了简化：直接引用 API 的真实名句，
 * 失败时回退到内置的深夜诗句。当天结果缓存在 sessionStorage。
 */
import { useEffect, useState } from "react";

const POETRY_API_URL = "https://v1.jinrishici.com/all.json";
const CACHE_KEY = "daily-poetry-v1";

interface QuoteData {
  content: string;
  origin: string;
  author: string;
}

const FALLBACK_QUOTES: QuoteData[] = [
  { content: "明月松间照，清泉石上流", origin: "山居秋暝", author: "王维" },
  { content: "缺月挂疏桐，漏断人初静", origin: "卜算子·黄州定慧院寓居作", author: "苏轼" },
  { content: "晚来天欲雪，能饮一杯无", origin: "问刘十九", author: "白居易" },
  { content: "行到水穷处，坐看云起时", origin: "终南别业", author: "王维" },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readCache(): QuoteData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { day: string; quote: QuoteData };
    return parsed.day === todayKey() ? parsed.quote : null;
  } catch {
    return null;
  }
}

function writeCache(quote: QuoteData) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ day: todayKey(), quote }));
  } catch {
    // 存不进就算了
  }
}

function pickFallback(): QuoteData {
  const index = new Date().getDate() % FALLBACK_QUOTES.length;
  return FALLBACK_QUOTES[index];
}

export function DailyPoetry({ className }: { className?: string }) {
  const [quote, setQuote] = useState<QuoteData | null>(readCache);

  useEffect(() => {
    if (quote) return;
    const controller = new AbortController();

    fetch(POETRY_API_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { content?: string; origin?: string; author?: string }) => {
        const next: QuoteData = {
          content: (data.content ?? "").trim() || pickFallback().content,
          origin: (data.origin ?? "").trim(),
          author: (data.author ?? "").trim(),
        };
        writeCache(next);
        setQuote(next);
      })
      .catch(() => {
        if (!controller.signal.aborted) setQuote(pickFallback());
      });

    return () => controller.abort();
  }, [quote]);

  if (!quote) {
    return (
      <div className={className} aria-hidden>
        <div className="h-5 w-56 animate-pulse rounded bg-veil" />
      </div>
    );
  }

  return (
    <figure className={className}>
      <blockquote className="text-[16px] leading-relaxed text-ink">
        「{quote.content}」
      </blockquote>
      {(quote.author || quote.origin) && (
        <figcaption className="mt-1.5 font-mono text-[11px] tracking-wider text-mist">
          {quote.author}
          {quote.origin ? `《${quote.origin}》` : ""}
        </figcaption>
      )}
    </figure>
  );
}
