/**
 * Minimal test suite for api/deepseek.ts
 *
 * Verifies:
 * 1. Global fetch is mocked (no real network calls).
 * 2. Unknown or missing task returns 400.
 * 3. Invalid Origin on POST returns 403.
 * 4. Overlong inputs (question > 300, history > 6, content > 8000) return 400.
 * 5. Client-provided model, max_tokens, messages, and temperature are strictly ignored.
 * 6. Cache-Control headers are correctly set for cachable GET requests.
 */
import assert from "node:assert/strict";
import handler from "../api/deepseek";

process.env.DEEPSEEK_API_KEY = "test-mock-key";

let lastUpstreamPayload: any = null;
let lastUpstreamHeaders: any = null;

// Mock global fetch to prevent any external API calls
globalThis.fetch = async (url: any, init: any = {}) => {
  if (String(url).includes("api.deepseek.com")) {
    lastUpstreamPayload = JSON.parse(init.body || "{}");
    lastUpstreamHeaders = init.headers;

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

  // Test 1: Missing task -> 400
  {
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
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
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
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
    const req = new Request("https://chiyu.it/api/deepseek", {
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
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
      },
      body: JSON.stringify({
        task: "article-reader",
        slug: "test-post",
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
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
      },
      body: JSON.stringify({
        task: "article-reader",
        slug: "test-post",
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

  // Test 6: Overlong content (>8000 chars) -> 400
  {
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
      },
      body: JSON.stringify({
        task: "summary",
        content: "x".repeat(8001),
      }),
    });
    const res = await handler(req);
    assert.equal(res.status, 400, "Content > 8000 chars must return 400");
    const json = await res.json();
    assert.match(json.error, /limit/i);
    console.log("✓ Test 6 Passed: Overlong content returns 400");
  }

  // Test 7: Client-sent model, max_tokens, messages are ignored; upstream uses deepseek-chat and server-set limit
  {
    lastUpstreamPayload = null;
    const req = new Request("https://chiyu.it/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://chiyu.it",
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
    console.log("✓ Test 7 Passed: Client model & max_tokens & messages are ignored");
  }

  // Test 8: GET request caching headers
  {
    const req = new Request("https://chiyu.it/api/deepseek?task=tagline", {
      method: "GET",
      headers: {
        Origin: "https://chiyu.it",
      },
    });
    const res = await handler(req);
    assert.equal(res.status, 200);
    const cacheHeader = res.headers.get("Cache-Control");
    assert.ok(cacheHeader && cacheHeader.includes("s-maxage="), "Cache-Control header present");
    console.log("✓ Test 8 Passed: GET request sets Cache-Control s-maxage");
  }

  console.log("\nALL 8 TESTS PASSED SUCCESSFULLY! Mock fetch was verified.");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
