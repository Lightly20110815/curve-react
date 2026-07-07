# Sy 的数字花园

一座深夜的数字花园。写给某个深夜路过的你。

从 The Curve Times（报纸风格旧站）完整迁移的全新设计：夜/晨双主题、活的夜空（萤火虫 + 真实月相）、时辰问候、生长阶段、夜半电台。

## 常用命令

```bash
pnpm dev        # 生成内容 + 音乐清单 + 启动开发服务器（端口 9878）
pnpm build      # 生产构建（含内容管线与 RSS）
pnpm check      # 类型检查 + 构建
```

## 世界观对照

| 花园里的说法 | 实际是什么 |
| --- | --- |
| 最近种下 | 最新文章 |
| 幼芽 / 抽枝 / 成荫 | 按字数划分的文章生长阶段 |
| 花圃 | 分类与标签 |
| 苗圃（随笔） | 短随笔 |
| 花期 | 倒数日 + 人生进度 |
| 邻居的灯（友邻） | 友情链接 |
| 园丁 | 关于页 |
| 夜半电台 | 本地音乐播放器 |

## 在哪里改东西

- **文章 / 随笔**：`content/posts/*.md`、`content/notes/*.md`（frontmatter 与旧站兼容）
- **倒数日**：`src/lib/countdown.ts` 的 `countdownEvents`
- **生日 / 人生条**：`src/lib/progress.ts` 的 `birthDate` / `lifeExpectancyYears`
- **友链**：`src/lib/links.ts`
- **关于页文案**：`src/lib/about-profile.ts`
- **站点信息 / Twikoo**：`src/lib/site.ts`（Twikoo 环境变量：`VITE_TWIKOO_*`）
- **音乐**：往 `public/Musics/` 放 mp3，构建时自动读 ID3 生成清单
- **设计 token**：`src/styles/globals.css` 顶部（夜/晨两套变量）

## 主题机制

默认「跟随时辰」：18:00–5:59 显示夜，其余时间显示晨；右上角可手动锁定，
存在 `localStorage.garden-theme`。防闪烁初始化在 `index.html` 内联脚本里。

## 彩蛋

任何页面 URL 加 `?as-of=YYYY-MM-DD`，花园会退回那一天的样子（时光机）。
