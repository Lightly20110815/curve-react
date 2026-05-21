import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.DEV
  ? "http://localhost:3000/api/deepseek"
  : "/api/deepseek";
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

interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
}

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

function buildMessages(history: QuoteData[], retryNote?: string) {
  const recentList = history
    .slice(0, 16)
    .map((item, index) => `${index + 1}. ${item.content}`)
    .join("\n");

  return [
    {
      role: "system",
      content: `
你是一个古典文本摘句编辑。
你的任务是：每次只引用一句已经真实存在于中国古诗词、古文或词赋中的名句。

要求：
1. 只许引用真实原句，不要原创，不要改写，不要拼接。
2. 允许两种气质：
   - 一种是松弛、豁达、看淡得失、适合“躺平自洽”，类似「不以物喜，不以己悲」「行到水穷处，坐看云起时」。
   - 另一种是旧日寻常、家常温柔、含蓄怀想，像「被酒莫惊春睡重，赌书消得泼茶香，当时只道是寻常」这种带有日常生活余味的句子。
3. 不要励志鸡血，不要直白情话，不要悲壮决绝，不要说教。
4. 优先选择完整的一句；长度尽量在 8 到 30 个汉字之间。
5. 不要与给定的历史句子重复，也不要输出语义几乎相同的句子。
6. 严格只输出三行，不要任何解释：
第一行：句子
第二行：出处：作品名
第三行：作者：作者名
      `.trim(),
    },
    {
      role: "user",
      content: `
请给我一句新的古诗词或古文名句。
务必避开以下历史句子，不要重复：
${recentList || "（暂无历史）"}
${retryNote ? `\n补充要求：${retryNote}` : ""}
      `.trim(),
    },
  ];
}

export function DailyPoetry() {
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

  async function generate(attempt = 0, retryNote?: string) {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    resetDisplay();
    setIsStreaming(true);

    const history = loadHistory();

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          stream: true,
          thinking: { type: "disabled" },
          temperature: 1.05,
          max_tokens: 120,
          messages: buildMessages(history, retryNote),
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`DeepSeek API 请求失败：HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trim();
          if (!data) continue;
          if (data === "[DONE]") break;

          try {
            const json = JSON.parse(data) as StreamChunk;
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (!delta) continue;

            applyDraft(draftRef.current + delta);
          } catch (error) {
            console.warn("DailyPoetry SSE 解析异常：", error);
          }
        }
      }

      const parsed = parseDraft(draftRef.current);
      const normalized = normalizeQuote(parsed.content);
      const historySet = new Set(history.map((item) => normalizeQuote(item.content)));
      const isDuplicate = !normalized || historySet.has(normalized);

      if (isDuplicate && attempt < MAX_RETRIES) {
        await generate(
          attempt + 1,
          "上一条与历史重复或格式不合规，请务必换成另一句真实存在的古诗词或古文名句，并保持三行格式。",
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
        await fallbackToOriginalApi(signal);
      } catch (fallbackError) {
        if ((fallbackError as Error).name !== "AbortError") {
          console.warn("原始诗词 API 也不可用：", fallbackError);
          resetDisplay();
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <section className="border-y-[3px] border-double border-rule py-5 md:py-6" aria-label="每日诗词">
      <div>
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
