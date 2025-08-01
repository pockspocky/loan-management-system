# 使用Node.js 16官方镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 清除可能的代理设置
ENV HTTP_PROXY=
ENV HTTPS_PROXY=
ENV http_proxy=
ENV https_proxy=
ENV NO_PROXY=*
ENV no_proxy=*

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 清除npm代理配置并安装依赖
RUN npm config delete proxy && \
    npm config delete https-proxy && \
    npm config set registry https://registry.npmmirror.com/ && \
    npm ci --only=production && \
    npm cache clean --force

# 复制源代码
COPY . .

# 创建必要的目录并设置权限
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

# 暴露端口
EXPOSE 8080

# 切换到非root用户
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

# 启动应用
CMD ["npm", "start"] 