export const config = { runtime: "edge" };

const ALLOWED_ORIGINS = [
  "https://chiyu.it",
  "https://www.chiyu.it",
];

const UPSTREAM_MODEL = "deepseek-chat";
const UPSTREAM_API_URL = "https://api.deepseek.com/chat/completions";

const TIME_THEMES: Record<string, string> = {
  morning: "清晨时段，多推荐苏醒、朝气、万物初生的句子",
  noon: "正午时段，多推荐闲适、小憩、晴朗明媚的句子",
  afternoon: "午后时段，多推荐静心、品茗、从容自如的句子",
  evening: "黄昏时段，多推荐归家、落日、倦鸟归林的句子",
  night: "夜晚时段，多推荐宁静、沉淀、抚慰人心的句子",
  deepnight: "深夜时段，多推荐孤独自守、星河入梦、万籁俱寂的句子",
};

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  return false;
}

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get("Origin") || req.headers.get("origin") || "";
  return isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}, origin = ALLOWED_ORIGINS[0]) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      ...headers,
    },
  });
}

interface ArticleData {
  title: string;
  categories?: string[];
  tags?: string[];
  text: string;
}

let cachedArticles: Map<string, ArticleData> | null = null;

async function loadArticleBySlug(slug?: string): Promise<ArticleData | null> {
  if (!slug) return null;
  if (!cachedArticles) {
    try {
      const imported = await import("../src/content/generated/posts.json");
      const list = (imported.default || imported) as Array<{
        slug: string;
        title: string;
        categories?: string[];
        tags?: string[];
        html?: string;
      }>;
      cachedArticles = new Map();
      for (const p of list) {
        const plain = (p.html || "")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        cachedArticles.set(p.slug, {
          title: p.title || p.slug,
          categories: p.categories,
          tags: p.tags,
          text: plain,
        });
      }
    } catch {
      return null;
    }
  }
  return cachedArticles.get(slug) || null;
}

interface TaskResolution {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature: number;
  max_tokens: number;
  cacheControl?: string;
}

