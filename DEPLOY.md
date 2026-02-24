# FitPlan Pro - 部署指南

## 📦 部署方式

### 方式一：Docker部署（推荐）

Docker部署是最简单、最可靠的方式，适合生产环境。

#### 前置要求
- Docker 20.10+
- Docker Compose 2.0+

#### 部署步骤

```bash
# 1. 进入项目目录
cd /home/z/my-project

# 2. 构建并启动容器
docker-compose up -d

# 或者使用docker compose（新版命令）
docker compose up -d

# 3. 查看运行状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f
```

#### 访问地址
- HTTP: http://localhost:3000

#### 停止服务
```bash
docker-compose down
```

---

### 方式二：本地生产部署

适合没有Docker的环境，直接在服务器上运行。

#### 前置要求
- Bun 1.0+ 或 Node.js 18+

#### 部署步骤

```bash
# 1. 进入项目目录
cd /home/z/my-project

# 2. 安装依赖
bun install

# 3. 构建生产版本
bun run build

# 4. 启动生产服务器
bun run start
```

#### 后台运行（使用PM2）

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start .next/standalone/server.js --name fitplan

# 查看状态
pm2 status

# 查看日志
pm2 logs fitplan

# 设置开机自启
pm2 startup
pm2 save
```

---

### 方式三：Vercel一键部署

适合快速部署，无需服务器。

#### 步骤

1. 将代码推送到GitHub
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 导入GitHub仓库
5. 点击 "Deploy"

---

## 🔧 配置说明

### 环境变量

创建 `.env` 文件配置环境变量：

```env
# 服务端口
PORT=3000

# 环境
NODE_ENV=production
```

### 端口修改

**Docker方式：**
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:3000"  # 改为8080端口
```

**本地方式：**
```bash
PORT=8080 bun .next/standalone/server.js
```

---

## 🌐 Nginx反向代理（生产环境推荐）

### 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用HTTPS（Let's Encrypt）

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 性能优化

### 1. 启用Gzip压缩
Nginx配置已包含Gzip压缩设置。

### 2. 静态资源缓存
静态资源已配置365天缓存。

### 3. 内存优化
```bash
# 设置Node内存限制
NODE_OPTIONS="--max-old-space-size=1024" bun .next/standalone/server.js
```

---

## 🔍 故障排查

### 端口被占用
```bash
# 查看端口占用
lsof -i:3000

# 终止进程
kill -9 <PID>
```

### 查看日志
```bash
# Docker日志
docker-compose logs -f

# 本地日志
tail -f server.log
```

### 重新构建
```bash
# 清理并重新构建
rm -rf .next
bun run build
```

---

## 📱 访问测试

部署完成后，访问以下地址测试：

- 首页: http://localhost:3000
- 健康检查: http://localhost:3000/api

---

## 🆘 常见问题

**Q: Docker构建失败？**
A: 确保Docker有足够的内存（建议4GB+）

**Q: 页面加载慢？**
A: 检查服务器带宽，考虑使用CDN

**Q: 如何更新？**
A: 拉取最新代码后重新构建部署

---

## 📞 技术支持

如有问题，请查看日志文件或联系技术支持。
