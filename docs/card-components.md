# 页面卡片组件文档

> 文档更新时间：2026-04-05

---

## 目录

1. [组件总览](#1-组件总览)
2. [通用类型定义](#2-通用类型定义)
3. [TextCard 文字卡片](#3-textcard-文字卡片)
4. [ImageBgCard 背景图卡片](#4-imagebgcard-背景图卡片)
5. [ImageSlideCard 上移动画卡片](#5-imageslidecard-上移动画卡片)
6. [ImageFillCard 填充图卡片](#6-imagefillcard-填充图卡片)
7. [BlogCard 博客卡片](#7-blogcard-博客卡片)
8. [ProjectCard 项目卡片](#8-projectcard-项目卡片)
9. [HobbyCard 爱好入口组件](#9-hobbycard-爱好入口组件)
10. [使用示例](#10-使用示例)

---

## 1. 组件总览

| 组件 | 文件路径 | 用途 | 图片支持 |
|------|----------|------|----------|
| **TextCard** | `src/components/Cards/TextCard.tsx` | 纯文字展示 | 无 |
| **ImageBgCard** | `src/components/Cards/ImageBgCard.tsx` | 背景图 + 渐变遮罩 | 背景铺满 |
| **ImageSlideCard** | `src/components/Cards/ImageSlideCard.tsx` | 图片上移动画 | 绝对定位 |
| **ImageFillCard** | `src/components/Cards/ImageFillCard.tsx` | 封面图填满容器 | object-contain |
| **BlogCard** | `src/components/Cards/BlogCard.tsx` | 博客列表展示 | 无 |
| **ProjectCard** | `src/components/Cards/ProjectCard.tsx` | 项目展示 | object-contain |
| **HobbyCard** | `src/components/Cards/HobbyCard.tsx` | 爱好入口（自动分发） | 根据 layout 选择 |

---

## 2. 通用类型定义

位置：`src/types/hobby.ts`

```typescript
// 标签颜色
export type TagColor = "lime" | "indigo" | "orange" | "sky" | "purple" | "green" | "amber";

// 标签
export interface Tag {
  label: string;      // 标签文字
  color?: TagColor;   // 颜色，默认为 lime
}

// 图片布局类型
export type ImageLayout = "background" | "slide" | "fill";

// 图片配置
export interface ImageConfig {
  src: string;           // 图片地址
  alt: string;           // 图片 alt 文字
  layout: ImageLayout;   // 布局类型
}

// 链接配置
export interface LinkConfig {
  url: string;           // 链接地址
  external?: boolean;    // 是否外部链接（默认 false）
}

// 统一卡片 Props
export interface Hobby {
  type: string;         // 业务标识类型
  id: string;
  category?: string;    // 分类标签，如 "Tech"
  prefix?: string;      // 前缀，如 "Hobbies ·"
  tags?: Tag[];          // 标签数组
  title?: string;       // 主标题
  subtitle?: string;     // 副标题
  description?: string;  // 描述文字
  image?: ImageConfig;   // 图片配置
  link?: LinkConfig;     // 链接配置
  wide?: boolean;        // 是否跨两列
}
```

### 标签颜色对照表

| 颜色值 | 背景色 | 文字色 | 适用场景 |
|--------|--------|--------|----------|
| `lime` | `bg-lime-400/40` | `text-lime-900` | FILTER 标签 |
| `indigo` | `bg-indigo-400/40` | `text-indigo-900` | ESPRESSO、书籍分类 |
| `orange` | `bg-orange-400/40` | `text-orange-900` | NOW BREWING 等强调 |
| `sky` | `bg-sky-400/40` | `text-sky-900` | 植物科属标签 |
| `purple` | `bg-purple-400/40` | `text-purple-900` | 键盘类型标签 |
| `green` | `bg-green-400/40` | `text-green-900` | ACTIVE 状态 |
| `amber` | `bg-amber-400/40` | `text-amber-900` | PLANNING 状态 |

---

## 3. TextCard 文字卡片

**文件名**：`src/components/Cards/TextCard.tsx`

**布局特征**：无封面图，纯文字展示，适合书单、工具、笔记等

### 结构示意

```
┌──────────────────────────────────┐
│  Hobbies · Tech                 │  ← 顶部：前缀 + 分类
│  [标签1] [标签2]                 │  ← 可选：标签组
│                                  │
│  Large Serif Title               │  ← 主标题（大号衬线字体）
│  Subtitle text                   │  ← 副标题
│  Description text                │  ← 描述
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | `string` | ✓ | 唯一标识 |
| `category` | `string` | 否 | 分类标签 |
| `prefix` | `string` | 否 | 前缀，如 "Hobbies ·" |
| `tags` | `Tag[]` | 否 | 标签数组，默认 lime 色 |
| `title` | `string` | 否 | 主标题 |
| `subtitle` | `string` | 否 | 副标题 |
| `description` | `string` | 否 | 描述文字 |
| `wide` | `boolean` | 否 | 是否跨两列，默认 false |

### 特性

- 标签默认颜色：`lime`
- 标题：serif 字体，`text-4xl` ~ `text-6xl` 响应式
- 副标题/描述：最多显示 1 行，超出省略

---

## 4. ImageBgCard 背景图卡片

**文件名**：`src/components/Cards/ImageBgCard.tsx`

**布局特征**：封面图作为背景，底部渐变遮罩，适合植物、键盘等产品展示

### 结构示意

```
┌──────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← 封面图背景
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                  │
│ ▓▓▓▓▓▓渐变遮罩▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ [科属标签]                        │  ← 标签
│ 植物名称                          │  ← 标题
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | `string` | ✓ | 唯一标识 |
| `category` | `string` | 否 | 分类标签 |
| `prefix` | `string` | 否 | 前缀 |
| `tags` | `Tag[]` | 否 | 标签数组，默认 sky 色 |
| `title` | `string` | 否 | 主标题 |
| `subtitle` | `string` | 否 | 副标题 |
| `image` | `ImageConfig` | ✓ | 图片配置 |
| `wide` | `boolean` | 否 | 是否跨两列，默认 false |

### 特性

- 封面图：`object-cover` 填满
- hover 时图片放大 `scale-105`
- hover 时底部渐变遮罩透明度：`0%` → `20%`
- 标签默认颜色：`sky`

---

## 5. ImageSlideCard 上移动画卡片

**文件名**：`src/components/Cards/ImageSlideCard.tsx`

**布局特征**：封面图绝对定位，hover 时向上滑出，适合攀岩、胶片等时间轴展示

### 结构示意

```
┌──────────────────────────────────┐
│  Hobbies · Climbing        [↗] │  ← 固定顶部 + 外链按钮
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │        封面图               │ │  ← hover 时上移 mt-12
│ │                              │ │
│ └──────────────────────────────┘ │
│   日期 @ 地点                    │  ← 叠加在图片上
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | `string` | ✓ | 唯一标识 |
| `category` | `string` | 否 | 分类标签 |
| `prefix` | `string` | 否 | 前缀 |
| `title` | `string` | 否 | 叠加文字（白色标签） |
| `subtitle` | `string` | 否 | 叠加文字（白色标签） |
| `description` | `string` | 否 | 叠加文字（无 title/subtitle 时） |
| `image` | `ImageConfig` | ✓ | 图片配置 |
| `link` | `LinkConfig` | 否 | 链接配置（右上角按钮） |
| `wide` | `boolean` | 否 | 是否跨两列，默认 false |

### 特性

- 封面图：`object-cover`，hover 时 `mt-12` 上移
- 内容以白色半透明标签叠加在图片上
- 支持外链按钮（右上角圆形按钮）
- 无渐变遮罩

---

## 6. ImageFillCard 填充图卡片

**文件名**：`src/components/Cards/ImageFillCard.tsx`

**布局特征**：封面图 `object-contain` 填满容器，适合项目展示

### 结构示意

```
┌──────────────────────────────────┐
│  Projects · Web            [↗] │  ← 顶部：前缀 + 分类 + 外链
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │                              │ │
│ │      封面图 (contain)        │ │  ← object-contain 填满
│ │                              │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | `string` | ✓ | 唯一标识 |
| `category` | `string` | 否 | 分类标签 |
| `prefix` | `string` | 否 | 前缀，如 "Projects ·" |
| `title` | `string` | 否 | 主标题（仅无图片时显示） |
| `image` | `ImageConfig` | ✓ | 图片配置 |
| `link` | `LinkConfig` | 否 | 链接配置（整卡可点击 + 按钮） |
| `wide` | `boolean` | 否 | 是否跨两列，默认 false |

### 特性

- 封面图：`object-contain` 保持比例填满
- hover 时图片放大 `scale-105`
- 整卡可点击（整个卡片是链接）
- 右上角外链图标按钮

---

## 7. BlogCard 博客卡片

**文件名**：`src/components/Cards/BlogCard.tsx`

**布局特征**：博客列表专用，展示标题、日期、摘要、分类

### 结构示意

```
┌──────────────────────────────────┐
│  [Tech]              100 views │  ← 分类标签 + 统计
│  123 comments                    │
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │  Blog Title                  │ │  ← 可点击区域
│ │  January 1, 2026             │ │
│ │  Blog subtitle or content... │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `blog` | `BlogListItem` | ✓ | 博客数据对象 |
| `linkUrl` | `string` | 否 | 自定义链接，默认 `/blogs/{id}` |
| `wide` | `boolean` | 否 | 是否跨两列（宽高比 2:1），默认 false |

### BlogListItem 类型

```typescript
interface BlogListItem {
  id: number;
  title: string;
  subtitle: string | null;
  content: string;
  author_id: number;
  author_username: string;
  category: BlogCategory;  // "Tech" | "Emotion" | "Diary" | "Question"
  view_count: number;
  created_at: string;
  updated_at: string;
  comment_count: number;
}
```

### 分类颜色

| 分类 | 背景色 | 文字色 |
|------|--------|--------|
| Tech | `bg-blue-400/40` | `text-blue-900` |
| Emotion | `bg-pink-400/40` | `text-pink-900` |
| Diary | `bg-amber-400/40` | `text-amber-900` |
| Question | `bg-purple-400/40` | `text-purple-900` |

---

## 8. ProjectCard 项目卡片

**文件名**：`src/components/Cards/ProjectCard.tsx`

**布局特征**：项目展示专用，封面图填满 + 右上外链按钮

### 结构示意

```
┌──────────────────────────────────┐
│  Projects · Web            [↗] │  ← 顶部：前缀 + 分类 + 外链
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │      封面图 (contain)        │ │  ← object-contain 填满
│ │                              │ │
│ │                              │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Props

| Props | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `id` | `string` | ✓ | 唯一标识 |
| `title` | `string` | ✓ | 项目名称 |
| `linkUrl` | `string` | 否 | 项目链接 |
| `coverUrl` | `string` | 否 | 封面图地址 |
| `category` | `string` | 否 | 分类，如 "Web" |
| `wide` | `boolean` | 否 | 是否跨两列，默认 false |

### 特性

- 封面图：`object-contain` 保持比例填满
- hover 时图片放大 `scale-105`
- 整卡可点击
- 右上角外链图标按钮

---

## 9. HobbyCard 爱好入口组件

**文件名**：`src/components/Cards/HobbyCard.tsx`

**作用**：统一入口，根据 `image.layout` 自动选择对应卡片组件

### 分发逻辑

```typescript
if (!props.image) {
  return <TextCard {...props} />;  // 无图片 → TextCard
}

switch (props.image.layout) {
  case "background":
    return <ImageBgCard {...props} />;
  case "slide":
    return <ImageSlideCard {...props} />;
  case "fill":
    return <ImageFillCard {...props} />;
  default:
    return <TextCard {...props} />;
}
```

### 使用方式

```tsx
import HobbyCard from "@/components/Cards/HobbyCard";

// 根据 image.layout 自动选择卡片类型
<HobbyCard
  id="1"
  category="Plants"
  prefix="Hobbies ·"
  tags={[{ label: "ARACEAE", color: "sky" }]}
  title="Monstera adansonii"
  image={{
    src: "...",
    alt: "...",
    layout: "background"  // → ImageBgCard
  }}
/>
```

---

## 10. 使用示例

### 示例 1：书单展示（TextCard）

```tsx
<HobbyCard
  id="book-1"
  category="Book"
  prefix="Hobbies ·"
  tags={[
    { label: "FICTION", color: "indigo" },
    { label: "READING", color: "orange" }
  ]}
  title="The Pragmatic Programmer"
  subtitle="David Thomas & Andrew Hunt"
  description="Your journey to mastery"
/>
```

### 示例 2：植物展示（ImageBgCard）

```tsx
<HobbyCard
  id="plant-1"
  category="Plants"
  prefix="Hobbies ·"
  tags={[{ label: "ARACEAE", color: "sky" }]}
  title="Monstera adansonii"
  image={{
    src: "https://example.com/monstera.png",
    alt: "Monstera adansonii",
    layout: "background"
  }}
/>
```

### 示例 3：攀岩记录（ImageSlideCard）

```tsx
<HobbyCard
  id="climbing-1"
  category="Climbing"
  prefix="Hobbies ·"
  title="2023.02.12"
  subtitle="@ Fit Bloc"
  image={{
    src: "https://example.com/climbing.jpg",
    alt: "Climbing session",
    layout: "slide"
  }}
  link={{
    url: "https://instagram.com/...",
    external: true
  }}
/>
```

### 示例 4：项目展示（ImageFillCard）

```tsx
<HobbyCard
  id="project-1"
  category="Web"
  prefix="Projects ·"
  tags={[{ label: "NEXT.JS", color: "green" }]}
  image={{
    src: "https://example.com/project.png",
    alt: "Project screenshot",
    layout: "fill"
  }}
  link={{
    url: "https://project.com",
    external: true
  }}
  wide
/>
```

### 示例 5：宽卡片布局

```tsx
// 宽卡片（跨两列）
<HobbyCard
  id="film-1"
  category="Film"
  prefix="Hobbies ·"
  title="Kentmere Pan 400"
  image={{
    src: "https://example.com/film.jpg",
    alt: "Film photo",
    layout: "slide"
  }}
  wide  // 跨两列，aspect-ratio 变为 2:1
/>
```

---

## 附录：卡片组件文件位置

```
sc-frontend/src/
├── components/Cards/
│   ├── BlogCard.tsx        # 博客卡片
│   ├── ProjectCard.tsx     # 项目卡片
│   ├── ReadCard.tsx        # 原项目卡片（保留）
│   ├── HobbyCard.tsx       # 爱好入口
│   ├── TextCard.tsx        # 文字卡片
│   ├── ImageBgCard.tsx     # 背景图卡片
│   ├── ImageSlideCard.tsx  # 上移动画卡片
│   └── ImageFillCard.tsx   # 填充图卡片
└── types/
    ├── index.ts            # 导出所有类型
    └── hobby.ts            # Hobby 相关类型定义
```
