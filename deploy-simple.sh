#!/bin/bash

# FitPlan Pro - 一键部署脚本（无需Docker）
# 适用于任何Linux服务器

set -e

echo "=========================================="
echo "  FitPlan Pro 一键部署"
echo "=========================================="

# 检查是否已安装bun
if ! command -v bun &> /dev/null; then
    echo "安装 Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# 克隆或更新代码
if [ -d "fit" ]; then
    echo "更新代码..."
    cd fit && git pull
else
    echo "克隆代码..."
    git clone https://github.com/787676985/fit.git
    cd fit
fi

# 安装依赖
echo "安装依赖..."
bun install

# 构建
echo "构建项目..."
bun run build

# 停止旧进程
echo "停止旧服务..."
pkill -f "server.js" 2>/dev/null || true
sleep 2

# 启动服务（后台运行）
echo "启动服务..."
nohup bun .next/standalone/server.js > app.log 2>&1 &

sleep 3

# 检查是否启动成功
if curl -s http://localhost:3000 > /dev/null; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "访问地址: http://localhost:3000"
    echo "日志文件: $(pwd)/app.log"
    echo ""
    echo "查看日志: tail -f app.log"
    echo "停止服务: pkill -f server.js"
else
    echo "❌ 启动失败，请查看日志: cat app.log"
fi
