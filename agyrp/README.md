# AGYRP (AntiGravity Repair Package)
## 前端去 AI 味与 Anthropic 排版反模式重构包

本目录包含对抗性审查中针对《曲線時報》（The Curve Times）前端代码提出的全部修复成果。

### 目录结构

```
curve-react/agyrp/
├── index.html                   # 完整的交互式预览页面（包含修复后头版、文章页对比、审查账本）
├── README.md                    # 本文档
└── repaired-src/                # 可直接并入项目 src/ 的重构组件与页面
    ├── components/
    │   ├── DailyPoetry.tsx      # [P2] 静态卷首引文，去除流式打字与闪烁光标
    │   ├── Masthead.tsx         # [P0] 刊名锁定为 The Curve Times，去除 DeepSeek 退格更名与光标
    │   ├── Nav.tsx              # [P1] 纯净单行中文导航，去除机械全大写双语眉标
    │   └── PostCard.tsx         # [P0] 头条新闻去除 getLeadEditorNote 与 getLeadWhisper 伪金句
    └── pages/
        ├── HomePage.tsx         # [P1] 6/3/3 真实报纸排版，移除 3 联卡片与 Stats 仪表盘
        └── PostPage.tsx         # [P0] 隔离 AI 摘要，随笔与纪念文章绝对不挂载 AI 伴读
```

### 核心整改原则

1. **报刊即报刊**：报头不篡改名字、引文不当打字机、不挂 SaaS 仪表盘。
2. **文字即文字**：真实的人类情绪（Epheia 悼念文、生活随笔）严禁被模型贴上 "Quick summary for quick reading only" 标签。
3. **排版即呼吸**：打破 Anthropic 典型的「三联卡片对称」、「全大写英文眉标」、「加粗冒号列表」，回归中英文新闻排版的自然层次。

### 如何查看预览

启动项目开发服务器后，在浏览器访问：
- `http://localhost:9877/agyrp/` 或 `http://localhost:9877/agyrp/index.html`
