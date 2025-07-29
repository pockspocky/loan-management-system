# 🔧 CORS跨域问题修复指南

## 问题描述
前端可以通过curl正常访问API，但浏览器访问时被CORS策略阻止。

## 问题诊断结果

### ✅ 已有的CORS配置
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
```

### ❌ 缺少的关键配置
```
Access-Control-Allow-Origin: <允许的域名>
```

## 问题原因
后端CORS配置不完整，缺少`Access-Control-Allow-Origin`响应头，导致浏览器阻止跨域请求。

## 修复方案

### 方案1：允许特定域名（推荐生产环境）
```javascript
// Express.js示例
app.use(cors({
  origin: [
    'http://localhost:5173',    // 开发环境
    'http://localhost:3002',    // 备用端口
    'https://your-frontend.com' // 生产环境
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 方案2：允许所有域名（仅开发环境）
```javascript
// 仅用于开发测试
app.use(cors({
  origin: '*',
  credentials: false, // 注意：使用*时不能设置为true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 方案3：手动设置响应头
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## 测试验证

### 1. 检查CORS头
```bash
curl -X OPTIONS -H "Origin: http://localhost:5173" -v http://10.108.56.221:8080/api/v1/auth/login
```

应该看到：
```
Access-Control-Allow-Origin: http://localhost:5173
```

### 2. 测试实际请求
```bash
curl -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  http://10.108.56.221:8080/api/v1/auth/login
```

## 紧急程度
🔴 **高优先级** - 前端完全无法与后端通信

## 前端临时解决方案
前端已配置代理作为临时解决方案，但生产环境仍需要后端修复CORS配置。

---
**请优先添加 `Access-Control-Allow-Origin` 响应头，这是解决问题的关键。** 