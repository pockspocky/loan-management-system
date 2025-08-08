#!/bin/bash

# 设置环境变量
export NODE_ENV=production
export PORT=8080
export MONGODB_URI=mongodb://localhost:27017
export DB_NAME=loan_management
export JWT_SECRET=your_jwt_secret_key
export JWT_EXPIRES_IN=24h
export REFRESH_TOKEN_SECRET=your_refresh_token_secret
export REFRESH_TOKEN_EXPIRES_IN=7d
export CORS_ORIGIN=http://localhost:5173
export LOG_LEVEL=info

# 启动后端服务
cd backend && npm start
