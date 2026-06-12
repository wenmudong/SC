# SuperCenter 部署文档

## 架构概览

```
浏览器 → :80 (Nginx)
              ├─ /           → frontend:3000  (Next.js standalone)
              ├─ /api/*      → backend:8000   (FastAPI + uvicorn)
              └─ /uploads/*  → backend:8000   (静态文件)
```

---

## Docker部署

### 本地测试

1. 克隆代码：
   ```bash
   git clone -b main <repo-url>
   cd supercenter
   ```

2. 构建并启动：
   ```bash
   docker-compose up -d --build
   ```

3. 访问应用：
   - 前端：http://localhost
   - 后端API：http://localhost/api/health

4. 查看日志：
   ```bash
   docker-compose logs -f
   ```

### 云服务器部署

1. 上传代码到服务器：
   ```bash
   scp -r . user@server:/opt/supercenter
   ```

2. 在服务器上构建：
   ```bash
   cd /opt/supercenter
   docker-compose up -d --build
   ```

3. 设置开机自启动：
   ```bash
   sudo systemctl enable docker
   ```

### 数据管理

- 数据库文件：`docker-data/database/`
- 上传文件：`docker-data/uploads/`

### 资源限制

- 后端：512MB内存，0.5核CPU
- 前端：512MB内存，0.5核CPU
- Nginx：256MB内存，0.25核CPU

---

## 一、服务器基础配置

SSH 登录后，先做系统更新和基础工具安装：

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装常用工具
sudo apt install -y curl git vim ufw
```

## 二、安装 Docker + Docker Compose

```bash
# 安装 Docker（官方一键脚本）
curl -fsSL https://get.docker.com | sudo sh

# 将当前用户加入 docker 组（免 sudo 运行 docker 命令）
sudo usermod -aG docker $USER

# 安装 docker compose 插件（新版 Docker 自带）
sudo apt install -y docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

> 加入 docker 组后需要**重新 SSH 登录**才生效，退出重连一下。

## 三、Docker 基本概念

| 概念 | 类比 | 说明 |
|------|------|------|
| **镜像 (Image)** | 安装包 | 预打包好的运行环境，如 `python:3.11-slim` |
| **容器 (Container)** | 运行中的程序 | 镜像跑起来就是容器 |
| **Dockerfile** | 安装说明书 | 告诉 Docker 怎么构建镜像 |
| **docker-compose.yml** | 一键启动脚本 | 定义多个容器怎么协作 |
| **Volume** | 外接硬盘 | 把数据存到容器外面，防止容器重建丢数据 |

## 四、部署流程

### 1. 把代码弄到服务器上

```bash
# 方式一：git clone（推荐）
cd /home/ubuntu
git clone <你的仓库地址> SuperCenter
cd SuperCenter

# 方式二：scp 上传（如果仓库是私有的）
# 在你本地电脑执行：
# scp -r D:\_My_Git_Projects\SuperCenter ubuntu@服务器IP:/home/ubuntu/
```

### 2. 配置环境变量

```bash
# 复制模板
cp .env.example .env

# 生成一个安全的密钥并写入 .env
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$(openssl rand -hex 32)/" .env

# 设置 CORS（你的服务器 IP）
sed -i "s/ALLOWED_ORIGINS=.*/ALLOWED_ORIGINS=http:\/\/你的服务器IP/" .env

# 检查一下
cat .env
```

### 3. 构建并启动

```bash
# 构建镜像（首次较慢，后续有缓存会快很多）
docker compose build

# 启动所有服务（后台运行）
docker compose up -d
```

### 4. 检查是否正常

```bash
# 查看三个容器的运行状态
docker compose ps

# 应该看到三个容器都是 running 状态：
# nginx    running
# frontend running
# backend  running

# 查看后端日志（看有没有报错）
docker compose logs backend

# 查看前端日志
docker compose logs frontend

# 查看 nginx 日志
docker compose logs nginx
```

### 5. 访问测试

在浏览器打开 `http://你的服务器IP/`，应该能看到前端页面。

## 五、常用 Docker 命令速查

```bash
# === 日常运维 ===
docker compose up -d          # 启动（后台）
docker compose down            # 停止并删除容器
docker compose restart          # 重启所有容器
docker compose ps              # 查看运行状态

# === 查看日志 ===
docker compose logs -f          # 实时查看所有日志（Ctrl+C 退出）
docker compose logs -f backend  # 实时查看后端日志
docker compose logs --tail 50   # 查看最近 50 行日志

# === 进入容器调试 ===
docker compose exec backend bash   # 进入后端容器的终端
docker compose exec frontend sh    # 进入前端容器的终端

# === 重新构建 ===
docker compose build            # 重新构建镜像（代码改了之后）
docker compose up -d            # 重建并重启

# === 停止 ===
docker compose stop             # 停止但不删除容器（数据保留）
docker compose down             # 停止并删除容器（数据保留，因为挂载了 volume）
```

## 六、2核2G 服务器优化

### Swap 分区（防止内存不够时被 OOM kill）

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 资源分配预估

| 组件 | 内存占用 |
|------|---------|
| Nginx | ~10MB |
| 前端 (Node.js) | ~150MB |
| 后端 (Python) | ~200MB |
| 系统 + 其他 | ~500MB |
| **总计** | **~860MB** |

2G 内存绑绑有余。

## 七、防火墙配置

```bash
# 开放 HTTP 端口
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp    # SSH 别忘了
sudo ufw enable
sudo ufw status
```

## 八、更新部署

### 全量更新（推荐）

代码更新后重新构建所有服务：

```bash
cd /home/ubuntu/SuperCenter

# 拉取最新代码
git pull

# 停止容器
docker compose down

# 重新构建并启动
docker compose up -d --build
```

### 单服务更新

如果只修改了某个服务的代码，可以只重建该服务：

```bash
# 只更新前端
docker compose up -d --build frontend

# 只更新后端
docker compose up -d --build backend

# 只更新Nginx配置
docker compose up -d --build nginx
```

### 查看更新效果

```bash
# 查看容器状态
docker compose ps

# 查看日志确认启动成功
docker compose logs --tail 20
```

## 九、数据持久化

以下数据挂载在宿主机上，容器重建不会丢失：

| 容器内路径 | 宿主机路径 | 说明 |
|-----------|-----------|------|
| `/app/data/` | `./data/` | SQLite 数据库文件 |
| `/app/public/uploads/` | `./uploads/` | 上传的文件 |

### 数据库备份

```bash
# 备份 SQLite 数据库
cp ./data/supercenter.db ./data/supercenter.db.bak.$(date +%Y%m%d)
```
