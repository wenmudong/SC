# TDD 测试架构搭建计划

## 目标

为后端项目搭建 TDD 测试基础结构，后续开发新接口时遵循红→绿→重构流程。

## 改动范围

- 新增 `tests/` 测试目录
- 修改 `pyproject.toml` 添加测试依赖
- 修改 `sc-backend/CLAUDE.md` 补充 TDD 流程

## 文件清单

```
sc-backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # pytest fixtures
│   ├── routers/
│   │   ├── __init__.py
│   │   └── test_health.py        # 健康检查测试（练手）
│   └── utils.py                  # 测试辅助函数
├── pyproject.toml                # 添加测试依赖
└── sc-backend/CLAUDE.md           # 补充 TDD 开发流程
```

## 执行步骤

1. 安装测试依赖：`uv add pytest pytest-asyncio httpx --dev`
2. 创建 `tests/` 目录结构
3. 编写 `conftest.py` 基础 fixtures
4. 编写 `test_health.py` 练手
5. 更新 `CLAUDE.md` 补充 TDD 流程

## TDD 流程

```
红(Red)     → 先写测试，预期接口行为
绿(Green)   → 写最小代码让测试通过
重构(Refactor) → 清理代码，保持测试通过
```

## 测试内容

| 测试类型 | 覆盖内容 |
|---------|---------|
| 路由测试 | 接口返回状态码、响应结构 |
| 认证测试 | Token 有效性、无权限访问 |
| 业务逻辑 | 博客创建/删除/查询 |
| 边界情况 | 空输入、重复数据、超长内容 |

## 数据库测试策略

- 测试用独立 DB：每个测试用例用临时 SQLite 文件，测试结束删除
- 或用 `:memory:` 内存数据库，速度更快
