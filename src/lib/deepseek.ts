const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const deepSeekApiUrl =
  viteEnv.VITE_DEEPSEEK_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000/api/deepseek" : "/api/deepseek");

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type DeepSeekTaskPayload =
  | { task: "tagline" }
  | { task: "masthead-title" }
  | { task: "daily-poetry"; timeTheme?: string; retryNote?: string }
  | { task: "summary"; slug: string }
  | {
      task: "article-reader";
      slug: string;
      question: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }
  | {
      task: "article-selection";
      action: "explain" | "translate";
      selectedText: string;
      surroundingText?: string;
      slug: string;
    };

interface DeepSeekCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  content?: string;
}

interface DeepSeekStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export async function callDeepSeekTask(
  payload: DeepSeekTaskPayload,
  opts: { signal?: AbortSignal } = {},
): Promise<string> {
  const isGetTask =
    payload.task === "tagline" ||
    payload.task === "masthead-title" ||
    payload.task === "daily-poetry";

  let response: Response;
  if (isGetTask) {
    const url = new URL(
      deepSeekApiUrl,
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    );
    url.searchParams.set("task", payload.task);
    if ("timeTheme" in payload && payload.timeTheme) {
      url.searchParams.set("timeTheme", payload.timeTheme);
    }
    response = await fetch(url.toString(), {
      method: "GET",
      signal: opts.signal,
    });
  } else {
    response = await fetch(deepSeekApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: opts.signal,
      body: JSON.stringify({ ...payload, stream: false }),
    });
  }

  if (!response.ok) {
    throw new Error(await readDeepSeekError(response));
  }

  const data = (await response.json()) as DeepSeekCompletionResponse;
  const content = data.content?.trim() || data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("DeepSeek returned empty content");
  }

  return content;
}

export async function streamDeepSeekTask(
  payload: DeepSeekTaskPayload,
  onDelta: (delta: string) => void,
  opts: { signal?: AbortSignal } = {},
): Promise<void> {
  const response = await fetch(deepSeekApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: opts.signal,
    body: JSON.stringify({ ...payload, stream: true }),
  });

  if (!response.ok || !response.body) {
    throw new Error(await readDeepSeekError(response));
  }

  const reader = response.body.getReader();
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
      if (!data || data === "[DONE]") continue;

      try {
        const json = JSON.parse(data) as DeepSeekStreamChunk;
        const delta = json.choices?.[0]?.delta?.content ?? "";
        if (delta) onDelta(delta);
      } catch (error) {
        console.warn("DeepSeek SSE parse failed:", error);
      }
    }
  }
}

export function trimGeneratedText(value: string): string {
  return value.trim().replace(/[。！？"'“”‘’]+$/gu, "");
}

async function readDeepSeekError(response: Response): Promise<string> {
  const fallback = `DeepSeek request failed: HTTP ${response.status}`;

  try {
    const text = (await response.text()).trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}
