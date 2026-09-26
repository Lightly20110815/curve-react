# Curve React

> 用 React 18 + Vite + TypeScript 重新设计的 Curve 博客主题与内容呈现系统。

本项目的设计灵感与视觉语言源自 [imsyy/vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)。在此特别致敬与感谢原作者 [imsyy](https://github.com/imsyy) 的开源设计！

在保留原主题优雅、轻盈、富有流动感视觉风格的基础上，本项目使用现代 React 生态进行彻底重构，引入了组件化状态管理、深度强化的本地 Markdown 预编译链路、安全加固的 DeepSeek AI 伴读与摘要体系，以及沉浸式视听播放体验。

---

## 🌟 主要功能

- 📝 **现代化内容系统**
  - 本地 Markdown 文章与随想（支持 GFM 扩展语法、脚注、数学公式）。
  - 基于 Shiki 与 Rehype 的代码高亮与自动目录（TOC）锚点生成。
  - 分类、标签云与按时间轴呈现的完整归档。
- 🤖 **DeepSeek AI 增强（严格白名单代理）**
  - **AI 文章摘要**：进入文章页自动生成精炼要点，支持构建时缓存与 CDN 边缘缓存。
  - **AI 智能伴读助手**：读者可直接针对当前文章正文发起多轮问答对话，或划词解析段落。
  - **每日诗词与标语**：首页动态生成文化问候与诗词鉴赏。
  - **安全代理防御**：服务端 Edge Function 采用严格的任务白名单路由、固定 `deepseek-chat` 模型、入参限长与精确 CORS 保护，杜绝接口滥用。
- 🎵 **全局底栏音乐播放器**
  - 音乐列表与 LRC 歌词实时同步滚动。
  - 自动扫描音频元数据生成播放清单。
  - 沉浸式暗房（Darkroom）视听播放器与文字 PV 动效。
- 🎨 **视觉与细节微交互**
  - 明暗双主题无缝切换，搭配毛玻璃与优雅阴影。
  - 禅模式（Zen Mode）：一键隐藏所有侧边栏与干扰元素，专注纯粹阅读。
  - 顶部滚动进度指示条、右键自定义功能菜单、终端彩蛋（Terminal Easter Egg）。
- 💬 **评论系统**
  - 开箱即用集成 Twikoo 评论组件，支持灵活配置与国际化。

---

## 🛠️ 本地开发

### 环境要求
- Node.js >= 18
- 包管理器：**pnpm**（推荐 pnpm 9+ / 10+）

### 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 复制并配置环境变量
cp .env.example .env.local

# 3. 启动开发服务器
pnpm dev
```

### 常用 Scripts 说明

| 命令 | 对应脚本 | 说明 |
|---|---|---|
| `pnpm run content` | `scripts/build-content.ts` | 预编译 `content/posts/` 与 `content/notes/` 下的 Markdown 文档，解析 frontmatter 与提取目录，生成 `src/content/generated/posts.json`。 |
| `pnpm run manifest` | `scripts/generate-music-manifest.ts` | 扫描本地音频资源，读取 ID3 标签、封面及音频时长，输出音乐清单配置。 |
| `pnpm dev` | `pnpm content && pnpm manifest && vite` | 自动执行内容与音乐预处理，并拉起 Vite 开发服务器（默认支持热重载与本地代理）。 |
| `pnpm build` | `pnpm content && pnpm manifest && vite build` | 执行全量静态分析与编译，输出经过打包优化的 `dist/` 生产资源。 |
| `pnpm check` | `pnpm typecheck && pnpm build` | 综合校验：执行 TypeScript 严格类型检查 (`tsc --noEmit`) 并执行打包。 |
| `pnpm test:deepseek` | `scripts/test-deepseek.ts` | 运行 DeepSeek 代理接口自动化测试套件（验证任务白名单、限长校验及防篡改规则）。 |
| `pnpm preview` | `vite preview` | 本地预览生产构建产物。 |

---

## 🔑 环境变量配置

请参考根目录下的 `.env.example` 文件创建你的本地 `.env.local` 或在部署平台中设置环境变量：

```ini
# 服务端 DeepSeek 密钥（必填，仅在服务端 Edge Function / Vercel 环境变量中配置，切勿提交到前端仓库）
DEEPSEEK_API_KEY=sk-your-deepseek-key

# 客户端代理接口路由覆盖（可选）
# 开发环境下默认指向 http://localhost:3000/api/deepseek，生产环境默认指向 /api/deepseek
VITE_DEEPSEEK_API_URL=

# Twikoo 评论配置（可选）
VITE_TWIKOO_JS=               # 自定义 Twikoo JS CDN 脚本地址
VITE_TWIKOO_ENV_ID=           # 你的 Twikoo 环境 ID（填写后开启评论功能）
VITE_TWIKOO_LANG=zh-CN        # 评论区语言，默认为 zh-CN
VITE_TWIKOO_REGION=           # 私有化或云环境区域标识
```

---

## 🚀 部署指南

### Vercel 一键部署（推荐）

本项目天然适配 Vercel 托管与 Vercel Edge Functions：

1. 将仓库推送至 GitHub。
2. 在 [Vercel](https://vercel.com/) 控制台导入此仓库。
3. 平台构建设置：
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
4. 在 **Settings -> Environment Variables** 中添加生产环境变量：
   - `DEEPSEEK_API_KEY`: 填入你的 DeepSeek 开放平台 API Key。
   - `VITE_TWIKOO_ENV_ID`: 填入你的 Twikoo 评论服务环境 ID。
5. 点击 **Deploy**，部署完成后根目录下的 `api/deepseek.ts` 会自动作为 Serverless Edge API 运行，处理 AI 请求代理。

---

## 📁 目录结构

```text
curve-react/
├── api/
│   └── deepseek.ts              # Vercel Edge Function（DeepSeek 任务白名单安全代理）
├── content/
│   ├── posts/                   # Markdown 博客文章源文件
│   └── notes/                   # 短便签与随想源文件
├── public/                      # 静态资源（图标、字体、音频等）
├── scripts/
│   ├── build-content.ts         # Markdown 编译与静态索引生成脚本
│   ├── generate-music-manifest.ts # 音乐元数据自动扫描提取脚本
│   └── test-deepseek.ts         # DeepSeek 代理接口自动化测试
├── src/
│   ├── components/              # 通用与功能 UI 组件（导航、播放器、AI伴读、评论等）
│   ├── content/                 # 生成的内容数据入口及扩展文稿配置
│   ├── hooks/                   # 自定义 React Hooks
│   ├── layouts/                 # 页面主骨架布局
│   ├── lib/                     # 核心工具库（DeepSeek 客户端、文章解析、主题管理）
│   ├── pages/                   # 路由页面（首页、文章页、归档、标签、分类、关于等）
│   ├── styles/                  # 全局样式与 Tailwind 基础样式
│   ├── App.tsx                  # 根组件与路由分发
│   └── main.tsx                 # 应用挂载入口
├── .env.example                 # 环境变量模板
├── package.json                 # 项目依赖与运行脚本
├── tailwind.config.js           # Tailwind CSS 样式配置
├── tsconfig.json                # TypeScript 配置
└── vite.config.ts               # Vite 构建与本地开发中间件配置
```

---

## 📄 致谢

设计与布局致敬 [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)。

