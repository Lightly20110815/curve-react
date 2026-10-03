import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquareText, RefreshCw, SendHorizonal, Square, Trash2 } from "lucide-react";
import { Kicker } from "@/components/Editorial";
import { Button } from "@/components/ui/button";
import {
  buildArticleReaderMessages,
  toArticleAiErrorMessage,
  type ArticleAiDocument,
  type ArticleAiTurn,
} from "@/lib/article-ai";
import { streamDeepSeekText } from "@/lib/deepseek";
import { cn } from "@/lib/utils";

interface ChatMessage extends ArticleAiTurn {
  id: string;
}

const QUICK_PROMPTS = [
  "这篇文章主要在解决什么问题？",
  "把文中的核心步骤按顺序讲给我听。",
  "如果我是第一次接触这个话题，最容易卡住的是哪里？",
];

export function ArticleAiReader({ article }: { article: ArticleAiDocument }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useMemo<ArticleAiTurn[]>(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput("");
    setStatus("idle");
    setErrorMessage("");
    setLastQuestion("");
  }, [article.slug]);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: status === "streaming" ? "auto" : "smooth",
    });
  }, [messages, status]);

  async function submitQuestion(question: string) {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || status === "streaming") return;

    const userId = createMessageId("user");
    const assistantId = createMessageId("assistant");
    const nextConversation: ArticleAiTurn[] = [
      ...conversation,
      { role: "user", content: normalizedQuestion },
    ];

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: normalizedQuestion },
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setStatus("streaming");
    setErrorMessage("");
    setLastQuestion(normalizedQuestion);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamDeepSeekText(
        {
          model: "deepseek-chat",
          temperature: 0.45,
          max_tokens: 720,
          signal: controller.signal,
          messages: buildArticleReaderMessages(article, nextConversation),
        },
        (delta) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content + delta,
                  }
                : message,
            ),
          );
        },
      );

      if (controller.signal.aborted) return;

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: message.content.trim(),
              }
            : message,
        ),
      );
      setStatus("idle");
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }

      setMessages((prev) =>
        prev.filter((message) => !(message.id === assistantId && !message.content.trim())),
      );
      setStatus("error");
      setErrorMessage(toArticleAiErrorMessage(error));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  function clearConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStatus("idle");
    setErrorMessage("");
    setLastQuestion("");
  }

  return (
    <section
      className="border border-rule-soft/60 bg-paper/96 shadow-[0_8px_24px_hsl(var(--ink)/0.06)] lg:sticky lg:top-20"
      aria-labelledby="article-ai-reader-title"
    >
      <div className="border-b border-rule-soft/55 bg-paper-soft/65 px-3.5 py-4">
        <Kicker variant="stamp">提问</Kicker>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h2
              id="article-ai-reader-title"
              className="font-display text-[24px] font-semibold leading-[1.15] text-ink-strong"
            >
              伴读助手
            </h2>
            <p className="mt-2 max-w-[28rem] font-serif text-[14px] leading-[1.65] text-ink-body">
              向 AI 提问关于本文的内容。它会把当前文章当作唯一上下文，优先解释术语、步骤和难点。
            </p>
          </div>
          <MessageSquareText className="mt-1 h-5 w-5 shrink-0 text-stamp" />
        </div>

        <div className="mt-3">
          <p className="font-ui text-[12px] text-ink-muted">
            只看这一篇
          </p>
          <p className="mt-1 font-serif text-[14px] leading-[1.6] text-ink-strong">
            {article.title}
          </p>
        </div>
      </div>

      <div className="px-3.5 py-3.5">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="border border-rule-soft/35 bg-paper-soft/60 px-2.5 py-1.5 text-left font-ui text-[11px] font-medium leading-[1.45] text-ink-muted transition-colors hover:border-rule hover:text-ink-strong"
              onClick={() => void submitQuestion(prompt)}
              disabled={status === "streaming"}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="mt-3 max-h-[300px] overflow-y-auto border border-rule-soft/35 bg-paper-warm/20"
        >
          <div className="space-y-3 px-3 py-3">
            {messages.length === 0 ? (
              <p className="font-serif text-[14px] leading-[1.7] text-ink-body">
                可以问步骤，也可以问一个术语是什么意思。
              </p>
            ) : null}

            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 border border-stamp/25 bg-stamp-soft/50 px-3 py-3">
            <p className="font-serif text-[14px] leading-[1.8] text-ink-body">{errorMessage}</p>
            {lastQuestion ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => void submitQuestion(lastQuestion)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重试刚才的问题
              </Button>
            ) : null}
          </div>
        ) : null}

        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitQuestion(input);
          }}
        >
          <label htmlFor="article-ai-reader-input" className="sr-only">
            向 AI 提问关于本文的内容
          </label>
          <textarea
            id="article-ai-reader-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="向 AI 提问关于本文的内容……"
            rows={3}
            className="w-full resize-y border border-rule bg-paper px-3 py-2.5 font-serif text-[14px] leading-[1.7] text-ink-strong outline-none transition-colors placeholder:text-ink-faded focus:border-stamp"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-ui text-[12px] text-ink-muted">
              回答只依据这篇文章
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {messages.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearConversation}>
                  <Trash2 className="h-3.5 w-3.5" />
                  清空对话
                </Button>
              ) : null}
              {status === "streaming" ? (
                <Button type="button" variant="secondary" size="sm" onClick={stopStreaming}>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  停止
                </Button>
              ) : null}
              <Button type="submit" size="sm" disabled={!input.trim() || status === "streaming"}>
                <SendHorizonal className="h-3.5 w-3.5" />
                发送
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <article
      className={cn(
        "border px-3 py-2.5",
        message.role === "assistant"
          ? "border-rule-soft/35 bg-paper"
          : "border-stamp/20 bg-stamp-soft/35",
      )}
    >
      <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {message.role === "assistant" ? "DeepSeek" : "你"}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap font-serif text-[14px] leading-[1.72] text-ink-body">
        {message.content}
        {message.role === "assistant" && !message.content ? (
          <span className="inline-block h-4 w-px animate-pulse bg-stamp align-[-1px]" />
        ) : null}
      </p>
    </article>
  );
}

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
