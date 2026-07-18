const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const deepSeekApiUrl =
  viteEnv.VITE_DEEPSEEK_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000/api/deepseek" : "/api/deepseek");

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekRequestOptions {
  messages: DeepSeekMessage[];
  model?: string;
  stream?: boolean;
  signal?: AbortSignal;
  [key: string]: unknown;
}

interface DeepSeekCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface DeepSeekStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export async function getDeepSeekText({
  signal,
  ...payload
}: DeepSeekRequestOptions): Promise<string> {
  const response = await fetch(deepSeekApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ ...payload, stream: false }),
  });

  if (!response.ok) {
    throw new Error(await readDeepSeekError(response));
  }

  const data = (await response.json()) as DeepSeekCompletionResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("DeepSeek returned empty content");
  }

  return content;
}

export async function streamDeepSeekText(
  { signal, ...payload }: DeepSeekRequestOptions,
  onDelta: (delta: string) => void,
): Promise<void> {
  const response = await fetch(deepSeekApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
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
