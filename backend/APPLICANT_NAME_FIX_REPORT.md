# 🎉 申请人姓名覆盖问题修复完成报告

## 📋 问题概述

在贷款申请功能中发现，后端会自动将前端发送的 `applicant_name` 字段覆盖为当前登录用户的 `real_name`，导致无法为他人代理申请贷款。

### 问题表现
- **前端发送**: `applicant_name: "张三"`
- **后端保存**: `applicant_name: "系统管理员"` (当前用户姓名)
- **用户体验**: 无法代理他人申请贷款

## 🔧 修复措施

### 1. 更新验证模式

**文件**: `src/utils/validation.js`

```javascript
// 贷款创建验证模式
const loanCreateSchema = Joi.object({
  loan_name: Joi.string().trim().max(100).required(),
  applicant_name: Joi.string().trim().max(50).optional().messages({
    'string.max': '申请人姓名最多50个字符'
  }),
  // ... 其他字段
});

// 贷款更新验证模式  
const loanUpdateSchema = Joi.object({
  loan_name: Joi.string().trim().max(100).optional(),
  applicant_name: Joi.string().trim().max(50).optional().messages({
    'string.max': '申请人姓名最多50个字符'
  }),
  // ... 其他字段
});
```

### 2. 修复贷款创建逻辑

**文件**: `src/routes/loans.js`

```javascript
// 修复前（错误的做法）
const loan = new Loan({
  loan_name,
  applicant_id: req.user._id,
  applicant_name: req.user.real_name || req.user.username, // 强制覆盖
  // ...
});

// 修复后（正确的做法）
const loan = new Loan({
  loan_name,
  applicant_id: req.user._id,
  applicant_name: applicant_name || req.user.real_name || req.user.username, // 优先使用前端值
  // ...
});
```

### 3. 支持申请人姓名更新

**文件**: `src/routes/loans.js`

```javascript
// 添加到允许更新的字段列表
const allowedFields = [
  'loan_name', 'applicant_name', 'amount', 'interest_rate', 'bank', 
  'term', 'repayment_method', 'purpose', 'collateral', 'attachments'
];
```

## ✅ 修复验证

### 测试场景

1. **代理申请测试**
   - 前端发送: `applicant_name: "张三"`
   - 后端保存: `applicant_name: "张三"` ✅
   - 结果: 支持代理申请

2. **自己申请测试**
   - 前端不发送 `applicant_name`
   - 后端保存: `applicant_name: "测试用户"` (当前用户真实姓名) ✅
   - 结果: 自动使用当前用户姓名

3. **更新申请人测试**
   - 更新 `applicant_name: "李四"`
   - 后端保存: `applicant_name: "李四"` ✅
   - 结果: 支持更新申请人姓名

### 测试执行结果

```bash
$ ./test-applicant-name-fix.sh

🧪 测试1: 创建贷款申请 - 指定申请人姓名
✅ 测试1通过 - 申请人姓名正确保存为: 张三

🧪 测试2: 创建贷款申请 - 不指定申请人姓名  
✅ 测试2通过 - 未指定申请人时使用当前用户姓名: 测试用户

🧪 测试3: 更新贷款申请人姓名
✅ 测试3通过 - 申请人姓名成功更新为: 李四

🎉 申请人姓名覆盖问题修复完成！
```

## 🎯 业务逻辑说明

### 当前实现 (推荐)
- **优先使用前端发送的申请人姓名** - 支持代理申请
- **未指定时使用当前用户姓名** - 保证数据完整性
- **支持后续更新申请人姓名** - 灵活性

### API行为

#### 创建贷款申请
```http
POST /api/v1/loans
{
  "loan_name": "张三代理申请",
  "applicant_name": "张三",  // 可选字段
  "amount": 100000,
  // ... 其他字段
}

响应:
{
  "success": true,
  "data": {
    "loan": {
      "applicant_name": "张三",  // 使用前端发送的值
      // ...
    }
  }
}
```

#### 更新贷款信息
```http
PUT /api/v1/loans/:id
{
  "applicant_name": "李四"  // 支持更新
}

响应:
{
  "success": true,
  "data": {
    "loan": {
      "applicant_name": "李四",  // 更新成功
      // ...
    }
  }
}
```

## 📝 文件变更清单

1. **src/utils/validation.js**
   - 在 `loanCreateSchema` 中添加 `applicant_name` 字段
   - 在 `loanUpdateSchema` 中添加 `applicant_name` 字段

2. **src/routes/loans.js**
   - 修改贷款创建逻辑，优先使用前端发送的申请人姓名
   - 在允许更新字段列表中添加 `applicant_name`
   - 在日志记录中添加 `applicant_name` 信息

3. **test-applicant-name-fix.sh**
   - 创建完整的修复验证测试脚本

## 🚀 向前兼容性

- ✅ **现有前端代码无需修改** - 不发送申请人姓名时使用默认行为
- ✅ **现有数据库记录不受影响** - 修复仅影响新创建的记录
- ✅ **API接口向后兼容** - `applicant_name` 为可选字段

## 🔒 权限与安全

### 当前实现
- 任何用户都可以为他人代理申请
- `applicant_id` 始终为当前登录用户ID (保证审计追踪)

### 可选的权限控制 (未实现)
如果业务需要限制代理申请权限，可以添加：

```javascript
// 仅管理员可以代理申请
const loanData = {
  ...req.body,
  applicant_name: req.user.role === 'admin' 
    ? req.body.applicant_name 
    : req.user.real_name,
  applicant_id: req.user._id
}
```

## ✨ 修复完成

**状态**: 🟢 已修复  
**优先级**: 高  
**影响**: 支持代理申请功能，提升用户体验  
**测试**: 全部通过  
**兼容性**: 完全向后兼容  

---

**修复人**: AI Assistant  
**完成时间**: 2025-05-28 07:27 UTC  
**测试脚本**: `./test-applicant-name-fix.sh` 