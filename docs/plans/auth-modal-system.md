# 认证弹窗系统改造方案 - 2026-04-05

## 需求概述
取消独立登录/注册页面，改用 Modal 弹窗形式。未登录用户访问受保护页面或操作时弹窗认证。

## 核心改动

```
┌─────────────────────────────────────────────────────────────┐
│  改造内容                                                     │
├─────────────────────────────────────────────────────────────┤
│  1. 创建 LoginModal 组件（登录/注册 Tab 切换）                  │
│  2. 创建 useAuthModal Hook 管理弹窗状态                        │
│  3. 修改 Navbar：未登录时点击导航项 → 弹出登录弹窗               │
│  4. 左下角 FloatingAvatar：未登录点击 → 弹出登录弹窗            │
│  5. API 拦截：401 错误 → 弹出登录弹窗                           │
│  6. 受保护页面：检查登录状态，未登录 → 弹出登录弹窗               │
└─────────────────────────────────────────────────────────────┘
```

## 弹窗样式（继承原有登录/注册页）
- 白色背景带透明度 `bg-white/70`
- 圆角 `rounded-lg`
- 边框 `border border-neutral-200`
- 阴影 `shadow-md backdrop-blur-md`
- Tab 切换：Login / Register
- 表单样式保持一致

## 弹窗触发逻辑

| 触发场景 | 条件 | 行为 |
|----------|------|------|
| 点击导航栏 | 未登录 | 弹出登录弹窗 |
| 点击 FloatingAvatar | 未登录 | 弹出登录弹窗 |
| API 返回 401 | 登录过期 | 弹出登录弹窗 |
| 访问受保护页面 | 未登录 | 弹出登录弹窗 |

## 受保护页面
- `/blogs/*`
- `/projects`
- `/hobbies`
- `/tools`
- `/profile`
- `/admin/*`

## 改动文件清单

### 新建文件
| 文件 | 说明 |
|------|------|
| sc-frontend/src/components/LoginModal.tsx | 登录/注册弹窗组件 |
| sc-frontend/src/hooks/useAuthModal.ts | 弹窗状态管理 Hook |

### 修改文件
| 文件 | 说明 |
|------|------|
| sc-frontend/src/components/Navbar.tsx | 未登录点击导航时触发弹窗 |
| sc-frontend/src/components/FloatingAvatar.tsx | 未登录点击时触发弹窗 |
| sc-frontend/src/services/api.ts | 401 错误统一处理 |
| sc-frontend/src/contexts/AuthContext.tsx | 添加弹窗触发器 |

### 删除文件
| 文件 | 说明 |
|------|------|
| sc-frontend/src/app/auth/login/page.tsx | 独立登录页 |
| sc-frontend/src/app/auth/register/page.tsx | 独立注册页 |

## 实现步骤

1. 创建 `LoginModal.tsx` 组件
2. 创建 `useAuthModal.ts` Hook
3. 修改 `AuthContext.tsx` 添加弹窗触发器
4. 修改 `api.ts` 添加 401 拦截
5. 修改 `Navbar.tsx` 添加弹窗触发
6. 修改 `FloatingAvatar.tsx` 添加弹窗触发
7. 删除 `auth/login` 和 `auth/register` 页面
