import { useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

interface QuoteData {
  content: string;
  origin: string;
  author: string;
}

const CURATED_QUOTES: Record<string, QuoteData[]> = {
  morning: [
    { content: "草木有本心，何求美人折", origin: "感遇十二首·其一", author: "张九龄" },
    { content: "微雨从东来，好风与之俱", origin: "读山海经·其一", author: "陶渊明" },
    { content: "行到水穷处，坐看云起时", origin: "终南别业", author: "王维" },
  ],
  day: [
    { content: "被酒莫惊春睡重，赌书消得泼茶香，当时只道是寻常", origin: "浣溪沙", author: "纳兰性德" },
    { content: "山气日夕佳，飞鸟相与还", origin: "饮酒·其五", author: "陶渊明" },
    { content: "莫听穿林打叶声，何妨吟啸且徐行", origin: "定风波", author: "苏轼" },
  ],
  dusk: [
    { content: "渡头余落日，墟里上孤烟", origin: "辋川闲居赠裴秀才迪", author: "王维" },
    { content: "晚来天欲雪，能饮一杯无", origin: "问刘十九", author: "白居易" },
    { content: "流水夕阳千古恨，春风落日万人思", origin: "金陵五题", author: "刘禹锡" },
  ],
  "deep-night": [
    { content: "缺月挂疏桐，漏断人初静", origin: "卜算子·黄州定慧院寓居作", author: "苏轼" },
    { content: "明月松间照，清泉石上流", origin: "山居秋暝", author: "王维" },
    { content: "长恨此身非我有，何时忘却营营", origin: "临江仙·夜归临皋", author: "苏轼" },
  ],
};

/**
 * 修复版 DailyPoetry (已去除流式打字与闪烁光标)
 *
 * 核心整改：
 * 1. 安静地排在纸面，如同报纸卷首题记；
 * 2. 彻底移除逐字打字机延迟与跳动光标；
 * 3. 移除多余的「清晨版/深夜版」技术标签；
 * 4. 零延迟、零网络错误抖动。
 */
export function DailyPoetry() {
  const { timeTheme } = useTheme();

  const quote = useMemo(() => {
    const list = CURATED_QUOTES[timeTheme] || CURATED_QUOTES.day;
    // 每日固定一句（按日期哈希），避免每次刷新剧烈跳变
    const daySeed = Math.floor(Date.now() / 86400000);
    return list[daySeed % list.length];
  }, [timeTheme]);

  return (
    <section className="border-b border-rule-soft/35 py-6 text-center" aria-label="卷首题记">
      <div className="mx-auto max-w-2xl px-4">
        <blockquote className="font-serif text-[clamp(17px,2vw,21px)] leading-[1.85] text-ink-strong">
          “{quote.content}”
        </blockquote>
        <cite className="mt-2.5 block font-serif text-[13px] not-italic text-ink-muted">
          <span className="text-stamp font-medium">{quote.author}</span>
          <span className="mx-1.5 text-rule-soft/80">·</span>
          <span>《{quote.origin}》</span>
        </cite>
      </div>
    </section>
  );
}
