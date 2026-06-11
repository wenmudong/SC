# SuperCenter 前端开发规范

> 本规范基于 `sc-frontend` 项目实际代码结构整理，用于指导前端开发工作。

---

## 1. 项目概述

### 1.1 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js (App Router) | React 18，SSR/SSG |
| UI | Tailwind CSS v4 | 原子化 CSS |
| 语言 | TypeScript | 类型安全 |
| 包管理 | npm | |
| MD 编辑器 | @uiw/react-md-editor | Markdown 编辑器 |
| MD 渲染 | react-markdown | Markdown 渲染 |

### 1.2 项目结构

```
sc-frontend/
├── src/
│   ├── app/                     # Next.js App Router 页面
│   │   ├── page.tsx            # 首页 (/)
│   │   ├── layout.tsx          # 根布局
│   │   ├── globals.css         # 全局样式
│   │   ├── auth/              # 认证页面
│   │   │   ├── login/        # 登录页 (/auth/login)
│   │   │   └── register/    # 注册页 (/auth/register)
│   │   ├── profile/          # 个人中心 (/profile)
│   │   ├── blogs/            # 博客
│   │   │   ├── page.tsx      # 博客列表 (/blogs)
│   │   │   ├── new/          # 创建博客 (/blogs/new)
│   │   │   └── [id]/        # 博客详情 (/blogs/[id])
│   │   ├── projects/         # Projects 页 (/projects)
│   │   ├── hobbies/          # Hobbies 页 (/hobbies)
│   │   └── tools/            # Tools 页 (/tools)
│   ├── components/           # React 组件
│   │   ├── Cards/            # 卡片组件
│   │   │   ├── TextCard.tsx      # 文字卡片
│   │   │   ├── ImageBgCard.tsx   # 背景图卡片
│   │   │   ├── ImageSlideCard.tsx # 上移动画卡片
│   │   │   ├── ImageFillCard.tsx # 填充图卡片
│   │   │   ├── BlogCard.tsx      # 博客卡片
│   │   │   ├── ProjectCard.tsx   # 项目卡片
│   │   │   ├── HobbyCard.tsx     # 爱好卡片
│   │   │   ├── ReadCard.tsx      # 阅读记录卡片
│   │   │   └── ToolCard.tsx      # 工具卡片
│   │   ├── Navbar.tsx        # 导航栏
│   │   ├── FloatingAvatar.tsx # 左下角悬浮头像
│   │   ├── PageHeader.tsx    # 页面标题
│   │   ├── EmptyState.tsx    # 空状态组件
│   │   ├── Toast.tsx         # 提示组件
│   │   ├── ConfirmDialog.tsx # 确认弹窗
│   │   ├── ErrorBoundary.tsx # 错误边界
│   │   └── Providers.tsx     # 全局 Provider 组合
│   ├── contexts/             # React Context
│   │   └── AuthContext.tsx   # 认证状态管理
│   ├── services/            # API 服务层
│   │   └── api.ts           # 后端 API 调用
│   └── types/              # TypeScript 类型
│       └── index.ts        # 类型定义
├── public/                 # 静态资源
│   ├── uploads/avatars/   # 头像上传目录
│   └── fonts/            # 字体文件
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 2. 代码规范

### 2.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 页面组件 | 小写下划线或 kebab-case | `blogs/page.tsx`, `auth/login/page.tsx` |
| 组件 | 大驼峰 | `Navbar.tsx`, `BlogCard.tsx` |
| Hooks | 小写下划线，以 `use` 开头 | `useAuth.ts`, `useToast.ts` |
| 工具函数 | 小写下划线 | `formatDate.ts`, `validateEmail.ts` |
| 类型定义 | 小写下划线 | `index.ts`, `user.ts` |

### 2.2 组件扩展名

| 组件类型 | 扩展名 | 说明 |
|----------|--------|------|
| React 组件 | `.tsx` | 包含 JSX |
| 普通 TypeScript | `.ts` | 不包含 JSX |

### 2.3 导入顺序

```typescript
// 1. React 相关
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// 2. Next.js 相关
import Link from "next/link";
import { useRouter } from "next/navigation";

