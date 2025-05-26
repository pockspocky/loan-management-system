# 🏦 贷款管理系统

一个基于 Vue.js 开发的现代化贷款管理系统，提供完整的贷款申请、审批和管理功能。系统包含管理员和用户两个角色，具有直观的用户界面和丰富的交互功能。

## ✨ 功能特性

### 🔐 用户认证
- 🎯 登录/注册页面
- 👨‍💼 管理员与用户角色区分
- 🔒 安全的身份验证机制

### 👨‍💼 管理员功能
- 📊 系统概览仪表盘
- 👥 用户管理
- 💰 贷款审批管理
- 📈 数据统计展示
- 📋 系统日志查看
- ✅ 贷款 CRUD 操作（创建、查看、编辑、删除、审批）

### 👤 用户功能
- 🏠 个人概览仪表盘
- 👤 个人资料管理
- 📝 任务管理
- 💳 贷款申请
- 📄 贷款记录查看
- ✏️ 贷款信息编辑

### 💰 贷款管理核心功能
- 📋 完整的贷款信息记录（名称、申请人、金额、利率、银行、期限等）
- 💱 还款方式支持（等额本息、等额本金）
- 🔄 状态管理（待审批、已批准、已完成）
- 📅 申请时间自动记录
- 🔍 详细信息查看
- ⚡ 快速审批功能

## 🛠️ 技术栈

- **前端框架**: Vue.js 3
- **组合式API**: Vue Composition API
- **响应式**: Vue Reactive System
- **样式**: CSS3 + Scoped Styles
- **图标**: Unicode Emoji
- **构建工具**: Vite (推荐)
- **包管理器**: npm/yarn

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/loan-management-system.git
cd loan-management-system
```

2. **安装依赖**
```bash
npm install
# 或者使用 yarn
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或者使用 yarn
yarn dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 构建生产版本
```bash
npm run build
# 或者使用 yarn
yarn build
```

## 📁 项目结构

```
loan-management-system/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── components/         # Vue 组件
│   │   ├── LoginPage.vue   # 登录页面
│   │   ├── AdminDashboard.vue  # 管理员仪表盘
│   │   └── UserDashboard.vue   # 用户仪表盘
│   ├── App.vue            # 主应用组件
│   └── main.js            # 应用入口
├── package.json           # 项目配置
├── README.md             # 项目说明
└── ...
```

## 🎯 使用指南

### 登录系统
- 访问首页会显示登录界面
- 可以选择以管理员或用户身份登录
- 支持用户注册功能

### 管理员操作
1. **贷款管理**
   - 查看所有贷款申请
   - 审批/拒绝贷款申请
   - 编辑贷款信息
   - 删除贷款记录

2. **用户管理**
   - 查看用户列表
   - 管理用户状态

### 用户操作
1. **申请贷款**
   - 填写完整的贷款申请表
   - 选择还款方式
   - 提交审批

2. **管理个人贷款**
   - 查看申请历史
   - 编辑待审批的申请
   - 查看贷款详情

## 🎨 界面预览

### 登录页面
- 现代化的登录界面设计
- 支持管理员和用户登录切换
- 响应式布局适配移动端

### 管理员仪表盘
- 清晰的数据统计展示
- 完整的贷款管理表格
- 直观的操作按钮

### 用户仪表盘
- 个性化的欢迎界面
- 简洁的贷款申请流程
- 友好的空状态提示

## 🔧 自定义配置

### 主题定制
系统使用了 CSS 变量，可以轻松自定义主题颜色：

```css
:root {
  --primary-color: #4ecdc4;
  --secondary-color: #44a08d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}
```

### 功能扩展
- 添加新的贷款类型
- 扩展用户权限系统
- 集成支付功能
- 添加通知系统

## 🔄 后端集成

项目已为后端集成做好准备：

1. **API 端点设计**
   - `GET /api/loans` - 获取贷款列表
   - `POST /api/loans` - 创建新贷款
   - `PUT /api/loans/:id` - 更新贷款信息
   - `DELETE /api/loans/:id` - 删除贷款
   - `POST /api/loans/:id/approve` - 审批贷款

2. **数据结构**
```javascript
{
  id: Number,
  loanName: String,
  applicantName: String,
  amount: Number,
  interestRate: Number,
  bank: String,
  term: Number,
  repaymentMethod: String,
  status: String,
  applicationDate: String
}
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 2 空格缩进
- 组件名使用 PascalCase
- 遵循 Vue.js 官方风格指南

## 📝 更新日志

### v1.0.0 (2024-01-XX)
- ✨ 初始版本发布
- 🏦 完整的贷款管理功能
- 👨‍💼 管理员和用户双角色支持
- 📱 响应式设计
- 🎨 现代化 UI 界面

## 🐛 问题报告

如果您发现任何问题，请在 [Issues](https://github.com/your-username/loan-management-system/issues) 页面报告。

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

- **您的姓名** - *初始工作* - [您的GitHub](https://github.com/your-username)

## 🙏 致谢

- Vue.js 团队提供优秀的框架
- 所有贡献者的辛勤工作
- 开源社区的支持

---

⭐ 如果这个项目对您有帮助，请给它一个星标！ 