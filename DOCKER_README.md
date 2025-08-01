# 🐳 Docker 部署指南

本文档介绍如何使用 Docker 部署贷款管理系统。

## 📋 系统要求

- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+
- **内存**: 至少 4GB
- **磁盘空间**: 至少 10GB

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/pockspocky/loan-management-system.git
cd loan-management-system
git checkout feature/docker-deployment
```

### 2. 配置环境变量
```bash
# 复制环境配置文件
cp docker.env.example .env

# 编辑环境变量（重要！）
vim .env
```

### 3. 一键部署
```bash
# 开发模式部署
./scripts/docker-deploy.sh -d

# 生产模式部署
./scripts/docker-deploy.sh -p
```

## 🛠️ 详细配置

### 环境变量配置

编辑 `.env` 文件，配置以下重要参数：

```bash
# MongoDB 配置
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_strong_password
MONGO_DATABASE=loan_management
MONGO_USERNAME=loan_user
MONGO_PASSWORD=your_strong_password

# JWT 配置（生产环境必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS 配置
CORS_ORIGIN=http://yourdomain.com
```

### 服务架构

系统由以下服务组成：

| 服务 | 端口 | 描述 |
|------|------|------|
| **frontend** | 80, 443 | Nginx + Vue.js 前端 |
| **backend** | 8080 | Node.js + Express API |
| **mongodb** | 27017 | MongoDB 数据库 |

### 网络配置

- **网络名称**: `loan-network`
- **子网**: `172.20.0.0/16`
- **容器间通信**: 通过服务名访问

## 📦 Docker Compose 配置

### 基础服务启动
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 服务管理命令

```bash
# 重新构建并启动
docker-compose up -d --build

# 停止所有服务
docker-compose down

# 停止并清理数据卷
docker-compose down -v

# 扩展后端服务
docker-compose up -d --scale backend=3
```

## 🔧 管理脚本

### 部署脚本使用

```bash
# 查看帮助
./scripts/docker-deploy.sh -h

# 开发模式部署
./scripts/docker-deploy.sh -d

# 生产模式部署
./scripts/docker-deploy.sh -p

# 重新构建部署
./scripts/docker-deploy.sh -p -r

# 查看服务状态
./scripts/docker-deploy.sh -s

# 查看日志
./scripts/docker-deploy.sh --logs

# 停止服务
./scripts/docker-deploy.sh --stop

# 清理容器和镜像
./scripts/docker-deploy.sh -c
```

## 🏥 健康检查

### 服务健康检查端点

| 服务 | 端点 | 描述 |
|------|------|------|
| 前端 | `http://localhost/health` | 前端服务状态 |
| 后端 | `http://localhost:8080/api/v1/health` | 后端详细健康信息 |
| 后端就绪 | `http://localhost:8080/api/v1/health/ready` | 服务就绪状态 |
| 后端存活 | `http://localhost:8080/api/v1/health/live` | 服务存活状态 |

### 健康检查示例

```bash
# 检查前端状态
curl http://localhost/health

# 检查后端健康状态
curl http://localhost:8080/api/v1/health

# 使用脚本检查所有服务
./scripts/docker-deploy.sh -s
```

## 📊 监控和日志

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# 实时跟踪日志
docker-compose logs -f

# 查看最近日志
docker-compose logs --tail=100
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看服务进程
docker-compose top

# 进入容器shell
docker-compose exec backend sh
docker-compose exec mongodb mongosh
```

## 💾 数据管理

### 数据持久化

数据存储在以下 Docker 卷中：

- `mongodb_data`: MongoDB 数据文件
- `mongodb_config`: MongoDB 配置文件
- `backend_logs`: 后端日志文件
- `backend_uploads`: 文件上传存储

### 数据备份

```bash
# 备份数据库
docker-compose exec mongodb mongodump --db loan_management --out /tmp/backup
docker cp loan-mongodb:/tmp/backup ./backup

# 恢复数据库
docker cp ./backup loan-mongodb:/tmp/restore
docker-compose exec mongodb mongorestore --db loan_management /tmp/restore/loan_management
```

### 数据卷管理

```bash
# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect loan-management-system_mongodb_data

# 清理未使用的数据卷
docker volume prune
```

## 🔒 安全配置

### 生产环境安全检查

1. **修改默认密码**
   ```bash
   # 修改 .env 文件中的密码
   MONGO_ROOT_PASSWORD=your_strong_password
   MONGO_PASSWORD=your_strong_password
   JWT_SECRET=your-super-secret-jwt-key
   ```

2. **HTTPS 配置**
   ```bash
   # 在 .env 中启用 SSL
   ENABLE_SSL=true
   DOMAIN=yourdomain.com
   SSL_EMAIL=admin@yourdomain.com
   ```

3. **防火墙配置**
   ```bash
   # 只开放必要端口
   ufw allow 80
   ufw allow 443
   ufw deny 27017  # 禁止外部访问数据库
   ```

### 网络安全

- 数据库仅在内部网络访问
- API 服务通过前端代理访问
- 敏感数据通过环境变量传递

## 🚨 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep :80
   netstat -tlnp | grep :8080
   netstat -tlnp | grep :27017
   
   # 修改 docker-compose.yml 中的端口映射
   ```

2. **内存不足**
   ```bash
   # 检查内存使用
   docker stats
   
   # 调整服务资源限制
   # 在 docker-compose.yml 中添加 mem_limit
   ```

3. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # 查看数据库日志
   docker-compose logs mongodb
   ```

4. **构建失败**
   ```bash
   # 清理构建缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

### 日志分析

```bash
# 查看错误日志
docker-compose logs | grep ERROR

# 查看警告日志
docker-compose logs | grep WARN

# 导出日志到文件
docker-compose logs > logs.txt
```

## 📈 性能优化

### 生产环境优化

1. **多实例部署**
   ```bash
   # 扩展后端服务
   docker-compose up -d --scale backend=3
   ```

2. **资源限制**
   ```yaml
   # 在 docker-compose.yml 中添加
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

3. **缓存优化**
   - 启用 Nginx 缓存
   - 配置 MongoDB 索引
   - 使用 Redis 缓存（可选）

### 监控配置

```bash
# 启用监控
echo "ENABLE_MONITORING=true" >> .env
echo "MONITORING_PORT=9090" >> .env

# 重启服务
docker-compose down && docker-compose up -d
```

## 🔄 更新和维护

### 应用更新

```bash
# 拉取最新代码
git pull origin feature/docker-deployment

# 重新构建和部署
./scripts/docker-deploy.sh -p -r
```

### 数据库维护

```bash
# 数据库备份
./scripts/backup-db.sh

# 数据库优化
docker-compose exec mongodb mongosh --eval "db.runCommand({compact: 'users'})"
```

### 系统清理

```bash
# 清理未使用的资源
docker system prune -a -f

# 清理日志文件
docker-compose exec backend find /app/logs -name "*.log" -mtime +7 -delete
```

## 📞 技术支持

### 获帮助

- **GitHub Issues**: [提交问题](https://github.com/pockspocky/loan-management-system/issues)
- **文档**: 查看项目根目录下的其他文档文件
- **健康检查**: 使用 `./scripts/docker-deploy.sh -s` 检查服务状态

### 调试模式

```bash
# 启用调试模式
export DEBUG=true

# 查看详细日志
docker-compose logs -f --tail=100

# 进入容器调试
docker-compose exec backend sh
```

---

**🎉 部署完成后，访问 http://localhost 即可使用贷款管理系统！**

默认管理员账号：`admin` / `admin123`（请立即修改密码） 