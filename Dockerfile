# FitPlan Pro - 最稳定版本
# 使用npm，兼容性最好

FROM node:20-alpine

WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖并构建
RUN npm install && npm run build

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# 启动
CMD ["node", ".next/standalone/server.js"]
