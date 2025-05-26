# 🚀 部署指南

本文档描述了如何将贷款管理系统部署到各种环境中。

## 📋 部署准备

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.0.0
- Git

### 构建项目
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌐 静态托管平台

### Netlify 部署

1. **通过 Git 自动部署**
   - 连接您的 GitHub 仓库
   - 构建命令：`npm run build`
   - 发布目录：`dist`

2. **手动部署**
   ```bash
   # 安装 Netlify CLI
   npm install -g netlify-cli
   
   # 构建项目
   npm run build
   
   # 部署
   netlify deploy --prod --dir=dist
   ```

### Vercel 部署

1. **通过 Git 自动部署**
   - 连接您的 GitHub 仓库
   - Vercel 会自动识别 Vue.js 项目配置

2. **使用 Vercel CLI**
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 部署
   vercel --prod
   ```

### GitHub Pages 部署

1. **创建部署脚本**
   ```bash
   # 在 package.json 中添加
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   
   # 安装 gh-pages
   npm install --save-dev gh-pages
   
   # 部署
   npm run deploy
   ```

2. **配置 vite.config.js**
   ```javascript
   export default defineConfig({
     // ...
     base: '/loan-management-system/', // 替换为您的仓库名
   })
   ```

## 🐳 Docker 部署

### 创建 Dockerfile
```dockerfile
# 多阶段构建
FROM node:16-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建 nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 构建和运行
```bash
# 构建镜像
docker build -t loan-management-system .

# 运行容器
docker run -d -p 80:80 loan-management-system
```

## ☁️ 云服务器部署

### Ubuntu/Debian 服务器

1. **安装依赖**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 Nginx
   sudo apt install nginx -y
   ```

2. **部署应用**
   ```bash
   # 克隆代码
   git clone https://github.com/your-username/loan-management-system.git
   cd loan-management-system
   
   # 安装依赖并构建
   npm install
   npm run build
   
   # 复制文件到 Nginx 目录
   sudo cp -r dist/* /var/www/html/
   ```

3. **配置 Nginx**
   ```bash
   # 编辑 Nginx 配置
   sudo nano /etc/nginx/sites-available/default
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **启动服务**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

## 🔒 HTTPS 配置

### 使用 Let's Encrypt
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 环境变量配置

### 生产环境变量
创建 `.env.production` 文件：
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=贷款管理系统
VITE_APP_VERSION=1.0.0
```

### 构建时注入
```bash
# 使用环境变量构建
VITE_API_BASE_URL=https://api.example.com npm run build
```

## 📊 监控和日志

### 性能监控
- 集成 Google Analytics
- 使用 Sentry 错误监控
- 配置性能监控工具

### 日志收集
```javascript
// 在 main.js 中添加错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  // 发送错误到监控服务
}
```

## 🔄 持续集成/持续部署 (CI/CD)

### GitHub Actions 示例
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除缓存：`npm clean-install`
   - 检查依赖冲突

2. **路由问题**
   - 配置服务器重写规则
   - 检查 base 配置

3. **静态资源加载失败**
   - 检查路径配置
   - 验证 CORS 设置

### 性能优化

1. **启用 Gzip 压缩**
2. **配置缓存策略**
3. **使用 CDN 加速**
4. **代码分割和懒加载**

## 📋 部署检查清单

部署前检查：
- [ ] 代码已通过所有测试
- [ ] 构建成功无错误
- [ ] 环境变量已配置
- [ ] 域名和 SSL 证书已配置
- [ ] 备份策略已制定
- [ ] 监控和日志已配置
- [ ] 性能优化已实施

---

如果您在部署过程中遇到问题，请参考 [故障排除指南](https://github.com/your-username/loan-management-system/issues) 或创建新的 issue。 