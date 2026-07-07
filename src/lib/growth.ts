/**
 * 生长阶段 — 数字花园的老传统：文字是种下的植物。
 *
 * 按字数把一篇文字归到一个生长阶段，用于列表里的小图标与说明。
 * 随笔（notes）永远是"芽"。
 */

export type GrowthStage = "sprout" | "sapling" | "evergreen";

export interface GrowthInfo {
  stage: GrowthStage;
  /** 阶段名："幼芽" | "抽枝" | "成荫"。 */
  label: string;
}

/** 按字数判断生长阶段。 */
export function growthForWordCount(wordCount: number): GrowthInfo {
  if (wordCount < 600) return { stage: "sprout", label: "幼芽" };
  if (wordCount < 2000) return { stage: "sapling", label: "抽枝" };
  return { stage: "evergreen", label: "成荫" };
}
