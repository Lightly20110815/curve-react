export const config = { runtime: "edge" };

// 允许的来源域名（生产环境请限制为实际域名）
const ALLOWED_ORIGINS = ["https://chiyu.it", "https://www.chiyu.it"];

function getAllowOrigin(req: Request): string {
  const origin = req.headers.get("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // 开发环境允许 localhost
  if (origin.startsWith("http://localhost")) return origin;
  return ALLOWED_ORIGINS[0];
}

function json(data: unknown, status = 200, origin = ALLOWED_ORIGINS[0]) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
    },
  });
}

export default async function handler(req: Request) {
  const allowOrigin = getAllowOrigin(req);

  // 1) 处理 CORS 预检
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405, allowOrigin);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({ error: "Missing DEEPSEEK_API_KEY" }, 500, allowOrigin);
  }

  // 2) 解析请求体
  let body: Record<string, unknown> | undefined;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400, allowOrigin);
  }

  const {
    model = "deepseek-chat",
    messages = [],
    stream = true,
    thinking,
    reasoning_effort,
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
    max_tokens,
  } = body ?? {};

  // 3) 组装上游 payload
  const upstreamPayload: Record<string, unknown> = { model, messages, stream };
  if (thinking !== undefined) upstreamPayload.thinking = thinking;
  if (reasoning_effort !== undefined) upstreamPayload.reasoning_effort = reasoning_effort;
  if (temperature !== undefined) upstreamPayload.temperature = temperature;
  if (top_p !== undefined) upstreamPayload.top_p = top_p;
  if (frequency_penalty !== undefined) upstreamPayload.frequency_penalty = frequency_penalty;
  if (presence_penalty !== undefined) upstreamPayload.presence_penalty = presence_penalty;
  if (max_tokens !== undefined) upstreamPayload.max_tokens = max_tokens;

  // 4) 调用 DeepSeek
  const upstream = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(upstreamPayload),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return new Response(text || "Upstream error", {
      status: upstream.status,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Content-Type": upstream.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  }

  // 5) 根据 stream 返回
  if (stream) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": allowOrigin,
      },
    });
  }

  const text = await upstream.text();
  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": allowOrigin,
    },
  });
}
