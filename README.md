# 贷款管理系统

一个基于 Vue 3 + Vite 开发的现代化贷款管理系统前端。

## 功能特性

- 🔐 用户认证（登录/注册）
- 👥 用户管理（管理员功能）
- 💰 贷款申请与管理
- ✅ 贷款审批流程
- 📊 数据统计展示

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vite - 快速构建工具
- Axios - HTTP 客户端

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 环境配置

创建 `.env` 文件配置后端API地址：

```env
VITE_API_URL=http://10.108.56.221:8080/api/v1
```

## 项目结构

```
src/
├── components/     # Vue 组件
├── config/         # 配置文件
├── services/       # API 服务
├── stores/         # 状态管理
├── utils/          # 工具函数
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 许可证

MIT License 