async function resolveTask(
  task: string,
  params: Record<string, unknown>,
): Promise<{ error?: string; status?: number; resolution?: TaskResolution }> {
  switch (task) {
    case "tagline": {
      return {
        resolution: {
          messages: [
            {
              role: "system",
              content:
                "你是一个文艺网站的副标题生成器。请写一句简短、优美、有文艺气息的句子，适合作为博客的副标题。字数控制在15字以内。不需要标点符号结尾。不要包含任何解释。",
            },
            {
              role: "user",
              content: "请生成一句新的副标题。",
            },
          ],
          temperature: 0.8,
          max_tokens: 30,
          cacheControl: "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      };
    }

    case "masthead-title": {
      return {
        resolution: {
          messages: [
            {
              role: "system",
              content:
                "You are generating a masthead title for a literary/coding blog. Generate a short, poetic English phrase (exactly 3 to 5 words). Do not use Chinese. Do not use punctuation at the end. Do not explain.",
            },
            {
              role: "user",
              content: "Generate a short poetic phrase.",
            },
          ],
          temperature: 0.9,
          max_tokens: 20,
          cacheControl: "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      };
    }

    case "daily-poetry": {
      const timeThemeRaw = typeof params.timeTheme === "string" ? params.timeTheme.trim() : "";
      if (timeThemeRaw.length > 30) {
        return { error: "timeTheme exceeds length limit (max 30 chars)", status: 400 };
      }
      const retryNoteRaw =
        typeof params.retryNote === "string" ? params.retryNote.trim().slice(0, 100) : "";
      const themeDesc = TIME_THEMES[timeThemeRaw] || "适度选择优美、有余味的中文名句";

      return {
        resolution: {
          messages: [
            {
              role: "system",
              content: [
                "你是一个中文名篇摘句编辑。",
                "你的任务是：每次只引用一句已经真实存在于中文诗词、散文、古文、词赋或著名文章中的句子。",
                "要求：",
                "1. 只许引用真实原句，不要原创，不要改写，不要拼接。",
                "2. 允许两种气质：一种是松弛、豁达、看淡得失；另一种是旧日寻常、家常温柔、含蓄怀想。",
                "3. 必须是广为人知或确有出处的原句，长度尽量在 8 到 36 个汉字之间。",
                "4. 严格只输出三行，不要任何解释：",
                "第一行：句子",
                "第二行：出处：作品名或文章名",
                "第三行：作者：作者名",
                `5. ${themeDesc}`,
              ].join("\n"),
            },
            {
              role: "user",
              content: retryNoteRaw
                ? `请给我一句新的中文名句，出处明确，不要说教。\n补充要求：${retryNoteRaw}`
                : "请给我一句新的中文名句，出处明确，不要说教。",
            },
          ],
          temperature: 1.05,
          max_tokens: 120,
          cacheControl: "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      };
    }

    case "summary": {
      const slug = typeof params.slug === "string" ? params.slug.trim() : "";
      const rawContent = typeof params.content === "string" ? params.content.trim() : "";

      if (slug.length > 100) {
        return { error: "slug exceeds limit (max 100 chars)", status: 400 };
      }
      if (rawContent.length > 8000) {
        return { error: "content exceeds limit (max 8000 chars)", status: 400 };
      }

      const article = await loadArticleBySlug(slug);
      const articleText = article?.text || rawContent;
      const articleTitle = article?.title || slug || "文章";
      const categories = article?.categories?.join("、") || "未分类";

      if (!articleText) {
        return { error: "Article content is required for summary", status: 400 };
      }

      const sourceExcerpt = articleText.slice(0, 3200);

      return {
        resolution: {
          messages: [
            {
              role: "system",
              content: [
                "你是这份中文个人刊物的编辑助理。",
                "你的任务是阅读文章，并写一段简洁、克制、可信的中文摘要，放在正文前作为导读。",
                "要求：",
                "1. 只总结文中已经明确出现的内容，不要补充作者没写过的背景、观点或结论。",
                "2. 保持作者原有气质，语气温和、克制，不要营销，不要故作夸张。",
                "3. 输出 2 到 3 句，总长度控制在 80 到 140 个汉字之间。",
                "4. 不用项目符号，不加标题，不加引号，不要出现“本文”“这篇文章主要讲了”这类套话。",
                "5. 如果文章偏技术，就点明问题、做法和结果；如果偏随笔，就点明情绪、场景和核心意象。",
                "6. 只输出摘要正文。",
              ].join("\n"),
            },
            {
              role: "user",
              content: [
                `标题：${articleTitle}`,
                `分类：${categories}`,
                "",
                "正文节选：",
                sourceExcerpt,
              ].join("\n"),
            },
          ],
          temperature: 0.65,
          max_tokens: 180,
          cacheControl: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      };
    }

    case "article-reader": {
      const slug = typeof params.slug === "string" ? params.slug.trim() : "";
      const question = typeof params.question === "string" ? params.question.trim() : "";
      const rawContent = typeof params.content === "string" ? params.content.trim() : "";
      const rawHistory = Array.isArray(params.history) ? params.history : [];

      if (!question) {
        return { error: "question is required", status: 400 };
      }
      if (question.length > 300) {
        return { error: "question exceeds limit (max 300 chars)", status: 400 };
      }
      if (slug.length > 100) {
        return { error: "slug exceeds limit (max 100 chars)", status: 400 };
      }
      if (rawContent.length > 8000) {
        return { error: "content exceeds limit (max 8000 chars)", status: 400 };
      }
      if (rawHistory.length > 6) {
        return { error: "conversation history exceeds limit (max 6 turns)", status: 400 };
      }

      const validHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
      for (const item of rawHistory) {
        if (!item || typeof item !== "object") continue;
        const role = (item as { role?: unknown }).role;
        const c = (item as { content?: unknown }).content;
        if (role !== "user" && role !== "assistant") continue;
        if (typeof c !== "string") continue;
        if (c.length > 300) {
          return { error: "history message exceeds limit (max 300 chars)", status: 400 };
        }
        validHistory.push({ role, content: c.trim() });
      }

      const article = await loadArticleBySlug(slug);
      const articleText = article?.text || rawContent;
      const articleTitle = article?.title || slug || "文章";

      const systemPrompt = [
        "你是这篇文章的伴读助手。",
        "你只把当前文章正文当作事实来源，帮助读者理解本文里已经写出来的内容。",
        "回答要求：",
        "1. 优先解释本文中的概念、步骤、结论和上下文关系，不要脱离文章内容自由发挥。",
        "2. 如果读者问到文章没有直接说明的部分，要明确说“本文没有直接说明”，再给出谨慎的推测边界。",
        "3. 默认使用简体中文，语气清楚、克制、耐心，不要套话，不要营销。",
        "4. 尽量直接回答问题；必要时可以引用文中的术语，但不要使用 Markdown 标题、表格或代码块。",
        "5. 如果文章里出现技术步骤，优先解释它为什么这样做、解决了什么问题、容易误解的点是什么。",
        "",
        `文章标题：${articleTitle}`,
        "文章正文：",
        articleText ? articleText.slice(0, 8000) : "（正文未提供）",
      ].join("\n");

      return {
        resolution: {
          messages: [
            { role: "system", content: systemPrompt },
            ...validHistory,
            { role: "user", content: question },
          ],
          temperature: 0.45,
          max_tokens: 600,
        },
      };
    }

    case "article-selection": {
      const action = typeof params.action === "string" ? params.action.trim() : "";
      if (action !== "explain" && action !== "translate") {
        return { error: "action must be 'explain' or 'translate'", status: 400 };
      }

      const selectedText = typeof params.selectedText === "string" ? params.selectedText.trim() : "";
      const surroundingText =
        typeof params.surroundingText === "string" ? params.surroundingText.trim() : "";
      const slug = typeof params.slug === "string" ? params.slug.trim() : "";
      const rawContent = typeof params.content === "string" ? params.content.trim() : "";

      if (!selectedText) {
        return { error: "selectedText is required", status: 400 };
      }
      if (selectedText.length > 500) {
        return { error: "selectedText exceeds limit (max 500 chars)", status: 400 };
      }
      if (surroundingText.length > 500) {
        return { error: "surroundingText exceeds limit (max 500 chars)", status: 400 };
      }
      if (slug.length > 100) {
        return { error: "slug exceeds limit (max 100 chars)", status: 400 };
      }
      if (rawContent.length > 8000) {
        return { error: "content exceeds limit (max 8000 chars)", status: 400 };
      }

      const article = await loadArticleBySlug(slug);
      const articleTitle = article?.title || slug || "文章";

      const taskInstructions =
        action === "explain"
          ? [
              "请解释这段被选中的文字在本文里的意思。",
              "先直接说明它在文中的含义，再补充必要的背景或术语解释。",
            ]
          : [
              "请把这段被选中的文字翻译成自然、准确的简体中文。",
              "如果原文本身已经是中文，请改写成更白话、更容易理解的中文说法。",
            ];

      const systemPrompt = [
        "你正在为一篇中文文章做划词伴读。",
        "你只把当前文章正文当作事实来源，不要编造本文没有写出的信息。",
        "输出要求：",
        "1. 直接给结果，不要写前言、标题或客套话。",
        "2. 保持 2 到 5 句，尽量紧凑。",
        "3. 不使用 Markdown 标题、列表、表格或代码块。",
        "4. 如果选中的内容存在歧义，就结合提供的上下文摘录解释。",
        ...taskInstructions,
        "",
        `文章标题：${articleTitle}`,
      ].join("\n");

      const userContent = [
        `选中文本：${selectedText}`,
        surroundingText ? `上下文摘录：${surroundingText}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      return {
        resolution: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: action === "translate" ? 0.2 : 0.45,
          max_tokens: 300,
        },
      };
    }

    default:
      return { error: `Unsupported task: ${task}`, status: 400 };
  }
}

export default async function handler(req: Request) {
  const allowOrigin = getCorsOrigin(req);

  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  // 2) Reject POST from unauthorized origins
  if (req.method === "POST") {
    const origin = req.headers.get("Origin") || req.headers.get("origin") || "";
    if (!isOriginAllowed(origin)) {
      return jsonResponse({ error: "Forbidden: invalid origin" }, 403, {}, allowOrigin);
    }
  }

  let task = "";
  let params: Record<string, unknown> = {};
  let stream = false;

  if (req.method === "GET") {
    const url = new URL(req.url);
    task = url.searchParams.get("task") || "";
    params = Object.fromEntries(url.searchParams.entries());
    stream = false;
  } else if (req.method === "POST") {
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, {}, allowOrigin);
    }

    task = typeof body.task === "string" ? body.task.trim() : "";
    stream = body.stream === true;
    params = body;
  } else {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {}, allowOrigin);
  }

  if (!task) {
    return jsonResponse({ error: "Missing required parameter: task" }, 400, {}, allowOrigin);
  }

  const { error, status = 400, resolution } = await resolveTask(task, params);
  if (error || !resolution) {
    return jsonResponse({ error }, status, {}, allowOrigin);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Missing DEEPSEEK_API_KEY" }, 500, {}, allowOrigin);
  }

  const upstreamPayload = {
    model: UPSTREAM_MODEL,
    messages: resolution.messages,
    stream,
    temperature: resolution.temperature,
    max_tokens: Math.min(resolution.max_tokens, 600),
  };

  const upstream = await fetch(UPSTREAM_API_URL, {
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

  const responseHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
  };

  if (req.method === "GET" && resolution.cacheControl) {
    responseHeaders["Cache-Control"] = resolution.cacheControl;
  }

  if (stream) {
    responseHeaders["Content-Type"] = "text/event-stream; charset=utf-8";
    responseHeaders["Cache-Control"] = "no-cache, no-transform";
    responseHeaders["Connection"] = "keep-alive";

    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  }

  const text = await upstream.text();
  responseHeaders["Content-Type"] = "application/json; charset=utf-8";

  return new Response(text, {
    status: 200,
    headers: responseHeaders,
  });
}
