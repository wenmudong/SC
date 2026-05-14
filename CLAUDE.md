# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 相关文档

- 项目总览：`docs/SPEC.md`
- 后端开发规范：`docs/BACKEND_DEV.md`（含代码规范、模型规范、路由规范等）
- 前端开发规范：`docs/FRONTEND_DEV.md`（含 Next.js App Router、TypeScript、Tailwind CSS 等）
- 后端开发规则：`sc-backend/CLAUDE.md`（后端开发规范 + TDD 流程）
- 前端开发规则：`sc-frontend/CLAUDE.md`（Next.js App Router 说明）

## 工作规范

### 一、基础规范

1. **【固定格式】** 全部使用中文回复；回复以「wenmudong大大」开头，结尾加「~喵~」
2. **【强制使用Superpowers skill】** 优先使用Superpowers；强制采用TDD策略
3. **【强制使用子agent模式执行可并行处理的任务】** 拿到任务，先识别是否可并行处理，可并行处理的任务强制使用"子agent模式"

### 二、需求阶段

1. **【任务流程】** 明确目标 → 建立计划 → 保存到 `docs/plans/{YYYY-MM-DD}/{HHMMSS}_{计划名}.md` → 获得批准 → 执行 → 检验是否完整
2. **【需求澄清】** 需求不清先提问澄清，避免做无效工作
3. **【任务拆分】** 涉及多模块时，拆成小任务，每任务有明确交付物

### 三、方案阶段

5. **【方案先行】** 写代码前先出方案，获批后再动手。方案包含：改动范围、文件清单、图/文/表说明，保存到 `docs/plans/YYYY-MM-DD/`

### 四、执行阶段

6. **【平台专注】** 不写兼容性代码，仅支持目标平台
7. **【Bug处理】** 最小化重现步骤 → 锁定问题 → 修复
8. **【代码注释】** 中文注释，关键逻辑说明"为什么这样做"

### 五、交付阶段

9. **【架构变更】** 更新 `docs/SPEC.md` 和 `CLAUDE.md`
10. **【提交检查】** 代码可运行 + 文档已同步 + 无调试代码

### 六、反思机制

11. **【复盘】** 每次纠正后反思，记录错误模式和预防措施；Task完成后检查是否需更新相关文档

## 项目概述

SuperCenter 个人网站，前后端分离架构。

- **后端**：`sc-backend/` — FastAPI + SQLModel + SQLite
- **前端**：`sc-frontend/` — Next.js (App Router) + TypeScript + Tailwind CSS
