# 前端页面分析文档

> 本文档基于 2026-06-15 对 `sc-frontend` 项目的分析整理

---

## 1. 页面结构总览

### 1.1 所有页面列表

| 路由 | 页面文件 | 功能说明 | 权限要求 |
|------|----------|----------|----------|
| `/` | [page.tsx](../sc-frontend/src/app/page.tsx) | 首页，显示 "Wenmudong." 标题 | 无 |
| `/profile` | [profile/page.tsx](../sc-frontend/src/app/profile/page.tsx) | 个人资料管理、头像上传、退出登录 | 需登录 |
| `/projects` | [projects/page.tsx](../sc-frontend/src/app/projects/page.tsx) | 项目展示卡片列表（mock 数据） | 需登录 |
| `/hobbies` | [hobbies/page.tsx](../sc-frontend/src/app/hobbies/page.tsx) | 爱好展示（书籍、植物、攀岩、键盘等） | 需登录 |
| `/tools` | [tools/page.tsx](../sc-frontend/src/app/tools/page.tsx) | 工具列表（水平滚动 + 拖拽） | 需登录 |
| `/tools/compress` | [tools/compress/page.tsx](../sc-frontend/src/app/tools/compress/page.tsx) | 图片批量压缩/转换工具 | 需登录 |
| `/blogs` | [blogs/page.tsx](../sc-frontend/src/app/blogs/page.tsx) | 博客列表，支持分类筛选 | 需登录 |
| `/blogs/new` | [blogs/new/page.tsx](../sc-frontend/src/app/blogs/new/page.tsx) | 创建新博客（Markdown 编辑器） | blogger |
| `/blogs/[id]` | [blogs/[id]/page.tsx](../sc-frontend/src/app/blogs/[id]/page.tsx) | 博客详情页 | 需登录 |
| `/blogs/[id]/edit` | [blogs/[id]/edit/page.tsx](../sc-frontend/src/app/blogs/[id]/edit/page.tsx) | 编辑博客文章 | blogger |
| `/admin/config` | [admin/config/page.tsx](../sc-frontend/src/app/admin/config/page.tsx) | 管理后台（导航栏、字体配置） | admin |

### 1.2 数据来源

| 页面 | 数据来源 | 说明 |
|------|----------|------|
| Projects | `mockProjects` 静态数据 | 使用 mock 数据，后续对接后端 |
| Hobbies | `mockHobbies` 静态数据 | 使用 mock 数据，后续对接后端 |
| Blogs | `blogApi.list()` | 通过 API 从后端获取 |
| Tools | `TOOLS` 静态配置 | 当前只有 Image Compress |

---

## 2. 通用架构

### 2.1 根布局结构

```
┌─────────────────────────────────────────────────────┐
│  <html lang="en"> (字体变量、全局CSS)                │
│  ┌─────────────────────────────────────────────────┐ │
│  │  <body class="min-h-full flex flex-col">        │ │
│  │  ┌───────────────────────────────────────────┐  │ │
│  │  │  <Providers> (状态管理包裹)                │  │ │
│  │  │  ┌─────────────────────────────────────┐  │  │ │
│  │  │  │  <Navbar />                        │  │  │ │
│  │  │  │  <main class="pb-8">{children}</main>│  │  │ │
│  │  │  └─────────────────────────────────────┘  │  │ │
│  │  │  <FloatingAvatar /> (固定定位)            │  │ │
│  │  └───────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**容器类名**：`mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-2xl px-8`

### 2.2 全局状态管理

Providers 嵌套顺序：
```
AuthProvider
  └── SystemConfigProvider
        └── ToastProvider
              └── AuthModalProvider
                    └── {children}
                    └── LoginModal
