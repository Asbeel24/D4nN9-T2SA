# D4nN9 T2SA

**AI影视文本助手** - 剧本→脚本→分镜提示词 三模式转换工具

## 功能

- **剧本生成**：片段/单词/图片描述 → 完整剧本场景
- **分镜脚本**：剧本格式 → 分镜表格 + 多模型Prompt
- **图像提示词**：脚本格式 → Nano Banana风格九段式Prompt

## 技术栈

- 纯前端单页应用 (Vanilla JS)
- MiniMax API (Anthropic格式)
- CSS Variables 主题切换

## 本地开发

```bash
npx serve .
# 或
python3 -m http.server 8080
```

## GitHub + Vercel 部署

1. 上传到 GitHub
2. Vercel Import → 自动部署
3. 无需后端，纯静态托管

## 文件结构

```
├── index.html      # 主页面
├── css/style.css   # 样式
├── js/
│   ├── prompts.js  # System prompts
│   ├── api.js      # API调用
│   └── app.js      # 主逻辑
└── README.md
```