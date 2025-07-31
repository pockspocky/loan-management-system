#!/bin/bash

# 🚀 宝塔面板自动化部署脚本
# 适用于 CentOS 7+ / Ubuntu 18+ / Debian 9+

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

# 配置变量
PROJECT_NAME="loan-management-system"
PROJECT_PATH="/www/wwwroot/$PROJECT_NAME"
BACKEND_PATH="$PROJECT_PATH/backend"
FRONTEND_PATH="$PROJECT_PATH/frontend"
LOG_PATH="$BACKEND_PATH/logs"
BACKUP_PATH="/www/backup/$PROJECT_NAME"

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [[ -f /etc/redhat-release ]]; then
        OS="centos"
    elif [[ -f /etc/debian_version ]]; then
        OS="debian"
    else
        log_error "不支持的操作系统"
        exit 1
    fi
    
    log_success "操作系统: $OS"
    
    # 检查宝塔面板
    if [[ ! -f /etc/init.d/bt ]]; then
        log_error "未检测到宝塔面板，请先安装宝塔面板"
        exit 1
    fi
    
    log_success "宝塔面板已安装"
}

# 安装依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    if [[ $OS == "centos" ]]; then
        yum update -y
        yum install -y git wget curl
    else
        apt update -y
        apt install -y git wget curl
    fi
    
    log_success "系统依赖安装完成"
}

# 安装Node.js
install_nodejs() {
    log_info "检查Node.js..."
    
    if ! command -v node &> /dev/null; then
        log_info "安装Node.js..."
        
        # 使用nvm安装Node.js
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        nvm install 16
        nvm use 16
        nvm alias default 16
        
        log_success "Node.js 16 安装完成"
    else
        NODE_VERSION=$(node -v)
        log_success "Node.js 已安装: $NODE_VERSION"
    fi
}

# 安装PM2
install_pm2() {
    log_info "检查PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        log_info "安装PM2..."
        npm install -g pm2
        log_success "PM2 安装完成"
    else
        log_success "PM2 已安装"
    fi
}

# 创建项目目录
create_directories() {
    log_info "创建项目目录..."
    
    mkdir -p $PROJECT_PATH
    mkdir -p $LOG_PATH
    mkdir -p $BACKUP_PATH
    mkdir -p $BACKEND_PATH/uploads
    
    log_success "项目目录创建完成"
}

# 克隆项目
clone_project() {
    log_info "克隆项目代码..."
    
    if [[ -d "$PROJECT_PATH/.git" ]]; then
        log_info "项目已存在，更新代码..."
        cd $PROJECT_PATH
        git pull origin main
    else
        log_info "克隆新项目..."
        git clone https://github.com/pockspocky/loan-management-system.git $PROJECT_PATH
    fi
    
    log_success "项目代码获取完成"
}

# 安装项目依赖
install_project_deps() {
    log_info "安装项目依赖..."
    
    # 安装后端依赖
    cd $BACKEND_PATH
    npm install --production
    
    # 安装前端依赖
    cd $FRONTEND_PATH
    npm install --production
    
    log_success "项目依赖安装完成"
}

# 构建前端
build_frontend() {
    log_info "构建前端项目..."
    
    cd $FRONTEND_PATH
    npm run build
    
    log_success "前端构建完成"
}

# 创建环境配置
create_env_config() {
    log_info "创建环境配置文件..."
    
    cd $BACKEND_PATH
    
    if [[ ! -f .env ]]; then
        cat > .env << EOF
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/loan_management
MONGODB_URI_PROD=mongodb://localhost:27017/loan_management

# 服务器配置
PORT=8080
NODE_ENV=production

# JWT配置
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=https://yourdomain.com

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=$LOG_PATH

# 文件上传配置
UPLOAD_PATH=$BACKEND_PATH/uploads
MAX_FILE_SIZE=10485760
EOF
        log_success "环境配置文件创建完成"
    else
        log_warning "环境配置文件已存在，跳过创建"
    fi
}

# 创建PM2配置
create_pm2_config() {
    log_info "创建PM2配置文件..."
    
    cd $PROJECT_PATH
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'loan-backend',
      script: './backend/src/app.js',
      cwd: '$PROJECT_PATH',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: '$LOG_PATH/err.log',
      out_file: '$LOG_PATH/out.log',
      log_file: '$LOG_PATH/combined.log',
      time: true
    }
  ]
};
EOF
    
    log_success "PM2配置文件创建完成"
}

# 创建Nginx配置
create_nginx_config() {
    log_info "创建Nginx配置文件..."
    
    cat > /tmp/loan-nginx.conf << EOF
server {
    listen 80;
    server_name yourdomain.com;
    root $FRONTEND_PATH/dist;
    index index.html;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    log_success "Nginx配置文件创建完成"
    log_warning "请手动将配置文件添加到宝塔面板的网站配置中"
}

# 创建备份脚本
create_backup_script() {
    log_info "创建备份脚本..."
    
    cat > $BACKUP_PATH/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/www/backup/loan-management-system"
DB_NAME="loan_management"

# 创建备份
mongodump --db $DB_NAME --out $BACKUP_DIR/backup_$DATE

# 压缩备份
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# 删除未压缩的备份文件夹
rm -rf $BACKUP_DIR/backup_$DATE

# 保留最近7天的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.tar.gz"
EOF
    
    chmod +x $BACKUP_PATH/backup_db.sh
    log_success "备份脚本创建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    cd $PROJECT_PATH
    
    # 启动PM2服务
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    log_success "服务启动完成"
}

# 创建管理员用户
create_admin_user() {
    log_info "创建管理员用户..."
    
    # 等待服务启动
    sleep 5
    
    # 创建管理员用户
    curl -X POST http://localhost:8080/api/v1/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "username": "admin",
            "password": "admin123",
            "role": "admin"
        }' || log_warning "创建管理员用户失败，请手动创建"
    
    log_success "管理员用户创建完成"
    log_info "默认管理员账号: admin / admin123"
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo
    echo "=========================================="
    echo "🚀 贷款管理系统部署信息"
    echo "=========================================="
    echo "项目路径: $PROJECT_PATH"
    echo "后端端口: 8080"
    echo "前端路径: $FRONTEND_PATH/dist"
    echo "日志路径: $LOG_PATH"
    echo "备份路径: $BACKUP_PATH"
    echo
    echo "📋 后续步骤:"
    echo "1. 在宝塔面板中创建网站"
    echo "2. 配置域名和SSL证书"
    echo "3. 将Nginx配置添加到网站配置中"
    echo "4. 修改.env文件中的域名配置"
    echo "5. 重启服务: pm2 restart loan-backend"
    echo
    echo "🔧 常用命令:"
    echo "查看服务状态: pm2 status"
    echo "查看日志: pm2 logs loan-backend"
    echo "重启服务: pm2 restart loan-backend"
    echo "停止服务: pm2 stop loan-backend"
    echo
    echo "📞 技术支持: 如有问题请查看日志文件"
    echo "=========================================="
}

# 主函数
main() {
    echo "🚀 开始部署贷款管理系统到宝塔面板..."
    echo
    
    check_root
    check_system
    install_dependencies
    install_nodejs
    install_pm2
    create_directories
    clone_project
    install_project_deps
    build_frontend
    create_env_config
    create_pm2_config
    create_nginx_config
    create_backup_script
    start_services
    create_admin_user
    show_deployment_info
}

# 执行主函数
main "$@" 