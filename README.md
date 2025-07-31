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

### 安装依赖

```bash
# 安装根项目依赖
npm install

# 安装所有子项目依赖
npm run install:all

# 或单独安装
npm run frontend:install
npm run backend:install
```

### 开发模式

```bash
# 同时启动前后端开发服务器
npm run dev

# 或单独启动
npm run frontend:dev    # 启动前端开发服务器 (端口: 5173)
npm run backend:dev     # 启动后端开发服务器
```

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

## 部署

详细部署说明请参考 `docs/` 目录下的相关文档。 