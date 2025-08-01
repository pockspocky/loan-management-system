#!/bin/bash

# 🐳 Docker部署脚本
# 用于快速部署贷款管理系统

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

# 显示帮助信息
show_help() {
    echo "🐳 贷款管理系统 Docker 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -d, --dev           开发模式部署"
    echo "  -p, --prod          生产模式部署"
    echo "  -r, --rebuild       重新构建镜像"
    echo "  -c, --clean         清理容器和镜像"
    echo "  -s, --status        查看服务状态"
    echo "  --logs              查看服务日志"
    echo "  --stop              停止所有服务"
    echo ""
    echo "示例:"
    echo "  $0 -d               开发模式部署"
    echo "  $0 -p -r            生产模式重新构建部署"
    echo "  $0 --clean          清理所有容器和镜像"
}

# 检查Docker环境
check_docker() {
    log_info "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查Docker服务状态
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行，请启动Docker服务"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 检查环境配置文件
check_env_file() {
    log_info "检查环境配置文件..."
    
    if [[ ! -f .env ]]; then
        log_warning ".env文件不存在，创建默认配置..."
        cp docker.env.example .env
        log_info "请编辑.env文件配置您的环境变量"
        read -p "按回车键继续..." -r
    fi
    
    log_success "环境配置文件检查完成"
}

# 开发模式部署
deploy_dev() {
    log_info "开始开发模式部署..."
    
    if [[ $REBUILD == "true" ]]; then
        log_info "重新构建开发镜像..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    fi
    
    log_info "启动开发环境..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    log_success "开发环境部署完成！"
    show_service_info
}

# 生产模式部署
deploy_prod() {
    log_info "开始生产模式部署..."
    
    if [[ $REBUILD == "true" ]]; then
        log_info "重新构建生产镜像..."
        docker-compose down
        docker-compose build --no-cache
    fi
    
    log_info "启动生产环境..."
    docker-compose up -d --scale backend=2
    
    log_success "生产环境部署完成！"
    show_service_info
}

# 显示服务信息
show_service_info() {
    log_info "服务信息:"
    echo "=================================="
    echo "🌐 前端服务: http://localhost"
    echo "🔧 后端API: http://localhost:8080/api/v1"
    echo "🍃 MongoDB: localhost:27017"
    echo "❤️  健康检查: http://localhost:8080/api/v1/health"
    echo "=================================="
    echo ""
    
    log_info "服务状态:"
    if [[ -f docker-compose.dev.yml ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi
}

# 查看服务状态
show_status() {
    log_info "服务状态:"
    if [[ -f docker-compose.dev.yml ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
    else
        docker-compose ps
    fi
    echo ""
    
    log_info "服务健康状态:"
    if [[ -f docker-compose.dev.yml ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T backend curl -f http://localhost:8080/api/v1/health || log_warning "后端服务不健康"
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T frontend curl -f http://localhost:80/health || log_warning "前端服务不健康"
    else
        docker-compose exec -T backend curl -f http://localhost:8080/api/v1/health || log_warning "后端服务不健康"
        docker-compose exec -T frontend curl -f http://localhost:80/health || log_warning "前端服务不健康"
    fi
}

# 查看日志
show_logs() {
    log_info "显示服务日志 (按Ctrl+C退出):"
    if [[ -f docker-compose.dev.yml ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    if [[ -f docker-compose.dev.yml ]]; then
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    else
        docker-compose down
    fi
    log_success "所有服务已停止"
}

# 清理容器和镜像
clean_docker() {
    log_warning "这将删除所有相关的容器、镜像和数据卷"
    read -p "确定要继续吗? (y/N): " -r
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "停止并删除容器..."
        if [[ -f docker-compose.dev.yml ]]; then
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
        else
            docker-compose down -v --remove-orphans
        fi
        
        log_info "删除镜像..."
        docker rmi $(docker images "loan-*" -q) 2>/dev/null || true
        
        log_info "清理未使用的资源..."
        docker system prune -f
        
        log_success "清理完成"
    else
        log_info "取消清理操作"
    fi
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    
    # 等待数据库启动
    for i in {1..30}; do
        if [[ -f docker-compose.dev.yml ]]; then
            if docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
                break
            fi
        else
            if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
                break
            fi
        fi
        sleep 2
    done
    
    # 等待后端启动
    for i in {1..30}; do
        if curl -f http://localhost:8080/api/v1/health &> /dev/null; then
            break
        fi
        sleep 2
    done
    
    # 等待前端启动
    for i in {1..30}; do
        if curl -f http://localhost:80/health &> /dev/null; then
            break
        fi
        sleep 2
    done
    
    log_success "所有服务已启动"
}

# 主函数
main() {
    # 默认值
    MODE=""
    REBUILD="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dev)
                MODE="dev"
                shift
                ;;
            -p|--prod)
                MODE="prod"
                shift
                ;;
            -r|--rebuild)
                REBUILD="true"
                shift
                ;;
            -c|--clean)
                check_docker
                clean_docker
                exit 0
                ;;
            -s|--status)
                show_status
                exit 0
                ;;
            --logs)
                show_logs
                exit 0
                ;;
            --stop)
                stop_services
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定模式，显示帮助
    if [[ -z "$MODE" ]]; then
        show_help
        exit 1
    fi
    
    # 执行部署
    check_docker
    check_env_file
    
    case $MODE in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
    esac
    
    wait_for_services
    
    log_success "部署完成！🎉"
    log_info "使用以下命令管理服务:"
    echo "  查看状态: $0 -s"
    echo "  查看日志: $0 --logs"
    echo "  停止服务: $0 --stop"
}

# 执行主函数
main "$@" 