// 3. 第三方库
import { useToast } from "@/components/Toast";

// 4. 本地导入
import { useAuth } from "@/contexts/AuthContext";
import { blogApi } from "@/services/api";
import type { BlogListItem } from "@/types";
```

### 2.4 注释规范

```typescript
// 组件说明
interface BlogCardProps {
  /** 博客数据 */
  blog: BlogListItem;
  /** 自定义链接，默认 /blogs/{id} */
  linkUrl?: string;
  /** 宽卡片（跨两列） */
  wide?: boolean;
}

// 函数说明
/**
 * 格式化日期显示
 * @param dateStr ISO 日期字符串
 * @returns 格式化后的日期，如 "April 4, 2026"
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
```

---

## 3. Next.js App Router 规范

### 3.1 Server vs Client Component

```typescript
// Server Component（默认，无需声明）
// - 可直接访问数据库、文件系统
// - 可使用 async/await
// - 不能使用 useState、useEffect 等客户端 API

export default function BlogsPage() {
  // Server Component
  return <div>服务端渲染</div>;
}

// Client Component（必须声明 "use client"）
"use client";

import { useState, useEffect } from "react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  // Client Component
  return <div>客户端渲染</div>;
}
```

### 3.2 路由规则

```
src/app/                    → /
src/app/blogs/page.tsx      → /blogs
src/app/blogs/[id]/page.tsx → /blogs/1, /blogs/2
src/app/blogs/new/page.tsx  → /blogs/new
```

### 3.3 layout.tsx 规范

```typescript
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import FloatingAvatar from "@/components/FloatingAvatar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "SuperCenter",
  description: "Personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <FloatingAvatar />
        </Providers>
      </body>
    </html>
  );
}
```

---

## 4. TypeScript 规范

### 4.1 类型定义文件

统一放在 `src/types/index.ts`：

```typescript
// 用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  role: "blogger" | "user" | "admin";
  created_at: string;
}

// 博客类型
export interface Blog {
  id: number;
  author_id: number;
  title: string;
  subtitle: string | null;
  content: string;
  category: "Tech" | "Emotion" | "Diary" | "Question";
  created_at: string;
  updated_at: string;
}
```

### 4.2 Props 类型定义

```typescript
// 使用接口定义 Props
interface BlogCardProps {
  blog: BlogListItem;
  linkUrl?: string;
  wide?: boolean;
}

// 函数组件类型
export default function BlogCard({
  blog,
  linkUrl,
  wide = false,
}: BlogCardProps) {
  // ...
}
```

### 4.3 useState 类型推断

```typescript
// 简单类型，TypeScript 自动推断
const [isLoading, setIsLoading] = useState(false); // boolean

// 复杂类型，需要显式声明
const [blogs, setBlogs] = useState<BlogListItem[]>([]);

// 可选状态
const [user, setUser] = useState<User | null>(null);
```

---

## 5. Tailwind CSS 规范

### 5.1 常用类名

| 功能 | 类名 |
|------|------|
| 布局 | `flex`, `grid`, `block`, `inline-block` |
| 间距 | `p-4`, `px-4`, `py-2`, `m-4`, `mx-auto` |
| 尺寸 | `w-full`, `h-12`, `min-h-screen` |
| 文本 | `text-sm`, `text-neutral-500`, `font-medium` |
| 颜色 | `bg-white`, `text-neutral-900`, `border-neutral-200` |
| 圆角 | `rounded`, `rounded-lg`, `rounded-full` |
| 阴影 | `shadow-md`, `shadow-lg` |
| 背景模糊 | `backdrop-blur-sm`, `backdrop-blur-md` |
| 响应式 | `md:text-lg`, `lg:grid-cols-3` |

### 5.2 页面布局容器

```typescript
// 主布局（layout.tsx）
<div className="mx-auto w-full max-w-screen-sm px-8 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-2xl">
  <Navbar />
  <main className="pb-8">{children}</main>
</div>

// 全局底部留白 32px（pb-8）
```

### 5.3 条件类名

```typescript
// 使用模板字符串
<div className={`rounded-lg p-4 ${isActive ? "bg-blue-500" : "bg-gray-500"}`}>

// 使用 clsx 或 classnames 库（可选）
import clsx from "clsx";

<div className={clsx(
  "rounded-lg p-4",
  isActive && "bg-blue-500",
  !isActive && "bg-gray-500"
)}>
```

### 5.4 状态样式

```typescript
// Hover
<button className="hover:bg-blue-600">

// Focus
<input className="focus:border-blue-500 focus:outline-none">

// Disabled
<button disabled className="opacity-50 cursor-not-allowed">

// Transition
<div className="transition-colors duration-150 hover:bg-blue-500">
```

---

## 6. 组件规范

### 6.1 组件文件结构

```typescript
// 1. 导入
"use client";  // 如果是客户端组件

import { useState } from "react";
import Link from "next/link";
import type { BlogListItem } from "@/types";

// 2. Props 接口
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

// 3. 组件实现
export default function Component({ title, onClick }: ComponentProps) {
  return (
    <div onClick={onClick}>
      {title}
    </div>
  );
}
```

### 6.2 全局组件（放在 `src/components/`）

| 组件 | 文件 | 说明 |
|------|------|------|
| Navbar | `Navbar.tsx` | 导航栏，sticky 定位 |
| FloatingAvatar | `FloatingAvatar.tsx` | 左下角悬浮头像，呼吸动画 |
| PageHeader | `PageHeader.tsx` | 页面标题组件 |
| EmptyState | `EmptyState.tsx` | 空状态，彩虹渐变文字 |
| Toast | `Toast.tsx` | 提示组件，顶部居中 |
| ConfirmDialog | `ConfirmDialog.tsx` | 确认弹窗 |
| Providers | `Providers.tsx` | 全局 Provider 组合 |
| ErrorBoundary | `ErrorBoundary.tsx` | 错误边界 |
| LoginModal | `LoginModal.tsx` | 登录弹窗 |

### 6.3 卡片组件（放在 `src/components/Cards/`）

| 组件 | 文件 | 用途 |
|------|------|------|
| TextCard | `TextCard.tsx` | 纯文字展示 |
| ImageBgCard | `ImageBgCard.tsx` | 背景图 + 渐变遮罩 |
| ImageSlideCard | `ImageSlideCard.tsx` | 图片上移动画 |
| ImageFillCard | `ImageFillCard.tsx` | 封面图填满容器 |
| BlogCard | `BlogCard.tsx` | 博客列表展示 |
| ProjectCard | `ProjectCard.tsx` | 项目展示 |
| HobbyCard | `HobbyCard.tsx` | 爱好入口（自动分发） |
| ReadCard | `ReadCard.tsx` | 阅读记录卡片 |
| ToolCard | `ToolCard.tsx` | 工具卡片 |

### 6.3 Navbar 组件

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Wenmudong", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "Projects", href: "/projects" },
  { label: "Hobbies", href: "/hobbies" },
  { label: "Tools", href: "/tools" },
];

export default function Navbar() {
  const pathname = usePathname();
  // ...
}
```

### 6.4 PageHeader 组件

```typescript
import { ReactNode } from "react";

interface PageHeaderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, description, children }: PageHeaderProps) {
  if (!title && !description && !children) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 px-2 pt-4 pb-8 md:gap-8">
      {title && <h1 className="text-6xl md:text-8xl">{title}</h1>}
      {description && <p className="text-neutral-400">{description}</p>}
      {children}
    </div>
  );
}
```

### 6.5 Toast 组件

```typescript
// 使用方式
import { useToast } from "@/components/Toast";

const { showToast } = useToast();

showToast("操作成功", "success");
showToast("出错了", "error");
showToast("普通提示", "info");
```

### 6.6 ConfirmDialog 组件

```typescript
import ConfirmDialog from "@/components/ConfirmDialog";

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  open={showConfirm}
  title="确认删除"
  message="确定要删除这篇博客吗？"
  onConfirm={() => {
    deleteBlog();
    setShowConfirm(false);
  }}
  onCancel={() => setShowConfirm(false)}
  confirmText="删除"
  confirmClassName="bg-red-600 hover:bg-red-700"
/>
```

---

## 7. Context 规范

### 7.1 AuthContext

```typescript
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authApi, userApi } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { email?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // ...
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### 7.2 使用 Hook

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, token, login, register, logout, updateUser } = useAuth();

// 检查用户角色
if (user?.role === "blogger") {
  // 显示创建博客按钮
}
```

---

## 8. API 服务层规范

### 8.1 API 文件结构

统一放在 `src/services/api.ts`：

```typescript
const API_BASE = "http://localhost:8000/api";

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// API 模块化导出
export const authApi = { ... };
export const userApi = { ... };
export const blogApi = { ... };
export const uploadApi = { ... };
```

### 8.2 API 调用示例

```typescript
// 列表
const blogs = await blogApi.list();

// 详情
const blog = await blogApi.get(id);

// 创建（需要 token）
const newBlog = await blogApi.create(token, title, subtitle, content, category);

// 删除（需要 token）
await blogApi.delete(token, id);
```

---

## 9. 页面开发规范

### 9.1 页面结构

```typescript
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import BlogCard from "@/components/BlogCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { blogApi } from "@/services/api";
import type { BlogListItem } from "@/types";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    blogApi.list()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="blogs." description="Wenmudong's thoughts." />

      {isLoading ? (
        <p>Loading...</p>
      ) : blogs.length === 0 ? (
        <EmptyState message="No blogs yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </>
  );
}
```

### 9.2 表单页面

```typescript
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 表单内容 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### 9.3 动态路由

```typescript
// src/app/blogs/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { blogApi } from "@/services/api";

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = Number(params.id);

  // ...
}
```

---

## 10. 认证规范

### 10.1 Token 管理

- Token 存储在 `localStorage`，key 为 `auth_token`
- Token 有效期 7 天
- 页面刷新时自动验证 Token 有效性

### 10.2 权限控制

| 角色 | 权限 |
|------|------|
| `user` | 修改个人信息 |
| `blogger` | 发布/管理博客 |
| `admin` | 功能待定 |

### 10.3 条件渲染

```typescript
const { user } = useAuth();

// 仅 blogger 可见
{user?.role === "blogger" && (
  <Link href="/blogs/new">创建博客</Link>
)}

// 已登录/未登录显示不同内容
{user ? (
  <Link href="/profile">个人中心</Link>
) : (
  <Link href="/auth/login">登录</Link>
)}
```

---

## 11. 样式规范

### 11.1 字体配置

使用 Fusion Pixel 12px 像素字体，在 `globals.css` 中配置：

```css
@font-face {
  font-family: "FusionPixel";
  src: url("/fonts/fusion-pixel-12px-monospaced-latin.ttf.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@theme inline {
  --font-sans: "FusionPixel", var(--font-geist-sans);
  --font-mono: "FusionPixel", var(--font-geist-mono);
}
```

### 11.2 动画

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.10); }
}

.animate-breathe {
  animation: breathe 3s ease-in-out infinite;
}
```

### 11.3 背景模糊

```typescript
// 毛玻璃效果
<div className="bg-white/70 backdrop-blur-md">

// 深色毛玻璃
<div className="bg-black/30 backdrop-blur-sm">
```

---

## 12. 常用命令

```bash
cd sc-frontend

# 安装依赖
npm install

# 开发服务器 (http://localhost:3000)
npm run dev

# 生产构建
npm run build

# ESLint 检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

---

## 13. 与后端通信

| 项目 | 地址 |
|------|------|
| 后端地址 | `http://localhost:8000` |
| API 前缀 | `/api` |
| 健康检查 | `GET http://localhost:8000/api/health` |
| API 文档 | `http://localhost:8000/docs` |

---

## 14. 附录

### 14.1 目录别名

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

使用 `@/` 代替相对路径：

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { blogApi } from "@/services/api";
import type { Blog } from "@/types";
```

### 14.2 组件开发检查清单

- [ ] 是否需要 `"use client"` 声明
- [ ] Props 是否有类型定义
- [ ] 是否正确导入所需依赖
- [ ] 是否有 loading 状态处理
- [ ] 是否有错误处理
- [ ] 权限控制是否正确
- [ ] Tailwind 类名是否规范
- [ ] 底部是否留白 `pb-8`
