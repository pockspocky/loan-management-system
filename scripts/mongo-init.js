// MongoDB初始化脚本
// 在容器启动时自动执行

print('开始初始化MongoDB数据库...');

// 切换到指定数据库
db = db.getSiblingDB('loan_management');

// 创建应用用户
db.createUser({
  user: 'loan_user',
  pwd: 'loan123456',
  roles: [
    {
      role: 'readWrite',
      db: 'loan_management'
    }
  ]
});

print('应用用户创建成功: loan_user');

// 创建集合和索引
print('创建集合和索引...');

// 创建用户集合索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": 1 });

print('用户集合索引创建完成');

// 创建贷款集合索引
db.loans.createIndex({ "userId": 1 });
db.loans.createIndex({ "status": 1 });
db.loans.createIndex({ "createdAt": 1 });
db.loans.createIndex({ "amount": 1 });
db.loans.createIndex({ "interestRate": 1 });

print('贷款集合索引创建完成');

// 创建还款记录集合索引
db.payments.createIndex({ "loanId": 1 });
db.payments.createIndex({ "paymentDate": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "createdAt": 1 });

print('还款记录集合索引创建完成');

// 创建还款计划集合索引
db.repaymentschedules.createIndex({ "loanId": 1 });
db.repaymentschedules.createIndex({ "dueDate": 1 });
db.repaymentschedules.createIndex({ "status": 1 });
db.repaymentschedules.createIndex({ "installmentNumber": 1 });

print('还款计划集合索引创建完成');

// 创建系统日志集合索引
db.systemlogs.createIndex({ "level": 1 });
db.systemlogs.createIndex({ "module": 1 });
db.systemlogs.createIndex({ "user_id": 1 });
db.systemlogs.createIndex({ "created_at": 1 });
db.systemlogs.createIndex({ "created_at": 1, "level": 1 });

print('系统日志集合索引创建完成');

// 创建默认管理员用户
print('创建默认管理员用户...');

// 注意：这里使用明文密码，实际应用中应该在应用层处理密码加密
// 在Node.js应用中，密码会在保存前被bcrypt加密
db.users.insertOne({
  username: 'admin',
  password: 'admin123', // 明文密码，应用层会处理加密
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('默认管理员用户创建完成');
print('用户名: admin');
print('密码: admin123');
print('⚠️  生产环境请立即修改默认密码！');

// 插入系统初始化日志
db.systemlogs.insertOne({
  level: 'info',
  module: 'system',
  action: 'database_init',
  message: 'MongoDB数据库初始化完成',
  username: 'system',
  ip_address: '172.20.0.0',
  user_agent: 'MongoDB Init Script',
  request_method: 'INIT',
  request_url: '/init',
  response_status: 200,
  metadata: {
    database: 'loan_management',
    collections_created: ['users', 'loans', 'payments', 'repaymentschedules', 'systemlogs'],
    indexes_created: 15,
    admin_user_created: true
  },
  created_at: new Date()
});

print('数据库初始化完成！');
print('===================================');
print('数据库名: loan_management');
print('用户名: loan_user');
print('管理员: admin / admin123');
print('==================================='); 