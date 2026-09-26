import { useEffect, useRef, useState } from "react";
import { streamDeepSeekTask } from "@/lib/deepseek";
import { useTheme } from "@/hooks/useTheme";
const ORIGINAL_POETRY_API_URL = "https://v1.jinrishici.com/all.json";

const HISTORY_KEY = "daily-poetry-history-v2";
const MAX_HISTORY = 24;
const MAX_RETRIES = 3;

interface QuoteData {
  content: string;
  origin: string;
  author: string;
}

interface PoetryApiData {
  content?: string;
  origin?: string;
  author?: string;
}

const DEEP_NIGHT_FALLBACK_QUOTES: QuoteData[] = [
  { content: "明月松间照，清泉石上流", origin: "山居秋暝", author: "王维" },
  { content: "缺月挂疏桐，漏断人初静", origin: "卜算子·黄州定慧院寓居作", author: "苏轼" },
  { content: "晚来天欲雪，能饮一杯无", origin: "问刘十九", author: "白居易" },
  { content: "行到水穷处，坐看云起时", origin: "终南别业", author: "王维" },
];

function normalizeQuote(value: string): string {
  return value.replace(/[「」『』“”"'`]/g, "").replace(/\s+/g, "").trim();
}

function loadHistory(): QuoteData[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteData[];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.content === "string")
      : [];
  } catch {
    return [];
  }
}

function saveHistory(nextItem: QuoteData) {
  if (typeof localStorage === "undefined") return;
  const normalized = normalizeQuote(nextItem.content);
  const merged = [nextItem, ...loadHistory().filter((item) => normalizeQuote(item.content) !== normalized)];
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(merged.slice(0, MAX_HISTORY)));
  } catch {
    // ignore storage failures
  }
}

function createAbortError(): Error {
  return new DOMException("Aborted", "AbortError");
}

function stringifyDraft(data: QuoteData): string {
  return [data.content, `出处：${data.origin}`, `作者：${data.author}`].join("\n");
}

function parseDraft(raw: string): QuoteData {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let content = "";
  let origin = "";
  let author = "";

  for (const line of lines) {
    if (!content && !/^出处[:：]/.test(line) && !/^作者[:：]/.test(line)) {
      content = line.replace(/^[「『“"]|[」』”"]$/g, "").trim();
      continue;
    }

    if (!origin && /^出处[:：]/.test(line)) {
      origin = line.replace(/^出处[:：]\s*/, "").trim();
      continue;
    }

    if (!author && /^作者[:：]/.test(line)) {
      author = line.replace(/^作者[:：]\s*/, "").trim();
    }
  }

  if (!content && lines.length > 0) {
    content = lines[0].replace(/^[「『“"]|[」』”"]$/g, "").trim();
  }

  return { content, origin, author };
}

