import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.DEV
  ? "http://localhost:3000/api/deepseek"
  : "/api/deepseek";

/**
 * AI random greeting widget.
 *
 * Streams a soft greeting from DeepSeek on mount and on click.
 * Falls back to hiding itself if the API is unreachable.
 */
export function RandomQuote() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hidden, setHidden] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    generate();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function generate() {
    if (isStreaming) return;
    setText("");
    setHidden(false);
    setIsStreaming(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: "deepseek-chat",
          temperature: 1.1,
          stream: true,
          messages: [
            {
              role: "system",
              content: `
你是一位温柔、可爱、带一点梦幻气息的存在。
你要为访问者写一句轻声的问候，像风轻轻碰到人。
语气要柔和、自然，不要理性分析，不要哲思，不要说大道理。
不要显得正式或礼貌，只要像在和喜欢的人悄悄说话。
每句话都要独立成句，不要连续两句。
可以带一点点可爱、撒娇、或者微妙的依恋感。
用中文输出。

示例风格（仅供参考，不可照抄）：
- 「嘿，你来了呀，我刚好也在想你～」
- 「要不要在这儿坐一会儿，风好温柔呢。」
- 「我小心地踩着光，跑去迎你。」
- 「我在等一个信号，好像是你的心跳。」
            `.trim(),
            },
            {
              role: "user",
              content: "请写一句新的打招呼句子，谢谢你，抱抱qwq~",
            },
          ],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errMsg = `DeepSeek API 请求失败：HTTP ${resp.status}`;
        console.error(errMsg);
        setHidden(true);
        throw new Error(errMsg);
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
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          if (data === "[DONE]") {
            setIsStreaming(false);
            return;
          }
          try {
            const json = JSON.parse(data) as {
              choices?: [{ delta?: { content?: string } }];
            };
            const delta = json?.choices?.[0]?.delta?.content ?? "";
            if (delta) setText((prev) => prev + delta);
          } catch (e) {
            console.warn("DeepSeek SSE 解析异常：", e);
          }
        }
      }
    } catch (err) {
      console.error("DeepSeek 加载失败：", err);
      setHidden(true);
    } finally {
      setIsStreaming(false);
    }
  }

  if (hidden) return null;

  return (
    <div
      className="flex cursor-pointer items-start gap-3 rounded-md border border-[hsl(var(--rule-soft)/0.48)] bg-[hsl(var(--paper-soft))] px-4 py-3.5 shadow-sm select-none transition-shadow hover:shadow-md"
      onClick={() => generate()}
      role="button"
      aria-label="点击生成新的问候语"
    >
      <span className="text-lg opacity-85" aria-hidden="true">
        💬
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 whitespace-pre-line text-[0.95rem] leading-relaxed text-[hsl(var(--ink-body))]">
          {text}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[hsl(var(--stamp))] align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}
