# 前端优化方案

## Context

前端代码检查后发现以下问题需要优化：
1. Comment 类型缺少 `is_deleted` 字段（后端已添加，前端未同步）
2. 缺少 ErrorBoundary 组件，组件出错可能导致整页崩溃

---

## 改动范围

### 1. 同步 Comment 类型
- **文件**: `sc-frontend/src/types/index.ts`
- **改动**: 在 `Comment` 接口添加 `is_deleted: boolean` 字段

### 2. 添加 ErrorBoundary 组件
- **文件**: `sc-frontend/src/components/ErrorBoundary.tsx`（新增）
- **功能**:
  - 捕获子组件渲染错误
  - 显示友好的错误提示，而不是整页崩溃
  - 提供"重试"按钮

### 3. 应用 ErrorBoundary 到全局
- **文件**: `sc-frontend/src/app/layout.tsx`
- **改动**: 在 RootLayout 中使用 ErrorBoundary 包裹 children

---

## 文件清单

| 文件 | 操作 |
|------|------|
| `sc-frontend/src/types/index.ts` | 修改 |
| `sc-frontend/src/components/ErrorBoundary.tsx` | 新增 |
| `sc-frontend/src/app/layout.tsx` | 修改 |

---

## 验证方式

1. 运行 `npm run build` 确保类型检查通过
2. 运行 `npm run dev` 启动开发服务器
3. 访问 http://localhost:3000 确认首页正常渲染