export function DailyPoetry() {
  const { timeTheme, timeThemeInfo } = useTheme();
  const [content, setContent] = useState("");
  const [origin, setOrigin] = useState("");
  const [author, setAuthor] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [show, setShow] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const draftRef = useRef("");

  useEffect(() => {
    void generate();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function resetDisplay() {
    setContent("");
    setOrigin("");
    setAuthor("");
    setShow(false);
    draftRef.current = "";
  }

  function applyDraft(raw: string) {
    draftRef.current = raw;
    const draft = parseDraft(raw);
    if (draft.content) {
      setContent(draft.content);
      setShow(true);
    }
    setOrigin(draft.origin);
    setAuthor(draft.author);
  }

  async function wait(ms: number, signal: AbortSignal) {
    if (signal.aborted) throw createAbortError();
    await new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      const onAbort = () => {
        window.clearTimeout(timeoutId);
        signal.removeEventListener("abort", onAbort);
        reject(createAbortError());
      };

      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  async function typewriteDraft(raw: string, signal: AbortSignal) {
    let current = "";
    for (const char of raw) {
      if (signal.aborted) throw createAbortError();
      current += char;
      applyDraft(current);
      const delay =
        char === "\n" ? 100 :
        /[，。！？；：]/.test(char) ? 72 :
        26;
      await wait(delay, signal);
    }
  }

  async function fetchOriginalPoetry(signal: AbortSignal): Promise<QuoteData> {
    const resp = await fetch(ORIGINAL_POETRY_API_URL, { signal });
    if (!resp.ok) {
      throw new Error(`原始诗词 API 请求失败：HTTP ${resp.status}`);
    }

    const data = (await resp.json()) as PoetryApiData;
    if (!data.content) {
      throw new Error("原始诗词 API 返回内容为空");
    }

    return {
      content: data.content.trim(),
      origin: (data.origin || "未注明出处").trim(),
      author: (data.author || "佚名").trim(),
    };
  }

  async function fallbackToOriginalApi(signal: AbortSignal) {
    resetDisplay();
    const fallback = await fetchOriginalPoetry(signal);
    await typewriteDraft(stringifyDraft(fallback), signal);
    saveHistory(fallback);
  }

  async function fallbackToDeepNightLibrary(signal: AbortSignal, history: QuoteData[]) {
    resetDisplay();
    const fallback = pickNightFallback(history);
    await typewriteDraft(stringifyDraft(fallback), signal);
    saveHistory(fallback);
  }

  async function generate(attempt = 0, retryNote?: string) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    resetDisplay();
    setIsStreaming(true);

    const history = loadHistory();

    try {
      await streamDeepSeekTask(
        {
          task: "daily-poetry",
          timeTheme,
          retryNote: retryNote ? retryNote.slice(0, 100) : undefined,
        },
        (delta) => {
          applyDraft(draftRef.current + delta);
        },
        { signal },
      );

      const parsed = parseDraft(draftRef.current);
      const normalized = normalizeQuote(parsed.content);
      const historySet = new Set(history.map((item) => normalizeQuote(item.content)));
      const isDuplicate = !normalized || historySet.has(normalized);

      if (isDuplicate && attempt < MAX_RETRIES) {
        await generate(
          attempt + 1,
          [
            "上一条与历史重复或格式不合规，请务必换成另一句真实存在于诗词、散文、古文或著名文章中的句子，并保持三行格式。",
            timeTheme === "deep-night"
              ? "这次请明显偏向安抚、静谧、适合夜里读的句子，不要热闹，不要惊烈。"
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        );
        return;
      }

      if (!parsed.content) {
        throw new Error("DeepSeek 返回内容为空");
      }

      setOrigin(parsed.origin || "");
      setAuthor(parsed.author || "");
      saveHistory(parsed);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      console.warn("获取 DeepSeek 摘句失败：", error);
      try {
        if (timeTheme === "deep-night") {
          await fallbackToDeepNightLibrary(signal, history);
        } else {
          await fallbackToOriginalApi(signal);
        }
      } catch (fallbackError) {
        if ((fallbackError as Error).name !== "AbortError") {
          console.warn("备用摘句源也不可用：", fallbackError);
          resetDisplay();
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <section className="py-4 md:py-5" aria-label="每日诗词">
      <div className="mx-auto max-w-2xl">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-rule-soft/25 pb-2">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            Daily Poetry
          </p>
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-stamp/85">
            {timeThemeInfo.label}版
          </p>
        </div>
        <div
          className={`min-h-[5.25rem] transition-all duration-500 ease-out ${
            show ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
          }`}
        >
          <p className="text-pretty font-serif text-[18px] leading-[1.82] text-ink-strong md:text-[20px]">
            {content}
            {isStreaming && content && (
              <span className="ml-1 inline-block h-5 w-px animate-pulse bg-[hsl(var(--stamp))] align-[-2px]" />
            )}
          </p>

          {(origin || author) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {origin ? <span className="text-stamp">—— {origin}</span> : null}
              {author ? <span>{author}</span> : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function pickNightFallback(history: QuoteData[]): QuoteData {
  const historySet = new Set(history.map((item) => normalizeQuote(item.content)));
  const available = DEEP_NIGHT_FALLBACK_QUOTES.filter(
    (item) => !historySet.has(normalizeQuote(item.content)),
  );
  const pool = available.length > 0 ? available : DEEP_NIGHT_FALLBACK_QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}
