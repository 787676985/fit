#!/bin/bash

# FitPlan Pro - 部署脚本
# 支持多种部署方式

set -e

echo "=========================================="
echo "  FitPlan Pro 减肥计划App - 部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印帮助信息
print_help() {
    echo -e "${BLUE}使用方法:${NC}"
    echo "  ./deploy.sh [选项]"
    echo ""
    echo -e "${BLUE}选项:${NC}"
    echo "  docker      - Docker容器部署 (推荐)"
    echo "  build       - 仅构建生产版本"
    echo "  start       - 启动生产服务器"
    echo "  stop        - 停止服务"
    echo "  status      - 查看服务状态"
    echo "  logs        - 查看日志"
    echo "  clean       - 清理构建文件"
    echo "  help        - 显示帮助信息"
    echo ""
}

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"
    
    if command -v bun &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Bun 已安装"
    else
        echo -e "  ${RED}✗${NC} Bun 未安装，请先安装 Bun"
        exit 1
    fi
    
    if command -v docker &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Docker 已安装"
    else
        echo -e "  ${YELLOW}!${NC} Docker 未安装，Docker部署将不可用"
    fi
}

# 构建生产版本
build_production() {
    echo -e "${BLUE}构建生产版本...${NC}"
    
    # 安装依赖
    echo -e "${YELLOW}安装依赖...${NC}"
    bun install --frozen-lockfile
    
    # 构建
    echo -e "${YELLOW}编译应用...${NC}"
    bun run build
    
    echo -e "${GREEN}✓ 构建完成!${NC}"
    echo ""
    echo -e "构建产物位于: ${BLUE}.next/standalone/${NC}"
}

# Docker部署
docker_deploy() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker未安装${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}错误: Docker Compose未安装${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Docker容器部署...${NC}"
    
    # 停止旧容器
    echo -e "${YELLOW}停止旧容器...${NC}"
    docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
    
    # 构建镜像
    echo -e "${YELLOW}构建Docker镜像...${NC}"
    docker-compose build --no-cache 2>/dev/null || docker compose build --no-cache
    
    # 启动容器
    echo -e "${YELLOW}启动容器...${NC}"
    docker-compose up -d 2>/dev/null || docker compose up -d
    
    echo -e "${GREEN}✓ Docker部署完成!${NC}"
    echo ""
    echo -e "访问地址: ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo -e "查看日志: ${YELLOW}./deploy.sh logs${NC}"
    echo -e "停止服务: ${YELLOW}./deploy.sh stop${NC}"
}

# 启动生产服务器
start_server() {
    echo -e "${BLUE}启动生产服务器...${NC}"
    
    if [ ! -f ".next/standalone/server.js" ]; then
        echo -e "${RED}错误: 请先运行 ./deploy.sh build${NC}"
        exit 1
    fi
    
    # 检查端口是否被占用
    if lsof -i:3000 &> /dev/null; then
        echo -e "${YELLOW}端口3000已被占用，尝试停止...${NC}"
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # 后台启动
    nohup bun .next/standalone/server.js > server.log 2>&1 &
    
    sleep 3
    
    if lsof -i:3000 &> /dev/null; then
        echo -e "${GREEN}✓ 服务已启动!${NC}"
        echo -e "访问地址: ${BLUE}http://localhost:3000${NC}"
        echo -e "日志文件: ${YELLOW}server.log${NC}"
    else
        echo -e "${RED}✗ 启动失败，请查看 server.log${NC}"
    fi
}

# 停止服务
stop_service() {
    echo -e "${BLUE}停止服务...${NC}"
    
    # 停止Docker容器
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
    fi
    
    # 停止本地进程
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✓ 服务已停止${NC}"
}

# 查看状态
check_status() {
    echo -e "${BLUE}服务状态:${NC}"
    echo ""
    
    # 检查Docker容器
    if command -v docker &> /dev/null; then
        containers=$(docker ps --filter "name=fitplan" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null)
        if [ -n "$containers" ]; then
            echo -e "${GREEN}Docker容器:${NC}"
            echo "$containers"
            echo ""
        fi
    fi
    
    # 检查本地进程
    if lsof -i:3000 &> /dev/null; then
        echo -e "${GREEN}本地服务: 运行中${NC}"
        lsof -i:3000
    else
        echo -e "${YELLOW}本地服务: 未运行${NC}"
    fi
}

# 查看日志
view_logs() {
    echo -e "${BLUE}服务日志:${NC}"
    echo ""
    
    # Docker日志
    if docker ps --filter "name=fitplan" --format "{{.Names}}" 2>/dev/null | grep -q "fitplan"; then
        echo -e "${YELLOW}=== Docker容器日志 ===${NC}"
        docker-compose logs --tail=50 2>/dev/null || docker compose logs --tail=50
        echo ""
    fi
    
    # 本地日志
    if [ -f "server.log" ]; then
        echo -e "${YELLOW}=== 本地服务日志 ===${NC}"
        tail -50 server.log
    fi
}

# 清理构建文件
clean_build() {
    echo -e "${BLUE}清理构建文件...${NC}"
    
    rm -rf .next
    rm -rf node_modules/.cache
    rm -f server.log
    
    echo -e "${GREEN}✓ 清理完成${NC}"
}

# 主逻辑
case "$1" in
    docker)
        check_dependencies
        docker_deploy
        ;;
    build)
        check_dependencies
        build_production
        ;;
    start)
        start_server
        ;;
    stop)
        stop_service
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    clean)
        clean_build
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        print_help
        ;;
esac
