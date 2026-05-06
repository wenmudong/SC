# 管理员配置系统方案

## 目标

实现管理员后台配置系统，支持：
1. 系统级配置（字体、背景色、导航栏样式等）
2. 页面布局配置（每个页面的模块顺序、显隐、样式等）

所有配置存储在数据库中，实时生效，重启服务不丢失。

---

## 数据库模型设计

### SystemConfig 表 - 系统级配置 ✅ 已实现

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| key | str | 配置键名，唯一索引 |
| value | str | 配置值（JSON 字符串） |
| description | str | 配置描述（可选） |
| updated_at | datetime | 更新时间 |

### PageLayout 表 - 页面布局配置 ⏳ 待实现

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| page_path | str | 页面路径，如 `/`, `/blogs`, `/projects` |
| layout_config | str | 布局配置（JSON） |
| updated_at | datetime | 更新时间 |

---

## 配置项设计

### 系统级配置 (SystemConfig) ✅ 已实现

| key | value 示例 | 说明 |
|-----|------------|------|
| `global_font` | `"FusionPixel"` | 全局字体 |
| `background_color` | `"#ffffff"` | 背景色 |
| `navbar_style` | `"transparent"` | 导航栏样式 |
| `page_layout` | `"grid"` | 默认页面布局 |
| `site_title` | `"Wenmudong"` | 网站标题 |
| `site_description` | `"Personal website"` | 网站描述 |

### 页面布局配置 (PageLayout) ⏳ 待实现

```json
{
  "page_path": "/blogs",
  "modules": [
    {
      "id": "header",
      "visible": true,
      "order": 1,
      "config": { "title": "blogs.", "description": "我的博客" }
    },
    {
      "id": "filter",
      "visible": true,
      "order": 2
    },
    {
      "id": "blog-list",
      "visible": true,
      "order": 3,
      "config": { "columns": 3 }
    }
  ]
}
```

---

## API 设计

### 系统配置 ✅ 已实现

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/config` | 获取所有系统配置 |
| GET | `/api/admin/config/{key}` | 获取单个配置 |
| POST | `/api/admin/config` | 创建配置 |
| PUT | `/api/admin/config/{key}` | 更新单个配置 |
| DELETE | `/api/admin/config/{key}` | 删除配置 |

### 页面布局 ⏳ 待实现

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/page-layout/{page_path}` | 获取页面布局 |
| PUT | `/api/page-layout/{page_path}` | 更新页面布局 |
| GET | `/api/page-layout` | 获取所有页面布局 |

---

## 前端设计

### 1. 管理员视图 ⏳ 待实现

管理员登录后，每个页面显示**布局编辑面板**：
- 拖拽调整模块顺序
- 显示/隐藏模块
- 配置模块参数
- 实时预览效果

### 2. 左下角头像右键菜单 ✅ 已实现

在 `FloatingAvatar` 组件中：
- 检测用户 `role === "admin"`
- 右键菜单显示「系统配置」入口

### 3. 系统配置页面 ✅ 已实现

路由：`/admin/config`

配置项：
| 配置项 | 类型 | 说明 |
|--------|------|------|
| 全局字体 | select | 像素字体 / 系统字体 |
| 背景色 | color picker | 主题色 |
| 导航栏样式 | select | 固定/透明/毛玻璃 |
| 网站标题 | input | 站点名称 |
| 网站描述 | textarea | 站点描述 |

### 4. 全局配置 Context ✅ 已实现

```tsx
interface SystemConfig {
  globalFont: string;
  backgroundColor: string;
  navbarStyle: string;
  siteTitle: string;
  siteDescription: string;
}

// 页面组件读取配置并应用
const { config } = useSystemConfig();
<div style={{ fontFamily: config.globalFont }}>...</div>
```

---

## 改动文件清单

### 后端 (sc-backend/) ✅ 已完成

| 文件 | 状态 |
|------|------|
| `app/models/system.py` | ✅ 已创建 |
| `app/schemas/system.py` | ✅ 已创建 |
| `app/routers/admin.py` | ✅ 已创建 |
| `app/models/page_layout.py` | ⏳ 待创建 |
| `app/routers/page_layout.py` | ⏳ 待创建 |
| `app/main.py` | ✅ 已更新（注册 admin_router） |
| `app/models/__init__.py` | ✅ 已更新 |

### 前端 (sc-frontend/) ✅ 已完成

| 文件 | 状态 |
|------|------|
| `src/app/admin/config/page.tsx` | ✅ 已创建 |
| `src/components/FloatingAvatar.tsx` | ✅ 已更新 |
| `src/contexts/SystemConfigContext.tsx` | ✅ 已创建 |
| `src/components/LayoutEditor.tsx` | ⏳ 待创建 |
| `src/app/layout.tsx` | ⏳ 待更新 |
| `src/services/api.ts` | ✅ 已更新（新增 adminApi） |
| `src/types/index.ts` | ✅ 已更新（新增 SystemConfig 类型） |
| `src/components/Providers.tsx` | ✅ 已更新 |

---

## 工作流程

### 管理员配置流程 ✅ 已实现

```
1. 管理员右键头像 → 点击「系统配置」
      ↓
2. 进入 /admin/config 页面
      ↓
3. 修改配置（如字体、背景色）
      ↓
4. 点击保存
      ↓
5. 前端调用 PUT /api/admin/config/{key}
      ↓
6. 后端更新数据库
      ↓
7. 前端实时应用新配置
```

### 页面布局配置流程 ⏳ 待实现

```
1. 管理员在任意页面
      ↓
2. 点击「编辑布局」按钮
      ↓
3. 出现布局编辑面板
      ↓
4. 拖拽/配置模块
      ↓
5. 点击保存
      ↓
6. 前端调用 PUT /api/page-layout/{page_path}
      ↓
7. 普通用户访问时自动应用新布局
```

---

## 实现状态

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | 系统配置基础（SystemConfig 模型 + API + 前端 Context） | ✅ 已完成 |
| Phase 2 | 系统配置页面（/admin/config） | ✅ 已完成 |
| Phase 3 | FloatingAvatar 右键菜单 | ✅ 已完成 |
| Phase 4 | 页面布局配置（PageLayout 模型 + API） | ⏳ 待实现 |
| Phase 5 | 布局编辑面板 | ⏳ 待实现 |

---

## 备注

- Phase 4 & 5 需等前端页面组件化完成后实现
- 当前配置保存在 SQLite 数据库，重启服务不丢失
- 后端 API 测试通过，可正常使用
