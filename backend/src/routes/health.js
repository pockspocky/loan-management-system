const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * 健康检查端点
 * GET /api/v1/health
 */
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // 检查数据库响应时间
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - start;

    // 获取系统信息
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    // 如果健康检查失败，返回错误状态
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'disconnected'
      }
    });
  }
});

/**
 * 就绪状态检查端点
 * GET /api/v1/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // 执行一个简单的数据库查询
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * 存活状态检查端点
 * GET /api/v1/health/live
 */
router.get('/live', (req, res) => {
  // 简单的存活检查，只要进程在运行就返回成功
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router; 