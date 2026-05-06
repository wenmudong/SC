# Blog 功能优化执行计划

> 生成时间：2026-04-04
> 状态：待批准

---

## 📋 本次优化内容（共 10 项）

### 🔴 高优先级（4 项）

| # | 优化项 | 文件 |
|---|--------|------|
| 1 | Markdown 渲染 | `sc-frontend/src/app/blogs/[id]/page.tsx` |
| 2 | 显示 Subtitle | `sc-frontend/src/app/blogs/[id]/page.tsx` |
| 3 | 显示分类标签 | `sc-frontend/src/app/blogs/[id]/page.tsx` |
| 4 | 显示作者信息 | 后端 `sc-backend/app/routers/blogs.py` + 前端 `sc-frontend/src/app/blogs/[id]/page.tsx` |

### 🟡 中优先级（3 项）

| # | 优化项 | 文件 |
|---|--------|------|
| 5 | 评论时间格式化 | `sc-frontend/src/app/blogs/[id]/page.tsx` |
| 6 | 博客列表分类筛选 | `sc-frontend/src/app/blogs/page.tsx` |
| 8 | 编辑成功后 Toast 提示 | `sc-frontend/src/app/blogs/[id]/edit/page.tsx` |

### 🟢 低优先级（3 项）

| # | 优化项 | 文件 |
|---|--------|------|
| 9 | 添加阅读量统计 | 后端 + 前端 |
| 10 | 显示博客数量 | `sc-frontend/src/app/blogs/page.tsx` |
| 11 | 博客列表排序选项 | 后端 + 前端 |

---

## 🚫 不包含本次优化

- **中优先级 #7**：回复功能权限过严（保持现状，只有博主可以回复）

---

## 📝 具体改动

### Task 1: 后端 - 博客详情返回作者信息

**文件**: `sc-backend/app/schemas/blog.py`

```python
class BlogResponse(BlogBase):
    """博客响应"""
    id: int
    author_id: int
    author_username: str  # 新增
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

**文件**: `sc-backend/app/routers/blogs.py`

```python
@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(blog_id: int):
    """获取博客详情"""
    with Session(engine) as session:
        blog = session.exec(
            select(Blog).where(Blog.id == blog_id, Blog.is_deleted == False)
        ).first()
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="博客不存在",
            )
        # 获取作者信息
        author = session.get(User, blog.author_id)
        return BlogResponse(
            id=blog.id,
            title=blog.title,
            subtitle=blog.subtitle,
            content=blog.content,
            category=blog.category,
            author_id=blog.author_id,
            author_username=author.username if author else "Unknown",  # 新增
            created_at=blog.created_at,
            updated_at=blog.updated_at,
        )
```

---

### Task 2: 前端 - 博客详情页改造

**文件**: `sc-frontend/src/app/blogs/[id]/page.tsx`

改动点：
1. 添加 `ReactMarkdown` 导入
2. 添加 `formatTimeAgo` 函数
3. 博客内容区域添加：分类标签、作者信息、Subtitle
4. 评论时间使用 `formatTimeAgo` 格式化
5. Markdown 内容使用 `<ReactMarkdown>` 渲染

```tsx
import ReactMarkdown from "react-markdown";

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

// 博客元信息区域
<div className="mb-4 flex items-center gap-3">
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

{/* Markdown 内容 */}
<article className="prose max-w-none">
  <ReactMarkdown>{blog.content}</ReactMarkdown>
</article>

// 评论时间使用
<span className="text-sm text-neutral-500">
  {formatTimeAgo(comment.created_at)}
</span>
```

---

### Task 3: 前端 - 博客列表页改造

**文件**: `sc-frontend/src/app/blogs/page.tsx`

改动点：
1. 添加分类筛选按钮
2. 显示博客数量

```tsx
// 添加筛选状态
const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'ALL'>('ALL');

// 筛选后的博客
const filteredBlogs = selectedCategory === 'ALL'
  ? blogs
  : blogs.filter(b => b.category === selectedCategory);

// PageHeader
<PageHeader
  title="blogs."
  description={`${filteredBlogs.length} posts · Wenmudong's thoughts and writings.`}
/>

// 筛选按钮
<div className="mb-4 flex gap-2 flex-wrap">
  <button
    onClick={() => setSelectedCategory('ALL')}
    className={`px-3 py-1 rounded text-sm ${selectedCategory === 'ALL' ? 'bg-neutral-900 text-white' : 'bg-neutral-100'}`}
  >
    All
  </button>
  {BLOG_CATEGORIES.map(cat => (
    <button
      key={cat.value}
      onClick={() => setSelectedCategory(cat.value)}
      className={`px-3 py-1 rounded text-sm ${selectedCategory === cat.value ? 'bg-neutral-900 text-white' : 'bg-neutral-100'}`}
    >
      {cat.label}
    </button>
  ))}
</div>
```

---

### Task 4: 前端 - 编辑页添加 Toast

**文件**: `sc-frontend/src/app/blogs/[id]/edit/page.tsx`

```tsx
// try 块中，更新成功后添加
try {
  await blogApi.update(token, blogId, title.trim(), subtitle.trim() || undefined, content.trim(), category);
  showToast("Blog updated successfully", "success");  // 添加这行
  router.push(`/blogs/${blogId}`);
} catch ...
```

---

### Task 5: 后端 - 添加阅读量统计

**文件**: `sc-backend/app/models/blog.py`

```python
class Blog(SQLModel, table=True):
    """博客模型"""
    # ...
    view_count: int = Field(default=0)  # 新增
```

**文件**: `sc-backend/app/routers/blogs.py`

```python
# 获取博客详情时增加阅读量
blog = session.get(Blog, blog_id)
if blog:
    blog.view_count += 1
    session.add(blog)
    session.commit()
```

**文件**: `sc-backend/app/schemas/blog.py`

```python
class BlogResponse(BlogBase):
    # ...
    view_count: int = 0  # 新增
```

**文件**: `sc-frontend/src/app/blogs/page.tsx`

```tsx
// BlogCard 中显示评论数的位置旁边添加阅读量
<span>{blog.view_count} views</span>
```

---

### Task 6: 后端 - 支持博客列表排序

**文件**: `sc-backend/app/routers/blogs.py`

```python
@router.get("", response_model=List[BlogListResponse])
def list_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("latest", regex="^(latest|comments)$"),
):
    """获取博客列表（排除已删除）"""
    with Session(engine) as session:
        query = select(Blog, User.username).join(User, Blog.author_id == User.id).where(Blog.is_deleted == False)

        if sort == "latest":
            query = query.order_by(Blog.created_at.desc())
        elif sort == "comments":
            # 按评论数排序需要子查询，暂时按 created_at 排序
            query = query.order_by(Blog.created_at.desc())

        blogs = session.exec(query.offset(skip).limit(limit)).all()
        # ...
```

---

## 📁 改动文件清单

| 文件 | 改动类型 |
|------|----------|
| `sc-backend/app/models/blog.py` | 修改 |
| `sc-backend/app/schemas/blog.py` | 修改 |
| `sc-backend/app/routers/blogs.py` | 修改 |
| `sc-frontend/src/app/blogs/page.tsx` | 修改 |
| `sc-frontend/src/app/blogs/[id]/page.tsx` | 修改 |
| `sc-frontend/src/app/blogs/[id]/edit/page.tsx` | 修改 |
| `sc-frontend/src/components/BlogCard.tsx` | 修改 |
