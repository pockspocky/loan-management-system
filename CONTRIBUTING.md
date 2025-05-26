# 贡献指南

感谢您对贷款管理系统项目的关注！我们欢迎各种形式的贡献。

## 🚀 快速开始

1. **Fork 项目**
   ```bash
   # 点击页面右上角的 Fork 按钮
   ```

2. **克隆您的 Fork**
   ```bash
   git clone https://github.com/your-username/loan-management-system.git
   cd loan-management-system
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📋 贡献类型

### 🐛 Bug 修复
- 修复现有功能的问题
- 改进错误处理
- 性能优化

### ✨ 新功能
- 添加新的贷款管理功能
- 增强用户界面
- 改进用户体验

### 📚 文档改进
- 更新 README
- 添加代码注释
- 编写使用指南

### 🎨 UI/UX 改进
- 界面设计优化
- 响应式布局改进
- 主题定制

## 🔧 开发规范

### 代码风格
- 使用 2 空格缩进
- 组件名使用 PascalCase
- 文件名使用 kebab-case
- 遵循 Vue.js 官方风格指南

### 组件结构
```vue
<template>
  <!-- HTML 模板 -->
</template>

<script>
// JavaScript 逻辑
</script>

<style scoped>
/* CSS 样式 */
</style>
```

### 提交信息规范
使用语义化提交信息：

```
feat: 添加贷款申请功能
fix: 修复登录页面样式问题
docs: 更新 README 文档
style: 调整按钮样式
refactor: 重构贷款管理组件
test: 添加单元测试
chore: 更新依赖包
```

### 分支管理
- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/功能名` - 新功能分支
- `fix/问题描述` - 修复分支

## 📝 提交流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **开发和测试**
   ```bash
   # 进行开发
   npm run dev
   
   # 运行测试（如果有）
   npm run test
   
   # 代码检查
   npm run lint
   ```

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

4. **推送到您的仓库**
   ```bash
   git push origin feature/new-feature
   ```

5. **创建 Pull Request**
   - 到 GitHub 页面创建 PR
   - 描述您的更改
   - 链接相关的 issue

## 🧪 测试指南

### 运行测试
```bash
# 运行所有测试
npm run test

# 运行特定测试
npm run test -- --grep "测试名称"
```

### 编写测试
- 为新功能编写单元测试
- 确保测试覆盖率
- 测试边界情况

## 📋 Pull Request 清单

在提交 PR 之前，请确保：

- [ ] 代码遵循项目风格指南
- [ ] 通过所有现有测试
- [ ] 添加了新功能的测试
- [ ] 更新了相关文档
- [ ] 提交信息清晰明确
- [ ] 解决了代码冲突

## 🐛 报告问题

### Bug 报告模板
```markdown
**问题描述**
简要描述遇到的问题

**复现步骤**
1. 进入 '...'
2. 点击 '....'
3. 向下滚动到 '....'
4. 看到错误

**期望行为**
描述您期望发生的行为

**截图**
如果适用，添加截图来帮助解释您的问题

**环境信息**
- 操作系统: [例如 macOS, Windows]
- 浏览器: [例如 Chrome, Safari]
- 版本: [例如 22]
```

### 功能请求模板
```markdown
**功能描述**
清晰简洁地描述您想要的功能

**解决的问题**
描述这个功能解决什么问题

**替代方案**
描述您考虑过的任何替代解决方案或功能

**附加信息**
添加关于功能请求的任何其他上下文或截图
```

## 🎯 项目目标

我们希望构建：
- 功能完整的贷款管理系统
- 用户友好的界面
- 高性能的应用
- 可维护的代码库
- 全面的文档

## 📞 联系方式

如果您有任何问题，可以通过以下方式联系我们：

- 创建 [Issue](https://github.com/your-username/loan-management-system/issues)
- 发送邮件到：your.email@example.com
- 在 [Discussions](https://github.com/your-username/loan-management-system/discussions) 中讨论

## 🙏 致谢

感谢所有为项目做出贡献的开发者！

---

再次感谢您的贡献！🎉 