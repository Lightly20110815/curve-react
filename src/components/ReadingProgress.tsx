/**
 * 阅读进度 — 顶部一条萤火色细线。
 *
 * 用 CSS scroll-driven animation 实现，零 JS 滚动监听；
 * 不支持的浏览器优雅降级为不显示进度。
 */
export function ReadingProgress() {
  return (
    <div
      aria-hidden
      className="reading-progress fixed inset-x-0 top-0 z-50 h-[2px] bg-gradient-to-r from-firefly/40 to-firefly"
    />
  );
}
