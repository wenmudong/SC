# CLAUDE.md

This file provides guidance to Claude Code when working with code in `sc-frontend/`.

## 常用命令

```bash
npm install              # 安装依赖
npm run dev              # 开发服务器 (http://localhost:3000)
npm run build            # 生产构建
npm run lint             # ESLint 检查
npm run type-check       # TypeScript 类型检查
```

## 项目结构

```
src/
├── app/                  # App Router 页面
│   ├── page.tsx          # 首页 (/)
│   ├── layout.tsx        # 根布局
│   ├── globals.css       # 全局样式（含呼吸动画）
│   ├── auth/             # 认证页面
│   │   ├── login/        # 登录页 (/auth/login)
│   │   └── register/     # 注册页 (/auth/register)
│   ├── profile/          # 个人中心 (/profile)
│   ├── blogs/            # 博客
│   │   ├── page.tsx      # 博客列表 (/blogs)
│   │   ├── new/
│   │   │   └── page.tsx  # 创建博客 (/blogs/new)
│   │   └── [id]/
│   │       └── page.tsx  # 博客详情 (/blogs/[id])
│   ├── projects/         # Projects 页 (/projects)
│   ├── hobbies/          # Hobbies 页 (/hobbies)
│   └── tools/            # Tools 页 (/tools)
├── components/           # React 组件
│   ├── Navbar.tsx        # 导航栏
│   ├── FloatingAvatar.tsx # 左下角悬浮头像（呼吸动画、右键菜单）
│   ├── PageHeader.tsx    # 页面标题（可选 title/description/children）
│   ├── Card.tsx          # 项目卡片
│   ├── EmptyState.tsx    # 空状态组件（彩虹渐变文字）
│   ├── Toast.tsx         # 提示组件（顶部居中弹出）
│   ├── ToastContext.tsx  # Toast 上下文
│   ├── ConfirmDialog.tsx # 确认弹窗组件
│   └── Providers.tsx     # 全局 Provider 组合
├── contexts/             # React Context
│   └── AuthContext.tsx    # 认证状态管理
├── services/             # API 服务层
│   └── api.ts            # 后端 API 调用
└── types/               # TypeScript 类型
    └── index.ts         # 类型定义
```

## Next.js App Router 关键约定

**这是 NOT 你熟悉的 Next.js** — App Router 有重大变更。

### 路由规则
- `src/app/` 目录结构直接映射 URL：`src/app/about/page.tsx` → `/about`
- 动态路由：`src/app/blogs/[id]/page.tsx` → `/blogs/1`, `/blogs/2` 等
- 布局组件 `layout.tsx`：定义 HTML 结构和子组件包装
- 页面组件 `page.tsx`：路由对应的页面内容

### Server vs Client Component
- **默认是 Server Component**：服务端渲染，可直接访问数据库
- **Client Component**：需要 `"use client"` 指令才能使用 `useState`、`useEffect` 等

```tsx
// Server Component（默认）
export default function Page() {
  return <div>服务端渲染</div>
}

// Client Component（需声明）
"use client"
import { useState } from "react"
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 组件导入
- Server Component 可直接导入 Client Component
- Client Component **不能**导入 Server Component（但可以接收 children 作为 prop）

## 与后端通信

- 后端地址：`http://localhost:8000`
- 健康检查：`GET http://localhost:8000/api/health`
- CORS 已配置允许 `localhost:3000`

## 认证系统

使用 `AuthContext` 管理认证状态：

```tsx
import { useAuth } from "@/contexts/AuthContext";

const { user, token, login, register, logout, updateUser } = useAuth();
```

- `user`: 当前用户信息，未登录时为 `null`
- `token`: JWT Token，未登录时为 `null`
- `login(username, password)`: 登录
- `register(username, email, password)`: 注册
- `logout()`: 登出
- `updateUser({ email, avatar_url })`: 更新个人信息

Token 存储在 localStorage，有效期 7 天。

## 通用组件

### Toast 提示组件

顶部居中弹出，3秒后自动消失。

```tsx
import { useToast } from "@/components/Toast";

const { showToast } = useToast();

// 使用
showToast("操作成功", "success");
showToast("出错了", "error");
showToast("普通提示", "info");
```

### ConfirmDialog 确认弹窗

居中显示，带遮罩背景和取消/确认按钮。

```tsx
import ConfirmDialog from "@/components/ConfirmDialog";

const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  open={showConfirm}
  title="确认删除"
  message="确定要删除吗？"
  onConfirm={() => setShowConfirm(false)}
  onCancel={() => setShowConfirm(false)}
  confirmText="删除"
  confirmClassName="bg-red-600 hover:bg-red-700"
/>
```

### EmptyState 空状态组件

列表为空时显示，居中大号彩虹渐变文字。

```tsx
import EmptyState from "@/components/EmptyState";

<EmptyState message="No items yet." />
```

## 博客功能

### 创建博客 (/blogs/new)

- 仅 blogger 可见
- 包含标题、副标题（可选）、Markdown 内容编辑器
- 使用 @uiw/react-md-editor 组件

### 博客详情 (/blogs/[id])

- 显示标题、副标题、Markdown 渲染内容
- 仅博主可见编辑/删除按钮

## 开发约定

- 使用 TypeScript
- 样式使用 Tailwind CSS（原子化 CSS）
- 组件文件用 `.tsx` 扩展名
- 交互逻辑需要 `"use client"` 声明
- 新页面放在 `src/app/` 目录
- 全局组件放在 `src/components/`
- API 调用通过 `src/services/api.ts`
- 全局底部留白 32px（`pb-8`）

## 像素字体

使用 Fusion Pixel Font 12px 像素字体：

- 字体文件位置：`public/fonts/fusion-pixel-12px-monospaced-*.ttf.woff2`
- 在 `globals.css` 中通过 `@font-face` 引入
- 切换方式：修改 `@theme inline` 中的 `--font-sans` 变量

## 相关文档

- 项目详细文档：`docs/SPEC.md`
- Next.js 官方文档：`node_modules/next/dist/docs/`
