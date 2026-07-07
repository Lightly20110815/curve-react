/**
 * 生长标记 — 每篇文字的植物阶段小图标。
 * 幼芽 → 抽枝 → 成荫，按字数判断（见 lib/growth.ts）。
 */
import { Plant, Tree, TreeEvergreen } from "@phosphor-icons/react";
import { growthForWordCount, type GrowthInfo } from "@/lib/growth";
import { cn } from "@/lib/utils";

const STAGE_ICONS = {
  sprout: Plant,
  sapling: Tree,
  evergreen: TreeEvergreen,
} as const;

export function GrowthGlyph({
  wordCount,
  size = 18,
  className,
}: {
  wordCount: number;
  size?: number;
  className?: string;
}) {
  const info: GrowthInfo = growthForWordCount(wordCount);
  const Icon = STAGE_ICONS[info.stage];

  return (
    <span
      title={`${info.label} · 约 ${wordCount} 字`}
      className={cn("inline-flex text-firefly", className)}
    >
      <Icon size={size} weight="light" aria-hidden />
      <span className="sr-only">{info.label}</span>
    </span>
  );
}
