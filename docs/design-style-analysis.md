# SuperCenter 前端设计风格分析

> 分析时间：2026-04-05

---

## 1. 颜色体系

### 基础色调

项目使用 Tailwind CSS 的 `neutral` 色板作为主色调，搭配暗色模式支持：

| 模式 | 背景 | 前景 |
|------|------|------|
| Light | `bg-neutral-50` | `#171717` |
| Dark | `bg-neutral-900` | `#ededed` |

### 主色调应用

- 背景：`bg-neutral-50`（浅色）、`bg-neutral-900`（深色按钮）
- 文字：`text-neutral-900`、`text-neutral-400`、`text-neutral-500`
- 边框：`border-neutral-200`、`border-neutral-300`
- 悬停：`hover:bg-neutral-100`、`hover:bg-neutral-50`

### 语义色

#### Toast 通知系统

| 类型 | 背景 | 文字 | 边框 |
|------|------|------|------|
| success | `bg-green-100` | `text-green-700` | `border-green-200` |
| error | `bg-red-100` | `text-red-700` | `border-red-200` |
| info | `bg-blue-100` | `text-blue-700` | `border-blue-200` |

#### 博客分类

| 分类 | 背景 | 文字 |
|------|------|------|
| Tech | `bg-blue-400/40` | `text-blue-900` |
| Emotion | `bg-pink-400/40` | `text-pink-900` |
| Diary | `bg-amber-400/40` | `text-amber-900` |
| Question | `bg-purple-400/40` | `text-purple-900` |

#### 项目状态

| 状态 | 背景 | 文字 |
|------|------|------|
| ACTIVE | `bg-green-400/40` | `text-green-900` |
| COMPLETED | `bg-blue-400/40` | `text-blue-900` |
| PLANNING | `bg-amber-400/40` | `text-amber-900` |

---

## 2. 字体配置

### 字体族

项目支持双字体系统：

```css
/* 主字体：像素风格 */
--font-sans: "FusionPixel", var(--font-geist-sans);

/* 等宽字体 */
--font-mono: "FusionPixel", var(--font-geist-mono);
```

**字体来源：**

- **FusionPixel**: 自定义像素字体（12px monospaced），通过 `@font-face` 从 `/public/fonts/` 加载
- **Geist/Geist Mono**: Next.js Google Font，默认衬线字体

### 字号层级

| 元素 | 字号 | 字重 | 其他 |
|------|------|------|------|
| 页面大标题 | `text-6xl` ~ `text-8xl` | `font-extralight` | md 断点响应式 |
| 卡片标题 | `text-3xl` | `font-light` | - |
| 正文 | 默认 | - | `tracking-tight` |
| 小字/标签 | `text-sm` | - | `tracking-tight` |
| 辅助文字 | `text-xs` | - | - |

---

## 3. 间距系统

### 容器宽度

采用响应式容器，最大宽度逐级递增：

| 类名 | 断点 |
|------|------|
| `max-w-screen-sm` | < 768px |
| `max-w-screen-md` | >= 768px |
| `max-w-screen-lg` | >= 1024px |
| `max-w-screen-2xl` | >= 1280px |

### 常用间距

| 用途 | 间距值 |
|------|--------|
| 页面水平内边距 | `px-8` |
| 页面底部留白 | `pb-8`（32px） |
| 卡片内边距 | `p-5`、`px-7 pb-10` |
| 元素间距 | `gap-2`、`gap-3`、`gap-4`、`gap-6` |
| 导航项间距 | `gap-2` |

### 栅格系统

```css
grid-cols-1                        /* 默认单列 */
sm:grid-cols-2                     /* >= 640px */
lg:grid-cols-3                     /* >= 1024px */
xl:grid-cols-4                     /* >= 1280px */
```

---

## 4. 圆角和阴影

### 圆角风格

| 组件 | 圆角值 |
|------|--------|
| 卡片 | `rounded-lg` |
| 按钮（次要） | `rounded-lg` |
| 按钮（主要） | `rounded` |
| 输入框 | `rounded` |
| 标签/徽章 | `rounded` + 特殊 `shadow-inset-skeuo` |
| 头像 | `rounded-full` |
| 导航栏容器 | `rounded-lg` |

### 阴影风格

| 元素 | 阴影类 |
|------|--------|
| 卡片 | `shadow-md`（默认）→ `shadow-xl`（hover） |
| 头像悬浮卡 | `shadow-lg` |
| 弹窗 | `shadow-xl` |
| Toast | `shadow-lg` + `backdrop-blur-sm` |
| 图片 | `shadow-lg` |

**特殊阴影 `shadow-inset-skeuo`**：用于标签/徽章，呈现内凹 skeuomorphic 效果。

---

## 5. 动效风格

### 自定义关键帧动画

项目定义了多个特色动画：

