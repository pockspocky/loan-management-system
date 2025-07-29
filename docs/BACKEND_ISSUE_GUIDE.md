# 后端申请人姓名覆盖问题修复指南

## 问题描述

在贷款申请功能中发现，后端会自动将前端发送的 `applicant_name` 字段覆盖为当前登录用户的 `real_name`，导致无法为他人代理申请贷款。

## 问题验证

### 前端发送的数据
```json
{
  "loan_name": "asd",
  "applicant_name": "张三",  // 前端发送的申请人姓名
  "amount": 100000,
  "interest_rate": 11,
  "bank": "aaâ",
  "term": 6,
  "repayment_method": "equal_principal",
  "applicant_id": "6833ff3eb76a48180d858ac8",
  "status": "pending"
}
```

### 后端返回的数据
```json
{
  "success": true,
  "message": "贷款申请创建成功",
  "data": {
    "loan": {
      "loan_name": "asd",
      "applicant_id": "6833ff3eb76a48180d858ac8",
      "applicant_name": "系统管理员",  // 被后端覆盖了
      "amount": 100000,
      // ...
    }
  }
}
```

## 可能的后端代码问题

后端在处理贷款创建时，可能有类似以下的逻辑：

```javascript
// 错误的做法：强制覆盖申请人姓名
const loanData = {
  ...req.body,
  applicant_name: req.user.real_name,  // 强制使用当前用户姓名
  applicant_id: req.user._id
}
```

## 建议的修复方案

### 方案1：保持前端发送的申请人姓名
```javascript
// 正确的做法：使用前端发送的申请人姓名
const loanData = {
  loan_name: req.body.loan_name,
  applicant_name: req.body.applicant_name,  // 使用前端发送的值
  amount: req.body.amount,
  interest_rate: req.body.interest_rate,
  bank: req.body.bank,
  term: req.body.term,
  repayment_method: req.body.repayment_method,
  applicant_id: req.user._id,  // 仍然使用当前登录用户的ID
  status: 'pending'
}
```

### 方案2：如果需要业务逻辑限制
如果业务逻辑要求申请人必须是当前登录用户，则应该：

1. **在API文档中明确说明**这个限制
2. **去掉前端的申请人姓名输入框**
3. **或者添加权限检查**，只有特定角色（如管理员）才能代理申请

```javascript
// 如果只有管理员可以代理申请
const loanData = {
  ...req.body,
  applicant_name: req.user.role === 'admin' 
    ? req.body.applicant_name 
    : req.user.real_name,
  applicant_id: req.user._id
}
```

## 影响分析

### 当前问题
- 前端用户无法为他人代理申请贷款
- 申请人姓名与实际意图不符
- 用户体验混乱

### 修复后效果
- 支持代理申请功能
- 申请人姓名与表单输入一致
- 符合用户预期

## 测试建议

修复后请测试以下场景：

1. **普通代理申请**
   - 输入申请人姓名："张三"
   - 期望结果：保存为"张三"

2. **自己申请**
   - 输入申请人姓名："李四"（当前用户）
   - 期望结果：保存为"李四"

3. **权限测试**（如果有权限限制）
   - 不同角色用户的代理申请权限
   - 期望结果：符合业务规则

## 紧急程度

**高** - 此问题影响核心业务功能，建议优先修复。

## 联系方式

如需进一步讨论此问题，请联系前端开发团队。 