```

| Context | 文件 | 用途 |
|---------|------|------|
| AuthContext | [AuthContext.tsx](../sc-frontend/src/contexts/AuthContext.tsx) | 用户认证状态（user, token, login, logout） |
| SystemConfigContext | [SystemConfigContext.tsx](../sc-frontend/src/contexts/SystemConfigContext.tsx) | 系统配置（navbar_config, global_font） |
| ToastContext | [Toast.tsx](../sc-frontend/src/components/Toast.tsx) | 消息提示（showToast） |
| AuthModalContext | [useAuthModal.ts](../sc-frontend/src/hooks/useAuthModal.ts) | 登录弹窗控制（openAuthModal, closeAuthModal） |

---

## 3. 通用组件清单

### 3.1 布局组件

| 组件 | 文件 | 用途 | 使用页面 |
|------|------|------|----------|
| Navbar | [Navbar.tsx](../sc-frontend/src/components/Navbar.tsx) | 顶部胶囊导航栏 + 右侧链接 | 所有页面 |
| FloatingAvatar | [FloatingAvatar.tsx](../sc-frontend/src/components/FloatingAvatar.tsx) | 左下角悬浮头像 + 右键菜单 | 所有页面 |
| PageHeader | [PageHeader.tsx](../sc-frontend/src/components/PageHeader.tsx) | 页面标题区域 | 部分页面 |

### 3.2 功能组件

| 组件 | 文件 | 用途 | 使用页面 |
|------|------|------|----------|
| LoginModal | [LoginModal.tsx](../sc-frontend/src/components/LoginModal.tsx) | 登录/注册弹窗 | 全局 |
| AuthGuard | [AuthGuard.tsx](../sc-frontend/src/components/AuthGuard.tsx) | 页面级登录守卫 | Projects, Hobbies |
| Toast | [Toast.tsx](../sc-frontend/src/components/Toast.tsx) | 顶部消息提示（3秒自动消失） | 全局 |
| ConfirmDialog | [ConfirmDialog.tsx](../sc-frontend/src/components/ConfirmDialog.tsx) | 确认弹窗（删除等危险操作） | Blog Detail |

### 3.3 状态组件

| 组件 | 文件 | 用途 |
|------|------|------|
| EmptyState | [EmptyState.tsx](../sc-frontend/src/components/EmptyState.tsx) | 空状态（彩虹渐变文字） |
| Loading | [Loading.tsx](../sc-frontend/src/components/Loading.tsx) | 加载状态（像素动画） |
| GradientText | [GradientText.tsx](../sc-frontend/src/components/GradientText.tsx) | 彩虹渐变文字 |

---

## 4. 设计规范

### 4.1 响应式断点

| 断点 | 类名前缀 | 屏幕宽度 |
|------|----------|----------|
| sm | `sm:` | 640px |
| md | `md:` | 768px |
| lg | `lg:` | 1024px |
| xl | `xl:` | 1280px |
| 2xl | `2xl:` | 1536px |

### 4.2 颜色系统

| 类型 | 类名 | 用途 |
|------|------|------|
| 主色 | `neutral-900` | 标题、按钮背景 |
| 次色 | `neutral-400` / `neutral-500` | 描述文字、次要信息 |
| 背景 | `neutral-50` / `neutral-100` | 卡片背景、输入框 |
| 成功 | `green-500` / `green-100` | 成功提示、状态标签 |
| 错误 | `red-500` / `red-100` | 错误提示、删除按钮 |
| 信息 | `blue-500` / `blue-100` | 信息提示、链接 |

### 4.3 动画效果

| 动画 | 类名 | 用途 |
|------|------|------|
| 呼吸动画 | `animate-breathe` | 浮动头像 |
| 下滑动画 | `animate-slide-down` | 导航栏 |
| 心跳动画 | `animate-heart-beat` | Loading 组件 |
| 弹跳动画 | `animate-slime-bounce` | Loading 组件 |
| 拉伸动画 | `animate-dachshund-stretch` | Loading 组件 |

---

## 5. 页面模板模式

### 5.1 模式 A：带登录守卫的列表页

```tsx
<AuthGuard>
  {/* 固定头部区域 */}
  <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
    <div className="flex flex-col gap-4 px-2 pt-4 pb-4">
      <h1 className="font-sans text-6xl font-extralight text-neutral-900 md:text-8xl">
        页面名.
      </h1>
      <p className="text-lm text-neutral-400">
        {数量} · 描述文字
      </p>
    </div>
  </div>

  {/* 内容网格 */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {/* 卡片列表 */}
  </div>
</AuthGuard>
```

**使用页面**：Projects, Hobbies, Blogs, Tools

### 5.2 模式 B：内容详情页

```tsx
<PageHeader description="描述" />

<div className="mx-auto max-w-3xl pb-8">
  {/* 内容区域 */}
</div>
```

**使用页面**：Profile, Blog Detail, New Blog, Edit Blog, Compress

### 5.3 模式 C：管理后台页

```tsx
<div className="min-h-screen px-4 py-8">
  <div className="mx-auto max-w-2xl">
    {/* 配置内容 */}
  </div>
</div>
```

**使用页面**：Admin Config

---

## 6. 认证流程

### 6.1 登录流程

1. 未登录用户点击非首页导航
2. 自动弹出 `LoginModal`
3. 用户输入用户名/密码
4. 调用 `login()` 或 `register()`
5. 成功后关闭弹窗，刷新页面

### 6.2 浮动头像行为

| 状态 | 显示 | 点击行为 |
|------|------|----------|
| 未登录 | 用户图标（呼吸动画） | 打开登录弹窗 |
| 已登录 | 用户头像/首字母 | 跳转 `/profile` |
| 已登录（右键） | 右键菜单 | 显示 Profile/Logout |

### 6.3 页面守卫

- `AuthGuard` 组件包裹需要登录的页面
- 未登录时不渲染子内容，自动弹出登录弹窗
- `useAuthGuard` hook 用于需要手动控制的场景

---

## 7. 导航栏配置

### 7.1 默认配置

```json
{
  "style": "blur",
  "nav_items": [
    { "label": "Wenmudong", "href": "/", "visible": true },
    { "label": "Blogs", "href": "/blogs", "visible": true },
    { "label": "Projects", "href": "/projects", "visible": true },
    { "label": "Hobbies", "href": "/hobbies", "visible": true },
    { "label": "Tools", "href": "/tools", "visible": true }
  ],
  "right_links": [
    { "label": "Github", "href": "https://github.com/wenmudong", "visible": true }
  ]
}
```

### 7.2 样式选项

| 样式 | 类名 | 效果 |
|------|------|------|
| blur | `bg-neutral-50/70 backdrop-blur-sm` | 毛玻璃效果 |
| solid | `bg-neutral-50/90` | 实色背景 |
| transparent | `bg-transparent` | 透明背景 |

### 7.3 配置管理

- 配置存储在后端，通过 `SystemConfigContext` 获取
- 管理员可在 `/admin/config` 修改配置
- 支持拖拽排序、显示/隐藏切换

---

## 8. 统计数据

| 类别 | 数量 |
|------|------|
| 总页面数 | 11 |
| 通用组件 | 10 |
| 全局 Context | 4 |
| 页面模板模式 | 3 |
| 响应式断点 | 5 |

---

## 9. 开发建议

### 9.1 新增页面

1. 选择合适的页面模板模式
2. 在 `src/app/` 目录下创建页面文件
3. 根据需要添加 `AuthGuard` 包裹
4. 使用通用组件保持一致性

### 9.2 样式规范

- 使用 Tailwind CSS 原子化类名
- 遵循颜色系统
- 保持响应式设计

### 9.3 组件复用

- 列表页使用 `EmptyState` 处理空状态
- 加载时使用 `Loading` 组件
- 操作反馈使用 `Toast` 或 `ConfirmDialog`

---

*文档版本：v1.0*
*最后更新：2026-06-15*
