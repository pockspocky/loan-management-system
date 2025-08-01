#!/bin/bash

# 本地开发环境启动脚本
# 不使用Docker，直接在本地运行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    # 检查MongoDB
    if ! command -v mongod &> /dev/null; then
        log_warning "MongoDB未安装，将使用Docker运行MongoDB"
        USE_DOCKER_MONGO=true
    else
        USE_DOCKER_MONGO=false
    fi
    
    log_success "依赖检查完成"
}

# 启动MongoDB
start_mongodb() {
    if [[ "$USE_DOCKER_MONGO" == "true" ]]; then
        log_info "使用Docker启动MongoDB..."
        docker run -d \
            --name loan-mongodb-local \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
            -e MONGO_INITDB_DATABASE=loan_management \
            -v mongodb_data:/data/db \
            mongo:6.0
        
        # 等待MongoDB启动
        log_info "等待MongoDB启动..."
        sleep 10
        
        # 初始化数据库
        log_info "初始化数据库..."
        docker exec loan-mongodb-local mongosh --eval "
            db = db.getSiblingDB('loan_management');
            db.createUser({
                user: 'loan_user',
                pwd: 'loan123456',
                roles: [{ role: 'readWrite', db: 'loan_management' }]
            });
            db.users.insertOne({
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        "
    else
        log_info "启动本地MongoDB服务..."
        # 这里可以添加启动本地MongoDB的命令
        log_warning "请确保本地MongoDB服务正在运行"
    fi
}

# 安装后端依赖
install_backend_deps() {
    log_info "安装后端依赖..."
    cd backend
    
    # 清除可能的代理设置
    npm config delete proxy 2>/dev/null || true
    npm config delete https-proxy 2>/dev/null || true
    npm config set registry https://registry.npmmirror.com/
    
    npm install
    cd ..
    log_success "后端依赖安装完成"
}

# 安装前端依赖
install_frontend_deps() {
    log_info "安装前端依赖..."
    cd frontend
    
    # 清除可能的代理设置
    npm config delete proxy 2>/dev/null || true
    npm config delete https-proxy 2>/dev/null || true
    npm config set registry https://registry.npmmirror.com/
    
    npm install
    cd ..
    log_success "前端依赖安装完成"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    cd backend
    
    # 设置环境变量
    export NODE_ENV=development
    export PORT=8080
    export MONGODB_URI=mongodb://loan_user:loan123456@localhost:27017/loan_management?authSource=loan_management
    export JWT_SECRET=dev-jwt-secret-key
    export JWT_EXPIRES_IN=7d
    export CORS_ORIGIN=http://localhost:5173
    export LOG_LEVEL=debug
    export UPLOAD_PATH=./uploads
    export MAX_FILE_SIZE=10485760
    
    # 启动后端
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    log_success "后端服务已启动 (PID: $BACKEND_PID)"
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    cd frontend
    
    # 启动前端开发服务器
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_success "前端服务已启动 (PID: $FRONTEND_PID)"
}

# 显示服务信息
show_info() {
    echo ""
    log_info "服务信息:"
    echo "=================================="
    echo "🌐 前端服务: http://localhost:5173"
    echo "🔧 后端API: http://localhost:8080/api/v1"
    echo "🍃 MongoDB: localhost:27017"
    echo "❤️  健康检查: http://localhost:8080/api/v1/health"
    echo "=================================="
    echo ""
    echo "默认管理员账户:"
    echo "用户名: admin"
    echo "密码: admin123"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
}

# 清理函数
cleanup() {
    log_info "正在停止服务..."
    
    # 停止后端
    if [[ -n "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null || true
        log_info "后端服务已停止"
    fi
    
    # 停止前端
    if [[ -n "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log_info "前端服务已停止"
    fi
    
    # 停止MongoDB容器
    if [[ "$USE_DOCKER_MONGO" == "true" ]]; then
        docker stop loan-mongodb-local 2>/dev/null || true
        log_info "MongoDB容器已停止"
    fi
    
    log_success "所有服务已停止"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主函数
main() {
    log_info "启动本地开发环境..."
    
    # 检查依赖
    check_dependencies
    
    # 启动MongoDB
    start_mongodb
    
    # 安装依赖
    install_backend_deps
    install_frontend_deps
    
    # 启动服务
    start_backend
    sleep 3
    start_frontend
    
    # 显示信息
    show_info
    
    # 等待
    wait
}

# 运行主函数
main "$@" 