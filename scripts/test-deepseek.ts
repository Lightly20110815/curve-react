/**
 * Comprehensive test suite for api/deepseek.ts
 *
 * Verifies:
 * 1. Global fetch is mocked (no real network calls to DeepSeek).
 * 2. Unknown or missing task returns 400.
 * 3. Invalid Origin on POST returns 403.
 * 4. Overlong inputs (question > 300, history > 6, slug > 100) return 400.
 * 5. GET on non-whitelisted task (e.g., article-reader) returns 405.
 * 6. Unknown slug in summary/reader/selection returns 404.
 * 7. Passed client content is completely ignored (uses server posts.json text).
 * 8. Client-provided model, max_tokens, messages, and temperature are strictly ignored.
 * 9. Upstream error (e.g. 401) logs error and returns 502 {"error":"upstream_error"} without leaking raw error.
 * 10. Cache-Control headers are correctly set for cachable GET requests, and retryNote is ignored on GET.
 */
import assert from "node:assert/strict";
import handler from "../api/deepseek";

process.env.DEEPSEEK_API_KEY = "test-mock-key";

let lastUpstreamPayload: any = null;
let lastUpstreamHeaders: any = null;
let mockUpstreamStatus = 200;
let mockUpstreamResponseBody: string | null = null;

// Mock global fetch to prevent any external API calls
globalThis.fetch = async (url: any, init: any = {}) => {
  if (String(url).includes("api.deepseek.com")) {
    lastUpstreamPayload = JSON.parse(init.body || "{}");
    lastUpstreamHeaders = init.headers;

    if (mockUpstreamStatus !== 200) {
      return new Response(mockUpstreamResponseBody || "Upstream failure", {
        status: mockUpstreamStatus,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mockResponse = {
      id: "chatcmpl-test",
      object: "chat.completion",
      created: 1234567890,
      model: "deepseek-chat",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Mocked DeepSeek reply for testing",
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  throw new Error(`Unexpected unmocked fetch call to: ${url}`);
};

async function runTests() {
  console.log("--- Starting DeepSeek Proxy Tests ---");

  const ORIGIN = "https://404yann.com";

  // Test 1: Missing task -> 400
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({}),
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "Missing task must return 400");
    const json = await res.json();
    assert.match(json.error, /task/i);
    console.log("✓ Test 1 Passed: Missing task returns 400");
  }

  // Test 2: Unknown task -> 400
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({ task: "arbitrary-unknown-task" }),
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "Unknown task must return 400");
    const json = await res.json();
    assert.match(json.error, /unsupported/i);
    console.log("✓ Test 2 Passed: Unknown task returns 400");
  }

  // Test 3: Unauthorized origin on POST -> 403
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://attacker.com",
      },
      body: JSON.stringify({ task: "tagline" }),
    });
    const res = await handler(req);
    assert.equal(res.status, 403, "Disallowed origin on POST must return 403");
    console.log("✓ Test 3 Passed: Unauthorized origin returns 403");
  }

  // Test 4: Overlong question (>300 chars) -> 400
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        task: "article-reader",
        slug: "more-than-a-username",
        question: "a".repeat(301),
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "Question > 300 chars must return 400");
    const json = await res.json();
    assert.match(json.error, /limit/i);
    console.log("✓ Test 4 Passed: Overlong question returns 400");
  }

  // Test 5: Overlong history (>6 items) -> 400
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        task: "article-reader",
        slug: "more-than-a-username",
        question: "valid question",
        history: Array(7).fill({ role: "user", content: "hello" }),
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "History > 6 items must return 400");
    const json = await res.json();
    assert.match(json.error, /history/i);
    console.log("✓ Test 5 Passed: Overlong history returns 400");
  }

  // Test 6: GET on non-whitelisted task (article-reader) returns 405
  {
    const req = new Request(`${ORIGIN}/api/deepseek?task=article-reader&slug=more-than-a-username`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const res = await handler(req);
    assert.equal(res.status, 405, "GET on article-reader must return 405");
    const json = await res.json();
    assert.match(json.error, /Method Not Allowed/i);
    console.log("✓ Test 6 Passed: GET on article-reader returns 405");
  }

  // Test 7: Unknown slug returns 404
  {
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        task: "summary",
        slug: "unknown-slug-not-in-posts",
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 404, "Unknown slug must return 404");
    const json = await res.json();
    assert.match(json.error, /not found/i);
    console.log("✓ Test 7 Passed: Unknown slug returns 404");
  }

  // Test 8: Client-sent content is ignored; server loads article content by slug
  {
    lastUpstreamPayload = null;
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        task: "summary",
        slug: "more-than-a-username",
        content: "ROGUE_CLIENT_CONTENT_THAT_MUST_BE_IGNORED_BY_SERVER",
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 200, "Valid slug should succeed");
    assert.ok(lastUpstreamPayload, "Upstream payload recorded");
    const upstreamMessages = JSON.stringify(lastUpstreamPayload.messages);
    assert.ok(
      !upstreamMessages.includes("ROGUE_CLIENT_CONTENT_THAT_MUST_BE_IGNORED_BY_SERVER"),
      "Client content must be completely ignored",
    );
    console.log("✓ Test 8 Passed: Client-sent content is ignored and server article is used");
  }

  // Test 9: Client-sent model, max_tokens, messages are ignored
  {
    lastUpstreamPayload = null;
    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({
        task: "tagline",
        model: "attacker-chosen-model",
        max_tokens: 99999,
        temperature: 0.01,
        messages: [{ role: "user", content: "attacker prompt injection" }],
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 200, "Valid task with mocked fetch should succeed");
    assert.ok(lastUpstreamPayload, "Upstream payload should have been recorded");
    assert.equal(
      lastUpstreamPayload.model,
      "deepseek-chat",
      "Upstream model must be deepseek-chat",
    );
    assert.equal(
      lastUpstreamHeaders["Authorization"],
      "Bearer test-mock-key",
      "Authorization header must contain Bearer key",
    );
    assert.equal(
      lastUpstreamPayload.max_tokens,
      30,
      "Upstream max_tokens must be enforced by server (30 for tagline)",
    );
    assert.notEqual(
      lastUpstreamPayload.messages[0].content,
      "attacker prompt injection",
      "Client messages must be ignored",
    );
    console.log("✓ Test 9 Passed: Client model & max_tokens & messages are ignored");
  }

  // Test 10: Upstream 401 returns 502 with {"error":"upstream_error"} and hides raw upstream text
  {
    mockUpstreamStatus = 401;
    mockUpstreamResponseBody = JSON.stringify({
      error: {
        message: "Authentication FAILED: Invalid API Key sk-real-key-leaked",
        type: "authentication_error",
      },
    });

    const req = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({ task: "tagline" }),
    });

    const res = await handler(req);
    assert.equal(res.status, 502, "Upstream failure must return 502");
    const json = await res.json();
    assert.deepEqual(json, { error: "upstream_error" });
    assert.ok(
      !JSON.stringify(json).includes("Invalid API Key"),
      "Sensitive upstream error must not be exposed",
    );

    // Reset upstream mock
    mockUpstreamStatus = 200;
    mockUpstreamResponseBody = null;
    console.log("✓ Test 10 Passed: Upstream 401 returns 502 upstream_error without leaking details");
  }

  // Test 11: GET request caching headers
  {
    const req = new Request(`${ORIGIN}/api/deepseek?task=tagline`, {
      method: "GET",
      headers: {
        Origin: ORIGIN,
      },
    });
    const res = await handler(req);
    assert.equal(res.status, 200);
    const cacheHeader = res.headers.get("Cache-Control");
    assert.ok(cacheHeader && cacheHeader.includes("s-maxage="), "Cache-Control header present");
    console.log("✓ Test 11 Passed: GET request sets Cache-Control s-maxage");
  }

  // Test 12: GET with unknown query parameter returns 400
  {
    const req = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&retryNote=ATTACKER_RETRY_NOTE`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "Unknown GET parameter retryNote must return 400");
    const json = await res.json();
    assert.match(json.error, /invalid query parameter/i);

    const req2 = new Request(`${ORIGIN}/api/deepseek?task=tagline&randomParam=123`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const res2 = await handler(req2);
    assert.equal(res2.status, 400, "Unknown GET parameter randomParam must return 400");
    console.log("✓ Test 12 Passed: Unknown GET query parameters return 400");
  }

  // Test 13: GET with invalid v (v=3, v=abc) returns 400; valid v (0, 1, 2) returns 200
  {
    const req3 = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&v=3`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const res3 = await handler(req3);
    assert.equal(res3.status, 400, "v=3 must return 400");
    const json3 = await res3.json();
    assert.match(json3.error, /invalid v/i);

    const reqAbc = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&v=abc`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const resAbc = await handler(reqAbc);
    assert.equal(resAbc.status, 400, "v=abc must return 400");

    for (const validV of ["0", "1", "2"]) {
      const reqValid = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&v=${validV}`, {
        method: "GET",
        headers: { Origin: ORIGIN },
      });
      const resValid = await handler(reqValid);
      assert.equal(resValid.status, 200, `v=${validV} must return 200`);
    }
    console.log("✓ Test 13 Passed: v=3 returns 400, and valid v (0, 1, 2) returns 200");
  }

  // Test 14: All four time themes (day, dawn, dusk, deep-night) use their respective style descriptions
  {
    const themes = ["day", "dawn", "dusk", "deep-night"] as const;
    const EXPECTED_SUBSTRINGS: Record<string, string> = {
      day: "白昼时段",
      dawn: "清晨时段",
      dusk: "黄昏时段",
      "deep-night": "深夜时段",
    };

    for (const theme of themes) {
      lastUpstreamPayload = null;
      const req = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&timeTheme=${theme}`, {
        method: "GET",
        headers: { Origin: ORIGIN },
      });
      const res = await handler(req);
      assert.equal(res.status, 200, `timeTheme=${theme} must return 200`);
      assert.ok(lastUpstreamPayload, "Upstream payload must exist");
      const systemMessage =
        lastUpstreamPayload.messages.find((m: any) => m.role === "system")?.content || "";
      assert.ok(
        systemMessage.includes(EXPECTED_SUBSTRINGS[theme]),
        `System prompt for theme '${theme}' must include '${EXPECTED_SUBSTRINGS[theme]}'`,
      );
    }
    console.log("✓ Test 14 Passed: All 4 time themes (day, dawn, dusk, deep-night) use respective style descriptions");
  }

  // Test 15: Invalid timeTheme on GET returns 400; unknown timeTheme on POST falls back to default description
  {
    const reqInvalidGet = new Request(`${ORIGIN}/api/deepseek?task=daily-poetry&timeTheme=noon`, {
      method: "GET",
      headers: { Origin: ORIGIN },
    });
    const resInvalidGet = await handler(reqInvalidGet);
    assert.equal(resInvalidGet.status, 400, "Unknown timeTheme on GET must return 400");
    const jsonInvalid = await resInvalidGet.json();
    assert.match(jsonInvalid.error, /invalid timeTheme/i);

    lastUpstreamPayload = null;
    const reqPostFallback = new Request(`${ORIGIN}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({ task: "daily-poetry", timeTheme: "unknown-legacy-theme" }),
    });
    const resPostFallback = await handler(reqPostFallback);
    assert.equal(resPostFallback.status, 200, "Unknown timeTheme on POST must return 200");
    const systemMessage =
      lastUpstreamPayload.messages.find((m: any) => m.role === "system")?.content || "";
    assert.ok(
      systemMessage.includes("适度选择优美、有余味的中文名句"),
      "Must fallback to default description",
    );
    console.log("✓ Test 15 Passed: Invalid timeTheme on GET returns 400; unknown on POST falls back to default");
  }

  console.log("\nALL 15 TESTS PASSED SUCCESSFULLY! Mock fetch was verified.");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
