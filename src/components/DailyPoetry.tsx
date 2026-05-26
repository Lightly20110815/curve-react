import { useEffect, useRef, useState } from "react";
import { streamDeepSeekText, type DeepSeekMessage } from "@/lib/deepseek";
import { useTheme } from "@/hooks/useTheme";
import { getTimeThemeInfo, type TimeTheme } from "@/lib/time-theme";
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

function buildMessages(
  history: QuoteData[],
  timeTheme: TimeTheme,
  retryNote?: string,
): DeepSeekMessage[] {
  const recentList = history
    .slice(0, 16)
    .map((item, index) => `${index + 1}. ${item.content}`)
    .join("\n");
  const timeThemeInfo = getTimeThemeInfo(timeTheme);

  return [
    {
      role: "system",
      content: `
你是一个中文名篇摘句编辑。
你的任务是：每次只引用一句已经真实存在于中文诗词、散文、古文、词赋或著名文章中的句子。

要求：
1. 只许引用真实原句，不要原创，不要改写，不要拼接。
2. 允许两种气质：
   - 一种是松弛、豁达、看淡得失、适合“躺平自洽”，类似「不以物喜，不以己悲」「行到水穷处，坐看云起时」。
   - 另一种是旧日寻常、家常温柔、含蓄怀想，像「被酒莫惊春睡重，赌书消得泼茶香，当时只道是寻常」「我渐渐明白，世间最可厌恶的事莫如一张生气的脸」这种有日常余味或文章感的句子。
3. 可以来自诗词，也可以来自散文、杂文、书信、序跋或著名文章，但必须是广为人知或确有出处的原句。
4. 不要励志鸡血，不要直白情话，不要悲壮决绝，不要说教。
5. 优先选择完整的一句；长度尽量在 8 到 36 个汉字之间。
6. 不要与给定的历史句子重复，也不要输出语义几乎相同的句子。
7. 严格只输出三行，不要任何解释：
第一行：句子
第二行：出处：作品名或文章名
第三行：作者：作者名
8. 当前是${timeThemeInfo.label}时段，${timeThemeInfo.poetryInstruction}
      `.trim(),
    },
    {
      role: "user",
      content: `
请给我一句新的中文名句，可以来自诗词、散文、古文或著名文章。
务必避开以下历史句子，不要重复：
${recentList || "（暂无历史）"}
${retryNote ? `\n补充要求：${retryNote}` : ""}
      `.trim(),
    },
  ];
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
      await streamDeepSeekText(
        {
          model: "deepseek-v4-flash",
          signal,
          thinking: { type: "disabled" },
          temperature: 1.05,
          max_tokens: 120,
          messages: buildMessages(history, timeTheme, retryNote),
        },
        (delta) => {
          applyDraft(draftRef.current + delta);
        },
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
    <section className="py-6 md:py-7" aria-label="每日诗词">
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
          className={`min-h-[6.75rem] transition-all duration-500 ease-out ${
            show ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
          }`}
        >
          <p className="text-pretty font-serif text-[18px] leading-[1.95] text-ink-strong md:text-[20px]">
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
