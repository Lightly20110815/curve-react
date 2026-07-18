import { useEffect, type RefObject } from "react";

const LINE_THRESHOLD = 22;
const ENHANCED_FLAG = "data-code-enhanced";

/**
 * Decorate rehype-pretty-code `<figure>` blocks with:
 *  - A toolbar showing language + a one-click "复制" button
 *  - For long blocks (> LINE_THRESHOLD), an "展开 N 行" toggle that
 *    collapses the body behind a fade and reveals it on demand
 *
 * Implemented as a runtime DOM pass (post dangerouslySetInnerHTML) so the
 * build pipeline stays untouched. Uses event delegation — a single click
 * listener on the container handles every figure inside.
 */
export function useCodeBlockEnhancements(
  containerRef: RefObject<HTMLElement>,
  contentKey: string,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const figures = Array.from(
      container.querySelectorAll<HTMLElement>(
        "figure[data-rehype-pretty-code-figure]",
      ),
    );

    for (const figure of figures) {
      if (figure.getAttribute(ENHANCED_FLAG) === "true") continue;

      const pre = figure.querySelector<HTMLPreElement>("pre");
      const code = figure.querySelector<HTMLElement>("code");
      if (!pre || !code) continue;

      const language =
        code.getAttribute("data-language") ??
        pre.getAttribute("data-language") ??
        "code";

      const lineSpans = code.querySelectorAll("span[data-line]");
      const lineCount = lineSpans.length > 0
        ? lineSpans.length
        : (code.textContent ?? "").split("\n").filter(Boolean).length;
      const isLong = lineCount > LINE_THRESHOLD;

      figure.classList.add("code-block");

      // Wrap the <pre> in a body wrapper so we can constrain its height
      // for the collapse effect without disturbing <pre>'s own styling.
      const body = document.createElement("div");
      body.className = "code-block__body";
      if (isLong) body.setAttribute("data-collapsed", "true");
      figure.insertBefore(body, pre);
      body.appendChild(pre);

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "code-block__toolbar";
      toolbar.innerHTML = `
        <span class="code-block__lang">${escapeHtml(language)}</span>
        <span class="code-block__meta">${lineCount} 行</span>
        <button type="button" class="code-block__action" data-action="copy" aria-label="复制代码">
          <span data-copy-label>复制</span>
        </button>
      `.trim();
      figure.insertBefore(toolbar, body);

      // Expand button at the bottom of the body (only for long blocks)
      if (isLong) {
        const expand = document.createElement("button");
        expand.type = "button";
        expand.className = "code-block__expand";
        expand.setAttribute("data-action", "toggle");
        expand.textContent = `展开剩余 ${lineCount - LINE_THRESHOLD} 行`;
        figure.appendChild(expand);
      }

      figure.setAttribute(ENHANCED_FLAG, "true");
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const actionEl = target.closest<HTMLElement>("[data-action]");
      if (!actionEl) return;
      const figure = actionEl.closest<HTMLElement>("figure.code-block");
      if (!figure) return;
      const action = actionEl.getAttribute("data-action");

      if (action === "copy") {
        const code = figure.querySelector<HTMLElement>("code");
        if (!code) return;
        const text = code.textContent ?? "";
        copyText(text).then((ok) => {
          const label = actionEl.querySelector<HTMLElement>("[data-copy-label]");
          if (!label) return;
          const original = label.textContent ?? "复制";
          label.textContent = ok ? "已复制" : "复制失败";
          actionEl.setAttribute("data-copied", ok ? "true" : "false");
          window.setTimeout(() => {
            label.textContent = original;
            actionEl.removeAttribute("data-copied");
          }, 1600);
        });
      } else if (action === "toggle") {
        const body = figure.querySelector<HTMLElement>(".code-block__body");
        if (!body) return;
        const collapsed = body.getAttribute("data-collapsed") === "true";
        if (collapsed) {
          body.removeAttribute("data-collapsed");
          actionEl.textContent = "收起";
        } else {
          body.setAttribute("data-collapsed", "true");
          const code = figure.querySelector<HTMLElement>("code");
          const lineCount = code?.querySelectorAll("span[data-line]").length ?? 0;
          actionEl.textContent = `展开剩余 ${Math.max(lineCount - LINE_THRESHOLD, 0)} 行`;
          figure.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }

    container.addEventListener("click", handleClick);
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, [containerRef, contentKey]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
