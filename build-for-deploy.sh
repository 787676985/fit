#!/bin/bash

# FitPlan Pro - 构建并准备部署文件
# 运行此脚本后，直接push到GitHub，Docker部署将秒级完成

set -e

echo "=========================================="
echo "  FitPlan Pro - 构建部署包"
echo "=========================================="

# 1. 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    bun install
fi

# 2. 构建项目
echo "构建项目..."
bun run build

# 3. 准备部署文件
echo "准备部署文件..."
rm -rf standalone static public_backup
cp -r .next/standalone ./standalone
cp -r .next/static ./static
cp -r public ./public_backup

# 4. 创建.dockerignore（排除不需要的文件）
cat > .dockerignore << 'EOF'
node_modules
.next
src
.git
*.log
.env*
bun.lockb
package.json
tsconfig.json
next.config.ts
EOF

echo ""
echo "✅ 构建完成！"
echo ""
echo "下一步："
echo "  git add -A"
echo "  git commit -m 'build: 更新部署包'"
echo "  git push"
echo ""
echo "然后在服务器上执行："
echo "  docker compose down"
echo "  git pull"
echo "  docker compose up -d --build"
echo ""
