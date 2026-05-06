# Blog 功能优化建议

> 生成时间：2026-04-04

---

## 📋 优化清单

### 🔴 高优先级（影响用户体验）

| # | 问题 | 位置 | 说明 | 修复方案 |
|---|------|------|------|----------|
| 1 | **Markdown 未渲染** | 博客详情页 | 内容显示为纯文本 `white-space: pre-wrap`，未使用 `react-markdown` 渲染 | 引入 `react-markdown` 渲染内容 |
| 2 | **Subtitle 未显示** | 博客详情页 | 博客有 subtitle 字段但详情页没有展示 | 在标题下方添加 subtitle 显示 |
| 3 | **分类标签未显示** | 博客详情页 | 缺少分类标签，用户无法一眼看出博客类别 | 添加彩色分类标签 |
| 4 | **作者信息未显示** | 博客详情页 | 详情页顶部缺少作者信息（头像、用户名） | 在顶部添加作者头像 + 用户名 |

### 🟡 中优先级（功能完善）

| # | 问题 | 位置 | 说明 | 修复方案 |
|---|------|------|------|----------|
| 5 | **评论时间显示粗糙** | 博客详情页 | 只显示日期，应显示具体时间或相对时间 | 使用 `date-fns` 或自定义函数格式化时间 |
| 6 | **缺少分类筛选** | 博客列表页 | 无法按 Tech/Emotion/Diary/Question 筛选博客 | 添加分类筛选按钮/下拉框 |
| 7 | **回复功能权限过严** | 评论系统 | 只有博主能回复，普通用户不能互相讨论 | 改为登录用户都可以回复 |
| 8 | **编辑后无提示** | 编辑博客页 | 更新成功后只跳转，缺少成功 Toast 提示 | 添加 `showToast("Blog updated successfully", "success")` |

### 🟢 低优先级（体验增强）

| # | 问题 | 位置 | 说明 | 修复方案 |
|---|------|------|------|----------|
| 9 | **无阅读量统计** | 博客列表/详情 | 无法知道博客的受欢迎程度 | 后端添加 `view_count` 字段 |
| 10 | **无博客数量统计** | 博客列表页 | 用户不知道总共有多少篇博客 | 在列表页显示 "X blogs" |
| 11 | **博客列表无排序选项** | 博客列表页 | 默认按时间倒序，但没有其他排序方式 | 添加排序选项（最新/评论数） |

---

## 🔧 具体修复方案

### 1. Markdown 渲染

**文件**: `sc-frontend/src/app/blogs/[id]/page.tsx`

```tsx
// 添加导入
import ReactMarkdown from "react-markdown";

// 替换内容显示
// 之前：
<p className="whitespace-pre-wrap text-neutral-800">{blog.content}</p>

// 之后：
<article className="prose max-w-none">
  <ReactMarkdown>{blog.content}</ReactMarkdown>
</article>
```

### 2. 博客详情页信息完善

**文件**: `sc-frontend/src/app/blogs/[id]/page.tsx`

在博客内容区域上方添加：

```tsx
{/* 博客元信息 */}
<div className="mb-4 flex items-center gap-3">
  {/* 分类标签 */}
  <span className={`inline-block rounded px-2 py-1 text-sm ${
    blog.category === 'Tech' ? 'bg-blue-400/40 text-blue-900' :
    blog.category === 'Emotion' ? 'bg-pink-400/40 text-pink-900' :
    blog.category === 'Diary' ? 'bg-amber-400/40 text-amber-900' :
    'bg-purple-400/40 text-purple-900'
  }`}>
    {blog.category}
  </span>
  <span className="text-sm text-neutral-400">by {blog.author_username}</span>
</div>

{/* Subtitle */}
{blog.subtitle && (
  <p className="mb-4 text-lg text-neutral-600">{blog.subtitle}</p>
)}
```

### 3. 评论时间格式化

**文件**: `sc-frontend/src/app/blogs/[id]/page.tsx`

```tsx
// 添加工具函数
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// 使用
<span className="text-sm text-neutral-500">
  {formatTimeAgo(comment.created_at)}
</span>
```

### 4. 博客列表页添加博客数量

**文件**: `sc-frontend/src/app/blogs/page.tsx`

```tsx
// 在 PageHeader 中添加
<PageHeader
  title="blogs."
  description={`${blogs.length} posts · Wenmudong's thoughts and writings.`}
/>
```

### 5. 编辑成功后添加 Toast

**文件**: `sc-frontend/src/app/blogs/[id]/edit/page.tsx`

```tsx
// 在 try 块中，更新成功后添加
try {
  await blogApi.update(...);
  showToast("Blog updated successfully", "success");  // 添加这行
  router.push(`/blogs/${blogId}`);
} catch ...
```

---

## 📁 相关文件

### 后端
- `sc-backend/app/models/blog.py` — 博客模型
- `sc-backend/app/schemas/blog.py` — 博客 Schema
- `sc-backend/app/routers/blogs.py` — 博客路由
- `sc-backend/app/models/comment.py` — 评论模型
- `sc-backend/app/routers/comments.py` — 评论路由

### 前端
- `sc-frontend/src/app/blogs/page.tsx` — 博客列表页
- `sc-frontend/src/app/blogs/new/page.tsx` — 创建博客页
- `sc-frontend/src/app/blogs/[id]/page.tsx` — 博客详情页
- `sc-frontend/src/app/blogs/[id]/edit/page.tsx` — 编辑博客页
- `sc-frontend/src/components/BlogCard.tsx` — 博客卡片组件