```css
/* 呼吸动画 - 悬浮头像 */
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.10); }
}

/* 像素旋转 - 8步完成一圈 */
@keyframes pixel-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 史莱姆跳动 */
@keyframes slime-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 腊肠狗拉长 */
@keyframes dachshund-stretch {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.4); }
}

/* 心脏跳动 */
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30%, 45%, 60% { transform: scale(1); }
}

/* Navbar 滑入 */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 过渡动画

| 类型 | 过渡类 | 时长 |
|------|--------|------|
| 颜色变化 | `transition-colors` | 默认 |
| 尺寸缩放 | `transition-transform` | 默认 |
| 导航指示器 | `transition-[width,transform]` | 150ms |
| 卡片背景 | `transition-colors` | - |

### 交互反馈

| 交互 | 效果 |
|------|------|
| 按钮悬停 | `hover:scale-105`、`hover:bg-neutral-800` |
| 卡片悬停 | `hover:bg-neutral-100`、图片 `hover:-rotate-3 hover:scale-110` |
| 头像悬停 | `hover:scale-105` |
| 链接悬停 | `hover:text-neutral-900`、`hover:underline` |

---

## 6. 组件设计

### 按钮

**主要按钮：**
```css
bg-neutral-900 text-white hover:bg-neutral-800 rounded
```

**次要按钮：**
```css
border border-neutral-300 text-neutral-600 hover:bg-neutral-50 rounded-lg
```

**危险按钮：**
```css
bg-red-600 hover:bg-red-700
```

### 卡片

**设计特点：**

- 最小化设计：白底 + 细边框
- 悬停时背景变深（`hover:bg-neutral-100`）
- 内容区域可聚焦（`focus-within:bg-neutral-100`）
- 内部使用 `isolate` 创建新的堆叠上下文

**博客卡片：**

- 顶部：分类标签 + 统计数据（阅读量/评论数）
- 底部：标题 + 日期 + 摘要
- 支持 `wide` 属性实现跨列

**项目卡片：**

- 顶部：类型标签 + 外链按钮（圆形悬停效果）
- 底部：状态徽章 + 标题 + 描述
- 可选封面图（带旋转+缩放悬停动画）

### 导航栏（Navbar）

- 胶囊容器设计：`rounded-lg border border-neutral-200`
- 背景支持三种模式：`blur`（默认）、`solid`、`transparent`
- 滑动指示器：白色背景 + `backdrop-blur`
- 活跃状态：`text-neutral-900`，非活跃：`text-neutral-400`
- 页面加载时：`animate-slide-down` 从顶部滑入

### 悬浮头像（FloatingAvatar）

- 固定位置：`bottom-6 left-6`
- 呼吸动画：`animate-breathe`
- 右键菜单：圆角下拉菜单 + 阴影
- 悬停放大：`hover:scale-105`

### Toast 通知

- 位置：`fixed left-1/2 top-8`
- 居中弹出 + 垂直堆叠
- 自动消失：3秒
- 毛玻璃背景：`backdrop-blur-sm`

### 确认弹窗（ConfirmDialog）

- 居中显示：`flex items-center justify-center`
- 半透明遮罩：`bg-black/30 backdrop-blur-sm`
- 白色对话框：`bg-white rounded-lg shadow-xl`
- 双按钮布局：取消（次要）+ 确认（主要）

### 空状态（EmptyState）

- 居中显示：`flex justify-center`
- 彩虹渐变文字：`GradientText` 组件
- ASCII 像素图形 + 动画支持

---

## 7. 设计关键词与哲学

### 核心关键词

- **极简主义 (Minimalist)**: 大量留白、最小化卡片设计、中性色调
- **现代感 (Modern)**: Geist 字体、backdrop-blur、响应式设计
- **科技感/极客风 (Tech/Geek)**: 像素字体、ASCII 艺术、8步旋转动画
- **像素复古 (Pixel Retro)**: FusionPixel 字体、像素图形预设（腊肠狗、史莱姆、心脏）
- **轻量动效 (Lightweight Animation)**: 微妙的悬停反馈、呼吸动画、滑入效果

### 设计哲学

1. **内容优先**: 大标题 + 紧凑间距 + 最小化装饰
2. **克制的色彩**: 以 neutral 为基底，语义色仅用于状态/分类标识
3. **有趣的细节**: 像素动画、彩虹渐变文字、skeuomorphic 徽章
4. **响应式适配**: 断点从 `sm` 到 `xl`，容器宽度递增
5. **暗色模式原生支持**: CSS 变量级支持

---

## 8. 风格冲突与融合

这是一个**有趣的设计融合**：

- 像素/复古游戏美学（FusionPixel、ASCII动画）
- 搭配现代极简界面（卡片、backdrop-blur）
- 结果：**可爱但不失专业的个人网站风格**

---

## 总结

SuperCenter 前端是一个**像素风 + 极简现代**的个人网站设计：

| 维度 | 特征 |
|------|------|
| 配色 | 中性灰调 + 语义色彩点缀 + 彩虹渐变装饰 |
| 字体 | FusionPixel（像素字体）+ Geist 无衬线 |
| 布局 | 响应式容器 + 卡片网格（1→4列递增） |
| 动效 | 克制但有趣（呼吸、跳动、彩虹文字） |
| 氛围 | 专业极客个人网站，游走于复古像素与现代表现之间 |
