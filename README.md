# 现代化贷款管理系统 - 前后端集成项目

这是一个现代化的贷款管理系统，采用前后端分离架构。

## 项目结构

```
loan-management-system-monorepo/
├── frontend/                    # 前端项目 (Vue 3 + Vite)
│   ├── src/                    # 前端源代码
│   ├── public/                 # 静态资源
│   ├── dist/                   # 构建输出
│   ├── package.json            # 前端依赖配置
│   ├── vite.config.js          # Vite 配置
│   └── index.html              # 入口HTML
├── backend/                     # 后端项目 (Node.js + Express + MongoDB)
│   ├── src/                    # 后端源代码
│   ├── scripts/                # 启动和种子脚本
│   ├── package.json            # 后端依赖配置
│   └── README.md               # 后端项目说明
├── docs/                       # 项目文档
├── package.json                # 根项目配置
├── .gitignore                  # Git 忽略规则
└── README.md                   # 项目说明
```

## 快速开始

### 📋 首次设置 (重要!)

在首次运行项目之前，您需要进行以下设置：

#### 1. 安装依赖

```bash
# 安装根项目依赖
npm install

# 安装所有子项目依赖
npm run install:all

# 或单独安装
npm run frontend:install
npm run backend:install
```

#### 2. 后端环境配置

**创建环境变量文件：**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
```

**编辑 `backend/.env` 文件，配置以下关键参数：**

```env
# 数据库配置 (必须)
MONGODB_URI=mongodb://localhost:27017/loan_management

# JWT密钥 (必须 - 请更改为强密码)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# 服务器端口
PORT=8080

# 其他配置保持默认值即可
```

#### 3. 数据库设置

**安装并启动 MongoDB：**
```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS (使用 Homebrew)
brew install mongodb-community

# 启动 MongoDB 服务
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**初始化数据库和管理员账户：**
```bash
# 方法1: 使用后端种子脚本 (推荐)
cd backend && npm run seed

# 方法2: 手动运行脚本
node backend/scripts/seed.js
```

默认管理员账户：
- 用户名: `admin`
- 密码: `admin123456`  
- 邮箱: `admin@example.com`

#### 4. 验证设置

```bash
# 测试后端连接
curl http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'

# 应该返回包含 token 的 JSON 响应
```

### 🚀 开发模式

**首次运行后，日常开发使用：**

```bash
# 同时启动前后端开发服务器 (推荐)
npm run dev

# 或单独启动
npm run frontend:dev    # 启动前端开发服务器 (端口: 5173)  
npm run backend:dev     # 启动后端开发服务器 (端口: 8080)
```

**访问应用：**
- 前端界面: http://localhost:5173
- 后端API: http://localhost:8080
- API代理: 前端自动代理 `/api` 到后端服务

### 构建项目

```bash
# 构建所有项目
npm run build:all

# 或单独构建
npm run frontend:build
npm run backend:build
```

## 技术栈

### 前端
- Vue 3
- Vite
- Axios
- Decimal.js

### 后端
- Node.js
- Express.js
- MongoDB
- JWT 认证
- Joi 数据验证

## 开发说明

1. 前端项目位于 `frontend/` 目录
2. 后端项目位于 `backend/` 目录
3. 使用 npm workspaces 管理多包项目
4. 使用 concurrently 同时运行前后端服务
5. 后端已完全集成，包含完整的API和数据库模型

## API 代理配置

前端开发服务器已配置API代理:
- 代理路径: `/api`
- 目标服务器: `https://zlyoszudwbcc.sealoshzh.site`

## ❓ 常见问题

### Q: 首次运行时遇到数据库连接错误
**A:** 请确保：
1. MongoDB 服务正在运行
2. `backend/.env` 文件中的 `MONGODB_URI` 配置正确
3. 数据库连接地址可访问

### Q: JWT token 错误或认证失败
**A:** 请检查：
1. `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 是否已配置
2. 密钥长度建议至少32个字符
3. 重新启动后端服务

### Q: 文件上传失败
**A:** 检查：
1. `backend/uploads` 目录是否存在且有写权限
2. `MAX_FILE_SIZE` 配置是否合理
3. 磁盘空间是否充足

### Q: 前端无法连接到后端API
**A:** 验证：
1. 后端服务是否在 8080 端口运行
2. 前端代理配置是否正确
3. CORS 设置是否允许前端域名

## 📝 开发备忘

- **默认管理员账户**: admin / admin123456
- **前端端口**: 5173
- **后端端口**: 8080  
- **数据库**: MongoDB (默认: loan_management)
- **API前缀**: `/api/v1/`

## 部署

详细部署说明请参考 `docs/` 目录下的相关文档。 