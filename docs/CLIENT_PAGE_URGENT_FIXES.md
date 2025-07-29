# 客户页面紧急修复指南

## 修复优先级：🚨 高优先级

基于对客户页面功能的测试，发现了几个需要立即修复的关键问题。这些问题会导致前端功能无法正常使用。

## 问题1: 前后端字段命名不一致 🚨

### 问题描述
前端使用camelCase命名，后端使用snake_case命名，导致API调用失败。

### 影响范围
- 申请贷款功能
- 编辑贷款功能
- 个人资料更新功能
- 所有表单提交功能

### 解决方案

#### 方案A: 前端字段名转换（推荐）
在前端服务层添加字段名转换函数：

```javascript
// src/utils/fieldConverter.js
export function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
}

export function snakeToCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      newObj[camelKey] = obj[key];
    }
  }
  return newObj;
}
```

#### 修改服务文件
更新 `src/services/index.js` 中的贷款服务：

```javascript
import { camelToSnake, snakeToCamel } from '../utils/fieldConverter.js';

// 贷款服务
export const loanService = {
  async createLoan(loanData) {
    try {
      // 转换字段名
      const convertedData = camelToSnake(loanData);
      const response = await apiClient.post('/loans', convertedData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateLoan(loanId, loanData) {
    try {
      // 转换字段名
      const convertedData = camelToSnake(loanData);
      const response = await apiClient.put(`/loans/${loanId}`, convertedData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
```

## 问题2: 用户资料API路由错误 🚨

### 问题描述
`GET /api/v1/users/profile` 被错误解析为获取ID为"profile"的用户。

### 错误信息
```
"无效的_id: profile"
```

### 后端修复方案

#### 方案A: 添加专用资料路由
在用户路由中添加专用的profile路由：

```javascript
// 在用户路由文件中添加
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password -refresh_tokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        code: 404
      });
    }
    
    res.json({
      success: true,
      message: '获取用户资料成功',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      error: error.message
    });
  }
});

// 确保这个路由在 /:id 路由之前定义
router.get('/:id', authenticateToken, getUserById);
```

#### 方案B: 使用认证路由
将用户资料API移动到认证路由：

```javascript
// 在认证路由中添加
router.get('/profile', authenticateToken, async (req, res) => {
  // 同上实现
});
```

### 前端调用修改
如果采用方案B，需要修改前端API调用：

```javascript
// src/services/index.js
export const userService = {
  async getProfile() {
    try {
      // 修改为认证路由
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};
```

## 问题3: 缺少的API接口 📝

### 需要实现的API

#### 1. 用户统计API
```javascript
// 路由: GET /api/v1/users/stats
// 返回格式:
{
  "success": true,
  "data": {
    "totalTasks": 10,
    "completedTasks": 7,
    "activeProjects": 3
  }
}
```

#### 2. 贷款计算API
```javascript
// 路由: POST /api/v1/loans/calculate
// 请求体:
{
  "amount": 100000,
  "interest_rate": 5.5,
  "term": 240,
  "method": "equal_payment" // 或 "equal_principal"
}

// 返回格式:
{
  "success": true,
  "data": {
    "monthly_payment": 1234.56,
    "total_payment": 296294.40,
    "total_interest": 196294.40,
    "method": "equal_payment"
  }
}
```

#### 3. 任务管理API
```javascript
// GET /api/v1/tasks - 获取任务列表
// POST /api/v1/tasks - 创建任务
// PUT /api/v1/tasks/:id - 更新任务
// DELETE /api/v1/tasks/:id - 删除任务
```

## 立即修复步骤

### 第1步：修复字段名转换
1. 创建 `src/utils/fieldConverter.js` 文件
2. 更新 `src/services/index.js` 中的贷款服务
3. 测试申请贷款功能

### 第2步：修复用户资料API
1. 在后端添加 `/users/profile` 路由
2. 确保路由顺序正确
3. 测试用户资料获取功能

### 第3步：验证修复
1. 重新测试所有API调用
2. 确认前端功能正常
3. 检查控制台错误

## 测试验证命令

### 测试字段名转换
```bash
# 测试申请贷款 (修复后)
curl -X POST https://zlyoszudwbcc.sealoshzh.site/api/v1/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loan_name": "测试贷款",
    "applicant_name": "测试用户",
    "amount": 50000,
    "interest_rate": 5.5,
    "bank": "测试银行",
    "term": 12,
    "repayment_method": "equal_payment"
  }'
```

### 测试用户资料API
```bash
# 测试用户资料获取 (修复后)
curl -X GET https://zlyoszudwbcc.sealoshzh.site/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 预期修复时间
- 字段名转换：30分钟
- 用户资料API：15分钟
- 验证测试：15分钟
- **总计：约1小时**

## 注意事项
1. 所有修改都需要同时更新前端和后端
2. 修复完成后需要重新进行完整的功能测试
3. 建议在测试环境先验证，再部署到生产环境

---
*创建时间: 2025-06-27 02:22*
*优先级: 🚨 紧急*
*预计修复时间: 1小时* 