# 个人云笔记 (Nuxt 3)
> 「独立负责的前端线上项目，目标日均 PV 500+，Lighthouse 90 分。」

### 🚀 14 天计划日历

| 天  | 任务                                 | 产出物                                  | 备注                 |
| --- | ------------------------------------ | --------------------------------------- | -------------------- |
| 1   | GitHub 建 Repo + Vercel 一键部署     | 可访问的 `https://note-demo.vercel.app` | 先跑通               |
| 2-3 | 页面骨架：列表 + 详情 + 新建         | 3 个路由 + Tailwind 样式                | ui简洁、高级           |
| 4-5 | 本地存储：IndexedDB（Dexie）         | 离线增删改查                            | 比 localStorage 高级 |
| 6-7 | 富文本：TipTap 2                    | 支持粗体、列表、代码块                  | 记住配置高亮         |
| 8   | PWA：workbox 自动生成 Service Worker | 离线打开、桌面安装                      | Lighthouse 加分      |
| 9   | SEO + SSR：Next.js `getStaticProps`  | 首屏 1.2 s                              | 用 ISR 每日更新      |
| 10  | GitHub Action：每日 CI + 产物指纹    | 自动部署 + 缓存                         | 写进简历「CI/CD」    |
| 11  | 埋点：Vercel Analytics               | 访问曲线图                              | 数据说话             |
| 12  | 性能：图片压缩 + 字体分包            | Lighthouse 90+                          | 可截图放简历         |
| 13  | README：动图录屏 + 技术栈徽章        | 5 分钟读完                              | 面试官最爱           |
| 14  | 上线通知：朋友圈 + 掘金 + 牛客       | 拿真实 PV                               | 500+ 很容易          |

---

### 📦 技术栈（面试口头禅）
- **框架**：Nuxt.js 3
- **语言**：TypeScript  
- **样式**：Tailwind CSS + color-mode
- **存储**：IndexedDB（Dexie）  
- **富文本**：react-markdown-editor-lite + Prism 代码高亮  
- **部署**：Vercel + GitHub Action  
- **性能**：Lighthouse 4×90、PWA、字体分包、图片 WebP

---

### 🎯 简历片段

> **个人云笔记**  
> - 技术：Next.js 14 + TypeScript + Tailwind + IndexedDB + PWA  
> - 功能：富文本、离线存储、暗黑模式、SSR、自动部署  
> - 性能：Lighthouse 90+，首屏 1.2 s，PWA 可安装  
> - 数据：上线 2 周 PV 800+，GitHub Star 42

---

### 执行进度
📅 Day1
1.基础功能:
✅笔记的创建、编辑
✅笔记置顶、删除功能
✅自动保存功能
✅Toast 消息提示
✅删除确认对话框

2.UI界面:
✅现代简约的设计风格
✅优雅的动画效果
✅清晰的视觉层次

3.技术栈:
✅Nuxt 3
✅Vue 3 Composition API
✅TypeScript
✅Tailwind CSS
✅Dexie.js (IndexedDB)

🔗 Demo：
国外地址：[https://my-note-plum.vercel.app]
国内地址：[https://my-note-41i.pages.dev/]

📅 计划：D2 接入富文本编辑器

---

📅 Day2
1.基础功能:
✅笔记支持富文本
✅富文本编辑支持Markdown快捷方式，具体可查看帮助说明

2.UI界面:
✅响应式布局
✅深色模式支持
✅帮助说明

3.技术栈:
✅tiptap 2
✅Extension + InputRule
✅ImageResize

📅 计划：D3 实现PWA

---

📅 Day3
1.基础功能:
✅实现PWA
✅实现富文本快捷输入
✅实现编辑区顶部工具栏
✅目录快速定位

2.UI界面:
✅优化操作使用界面

3.技术栈:
✅vite-pwa/nuxt
✅tiptap 2