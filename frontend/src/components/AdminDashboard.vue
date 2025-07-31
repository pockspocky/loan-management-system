<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-left">
        <h1>管理员仪表盘</h1>
        <span class="admin-badge">ADMIN</span>
      </div>
      <div class="header-right">
        <div class="user-info">
          <span>欢迎，{{ currentUser?.username || '管理员' }}</span>
          <button @click="logout" class="logout-btn" :disabled="isLoading">退出登录</button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 自定义通知系统 -->
      <div class="notification-container">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification-content">
            <span class="notification-icon">
              <span v-if="notification.type === 'success'">✅</span>
              <span v-else-if="notification.type === 'error'">❌</span>
              <span v-else-if="notification.type === 'warning'">⚠️</span>
              <span v-else>ℹ️</span>
            </span>
            <span class="notification-message">{{ notification.message }}</span>
          </div>
          <button class="notification-close" @click.stop="removeNotification(notification.id)">×</button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">加载中...</div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-banner">
        {{ error }}
        <button @click="error = null" class="close-error">×</button>
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            @click="activeTab = item.id"
            :class="['nav-item', { active: activeTab === item.id }]"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.text }}</span>
          </div>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 统计概览 -->
        <div v-if="activeTab === 'overview'" class="overview-section">
          <div class="section-header">
            <h2>贷款列表</h2>
            <button @click="showAddLoanModal = true" class="add-btn">添加贷款</button>
          </div>
          
          <div v-if="loans.length > 0" class="loans-table">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th class="id-col">ID</th>
                    <th class="name-col">贷款名称</th>
                    <th class="applicant-col">申请人</th>
                    <th class="amount-col">贷款金额</th>
                    <th class="rate-col">年利率</th>
                    <th class="bank-col">贷款银行</th>
                    <th class="term-col">还款期限</th>
                    <th class="method-col">还款方式</th>
                    <th class="status-col">申请状态</th>
                    <th class="date-col">申请时间</th>
                    <th class="action-col">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in loans" :key="loan.id">
                    <td class="id-col">{{ loan.id }}</td>
                    <td class="name-col loan-name">{{ loan.loanName }}</td>
                    <td class="applicant-col">{{ loan.applicantName }}</td>
                    <td class="amount-col amount">￥{{ loan.amount.toLocaleString() }}</td>
                    <td class="rate-col rate">{{ loan.interestRate }}%</td>
                    <td class="bank-col">{{ loan.bank }}</td>
                    <td class="term-col term">{{ loan.term }}个月</td>
                    <td class="method-col repayment-method">{{ getRepaymentMethodText(loan.repaymentMethod) }}</td>
                    <td class="status-col">
                      <span :class="['loan-status', loan.status]">
                        {{ getLoanStatusText(loan.status) }}
                      </span>
                    </td>
                    <td class="date-col">{{ loan.applicationDate }}</td>
                    <td class="action-col">
                      <button @click="viewLoan(loan)" class="action-btn view">查看</button>
                      <button @click="approveLoan(loan)" class="action-btn approve" v-if="loan.status === 'pending'">审批</button>
                      <button @click="editLoan(loan)" class="action-btn edit">编辑</button>
                      <button @click="deleteLoan(loan)" class="action-btn delete">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-else class="empty-loans-state">
            <div class="empty-icon">💰</div>
            <h3>暂无贷款申请</h3>
            <p>系统中还没有贷款申请记录，等待后端数据接入...</p>
          </div>
        </div>

        <!-- 用户管理 -->
        <div v-if="activeTab === 'users'" class="users-section">
          <div class="section-header">
            <h2>用户管理</h2>
            <button @click="showAddUserModal = true" class="add-btn">添加用户</button>
          </div>
          
          <div v-if="users.length > 0" class="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>角色</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user._id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.role === 'admin' ? '管理员' : '普通用户' }}</td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button @click="editUser(user)" class="action-btn edit">编辑</button>
                    <button @click="viewUser(user)" class="action-btn view">查看</button>
                    <button @click="deleteUser(user)" class="action-btn delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-users-state">
            <div class="empty-icon">👥</div>
            <h3>暂无用户数据</h3>
            <p>系统中还没有用户，等待后端数据接入...</p>
          </div>
        </div>

        <!-- 系统日志 -->
        <div v-if="activeTab === 'logs'" class="logs-section">
          <div class="section-header">
            <h2>系统日志</h2>
            <div class="logs-controls">
              <button @click="refreshLogs" class="refresh-btn" :disabled="isLoadingLogs">
                {{ isLoadingLogs ? '加载中...' : '刷新' }}
              </button>
              <button @click="showLogCleanupModal = true" class="cleanup-btn">
                清理日志
              </button>
            </div>
          </div>



          <!-- 日志统计 -->
          <div v-if="logStats" class="logs-stats">
            <div class="stat-item">
              <span class="stat-label">总计:</span>
              <span class="stat-value">{{ logPagination.total || 0 }}</span>
            </div>
            <div v-for="stat in logStats.level_stats" :key="stat._id" :class="['stat-item', 'level-' + stat._id]">
              <span class="stat-label">{{ getLevelText(stat._id) }}:</span>
              <span class="stat-value">{{ stat.count }}</span>
            </div>
          </div>

          <!-- 日志列表 -->
          <div v-if="logs.length > 0" class="logs-table">
            <div class="logs-header">
              <div class="header-cell time">时间</div>
              <div class="header-cell level">级别</div>
              <div class="header-cell module">模块</div>
              <div class="header-cell user">用户</div>
              <div class="header-cell message">消息</div>
              <div class="header-cell actions">操作</div>
            </div>
            <div class="logs-body">
              <div 
                v-for="log in logs" 
                :key="log._id" 
                :class="['log-row', 'level-' + log.level]"
              >
                <div class="log-cell time">
                  {{ formatDate(log.created_at) }}
                </div>
                <div class="log-cell level">
                  <span :class="['level-badge', log.level]">
                    {{ getLevelText(log.level) }}
                  </span>
                </div>
                <div class="log-cell module">
                  <span class="module-badge">{{ getModuleText(log.module) }}</span>
                </div>
                <div class="log-cell user">
                  {{ log.username || '系统' }}
                </div>
                <div class="log-cell message">
                  {{ log.message }}
                </div>
                <div class="log-cell actions">
                  <button @click="viewLogDetail(log)" class="action-btn view">详情</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="logPagination.total_pages > 1" class="logs-pagination">
            <button 
              @click="changePage(logPagination.current_page - 1)"
              :disabled="!logPagination.has_prev"
              class="page-btn prev"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ logPagination.current_page }} 页，共 {{ logPagination.total_pages }} 页
              ({{ logPagination.total }} 条记录)
            </span>
            <button 
              @click="changePage(logPagination.current_page + 1)"
              :disabled="!logPagination.has_next"
              class="page-btn next"
            >
              下一页
            </button>
          </div>
          
          <div v-else-if="!isLoadingLogs" class="empty-logs-state">
            <div class="empty-icon">📋</div>
            <h3>暂无系统日志</h3>
            <p>系统中还没有日志记录</p>
          </div>

          <div v-if="isLoadingLogs" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载日志中...</p>
          </div>
        </div>
      </main>
    </div>

    <!-- 添加贷款模态框 -->
    <div v-if="showAddLoanModal" class="modal-overlay" @click="showAddLoanModal = false">
      <div class="modal-content" @click.stop>
        <h3>添加新贷款</h3>
        <form @submit.prevent="addLoan">
          <div class="form-group">
            <label>贷款名称</label>
            <input v-model="newLoan.loanName" type="text" required />
          </div>
          <div class="form-group">
            <label>申请人</label>
            <input v-model="newLoan.applicantName" type="text" required />
          </div>
          <div class="form-group">
            <label>贷款金额</label>
            <input v-model.number="newLoan.amount" type="number" min="1000" max="10000000" step="100" required />
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model.number="newLoan.interestRate" type="number" min="0.01" max="36" step="0.01" required />
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="newLoan.bank" type="text" required />
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model.number="newLoan.term" type="number" min="1" max="360" step="1" required />
          </div>
          <div class="form-group">
            <label>还款方式</label>
            <select v-model="newLoan.repaymentMethod" required>
              <option value="">请选择还款方式</option>
              <option value="等额本息">等额本息</option>
              <option value="等额本金">等额本金</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddLoanModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">添加</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看贷款详情模态框 -->
    <div v-if="showViewLoanModal" class="modal-overlay" @click="showViewLoanModal = false">
      <div class="modal-content loan-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>贷款详情管理</h3>
          <button @click="showViewLoanModal = false" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 导航标签 -->
          <div class="detail-tabs">
            <button 
              :class="['tab-btn', { active: activeDetailTab === 'basic' }]"
              @click="activeDetailTab = 'basic'"
            >
              基本信息
            </button>
            <button 
              :class="['tab-btn', { active: activeDetailTab === 'calculator' }]"
              @click="activeDetailTab = 'calculator'"
            >
              贷款计算
            </button>
            <button 
              :class="['tab-btn', { active: activeDetailTab === 'repayment' }]"
              @click="activeDetailTab = 'repayment'"
            >
              还款管理
            </button>
          </div>

          <!-- 基本信息标签页 -->
          <div v-if="activeDetailTab === 'basic'" class="tab-content">
            <div class="detail-grid">
          <div class="detail-item">
                <label>贷款ID</label>
            <span>{{ selectedLoan.id }}</span>
          </div>
          <div class="detail-item">
                <label>贷款名称</label>
            <span>{{ selectedLoan.loanName }}</span>
          </div>
          <div class="detail-item">
                <label>申请人</label>
            <span>{{ selectedLoan.applicantName }}</span>
          </div>
          <div class="detail-item">
                <label>贷款金额</label>
            <span>￥{{ selectedLoan.amount?.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
                <label>年利率</label>
            <span>{{ selectedLoan.interestRate }}%</span>
          </div>
          <div class="detail-item">
                <label>贷款银行</label>
            <span>{{ selectedLoan.bank }}</span>
          </div>
          <div class="detail-item">
                <label>还款期限</label>
            <span>{{ selectedLoan.term }}个月</span>
          </div>
          <div class="detail-item">
                <label>还款方式</label>
            <span>{{ getRepaymentMethodText(selectedLoan.repaymentMethod) }}</span>
          </div>
          <div class="detail-item">
                <label>申请状态</label>
            <span :class="['loan-status', selectedLoan.status]">
              {{ getLoanStatusText(selectedLoan.status) }}
            </span>
          </div>
          <div class="detail-item">
                <label>申请时间</label>
            <span>{{ selectedLoan.applicationDate }}</span>
          </div>
        </div>
          </div>

          <!-- 贷款计算标签页 -->
          <div v-if="activeDetailTab === 'calculator'" class="tab-content">
            <div class="calculator-section">
              <div class="calculator-controls">
                <button 
                  @click="calculateLoan('equal-installment')" 
                  class="calc-btn"
                  :disabled="isCalculating"
                >
                  等额本息计算
                </button>
                <button 
                  @click="calculateLoan('equal-principal')" 
                  class="calc-btn"
                  :disabled="isCalculating"
                >
                  等额本金计算
                </button>
                <button 
                  @click="calculateLoan('compare')" 
                  class="calc-btn"
                  :disabled="isCalculating"
                >
                  两种方式比较
                </button>
              </div>

              <div v-if="isCalculating" class="loading">
                <div class="spinner"></div>
                <span>计算中...</span>
              </div>

              <!-- 计算结果显示 -->
              <div v-if="calculationResult" class="calculation-result">
                <!-- 等额本息结果 -->
                <div v-if="calculationResult.type === 'equalInstallment'" class="result-section">
                  <h4>等额本息还款计算结果</h4>
                  <div class="result-summary">
                    <div class="summary-item">
                      <label>每月还款额</label>
                      <span class="highlight">￥{{ calculationResult.monthlyPayment?.toLocaleString() }}</span>
                    </div>
                    <div class="summary-item">
                      <label>总还款额</label>
                      <span>￥{{ calculationResult.totalPayment?.toLocaleString() }}</span>
                    </div>
                    <div class="summary-item">
                      <label>总利息</label>
                      <span>￥{{ calculationResult.totalInterest?.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>

                <!-- 等额本金结果 -->
                <div v-if="calculationResult.type === 'equalPrincipal'" class="result-section">
                  <h4>等额本金还款计算结果</h4>
                  <div class="result-summary">
                    <div class="summary-item">
                      <label>首月还款额</label>
                      <span class="highlight">￥{{ calculationResult.firstMonthPayment?.toLocaleString() }}</span>
                    </div>
                    <div class="summary-item">
                      <label>末月还款额</label>
                      <span>￥{{ calculationResult.lastMonthPayment?.toLocaleString() }}</span>
                    </div>
                    <div class="summary-item">
                      <label>总还款额</label>
                      <span>￥{{ calculationResult.totalPayment?.toLocaleString() }}</span>
                    </div>
                    <div class="summary-item">
                      <label>总利息</label>
                      <span>￥{{ calculationResult.totalInterest?.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>

                <!-- 比较结果 -->
                <div v-if="calculationResult.equalInstallment && calculationResult.equalPrincipal" class="result-section">
                  <h4>还款方式比较</h4>
                  <div class="comparison-table">
                    <table>
                      <thead>
                        <tr>
                          <th>还款方式</th>
                          <th>月供</th>
                          <th>总还款额</th>
                          <th>总利息</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>等额本息</td>
                          <td>￥{{ calculationResult.equalInstallment.monthlyPayment?.toLocaleString() }}</td>
                          <td>￥{{ calculationResult.equalInstallment.totalPayment?.toLocaleString() }}</td>
                          <td>￥{{ calculationResult.equalInstallment.totalInterest?.toLocaleString() }}</td>
                        </tr>
                        <tr>
                          <td>等额本金</td>
                          <td>￥{{ calculationResult.equalPrincipal.firstMonthPayment?.toLocaleString() }}~￥{{ calculationResult.equalPrincipal.lastMonthPayment?.toLocaleString() }}</td>
                          <td>￥{{ calculationResult.equalPrincipal.totalPayment?.toLocaleString() }}</td>
                          <td>￥{{ calculationResult.equalPrincipal.totalInterest?.toLocaleString() }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="calculationResult.comparison" class="comparison-recommendation">
                    <p class="recommendation">{{ calculationResult.comparison.recommendation }}</p>
                  </div>
                </div>

                <!-- 详细还款计划表格 -->
                <div v-if="calculationResult.schedule && calculationResult.schedule.length > 0" class="schedule-section">
                  <h4>还款计划明细（前12期）</h4>
                  <div class="schedule-table">
                    <table>
                      <thead>
                        <tr>
                          <th>期数</th>
                          <th>月供总额</th>
                          <th>本金</th>
                          <th>利息</th>
                          <th>剩余本金</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in calculationResult.schedule.slice(0, 12)" :key="index">
                          <td>第{{ item.period }}期</td>
                          <td>￥{{ item.monthlyPayment?.toLocaleString() }}</td>
                          <td>￥{{ item.principalPayment?.toLocaleString() }}</td>
                          <td>￥{{ item.interestPayment?.toLocaleString() }}</td>
                          <td>￥{{ item.remainingPrincipal?.toLocaleString() }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 还款管理标签页 -->
          <div v-if="activeDetailTab === 'repayment'" class="tab-content">
            <div class="repayment-section">
              <div class="repayment-controls">
                <button @click="loadRepaymentSchedule" class="calc-btn" :disabled="isLoadingRepayment">
                  {{ isLoadingRepayment ? '加载中...' : '获取还款计划' }}
                </button>
                <button v-if="repaymentSchedule.length > 0" @click="showBatchPaymentModal = true" class="calc-btn batch-payment-btn">
                  批量还款
                </button>
                <button v-if="selectedSchedules.length > 0" @click="showBatchModifyModal = true" class="calc-btn modify-btn">
                  批量修改 ({{ selectedSchedules.length }})
                </button>
                <button v-if="repaymentSchedule.length > 0" @click="toggleSelectAll" class="calc-btn select-btn">
                  {{ selectedSchedules.length === repaymentSchedule.filter(s => s.status !== 'paid').length ? '取消全选' : '全选' }}
                </button>
              </div>

              <!-- 还款统计 -->
              <div v-if="repaymentStats" class="repayment-stats">
                <h4>还款统计</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <label>总期数</label>
                    <span>{{ repaymentStats?.payment_stats?.total_periods || repaymentStats?.total_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>已还期数</label>
                    <span>{{ repaymentStats?.payment_stats?.paid_periods || repaymentStats?.paid_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>待还期数</label>
                    <span>{{ repaymentStats?.payment_stats?.pending_periods || repaymentStats?.pending_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>逾期期数</label>
                    <span class="overdue">{{ repaymentStats?.payment_stats?.overdue_periods || repaymentStats?.overdue_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>还款进度</label>
                    <span>{{ repaymentStats ? PrecisionMath.toString(PrecisionMath.safeDecimal(repaymentStats?.payment_stats?.payment_progress || repaymentStats?.payment_progress || 0), 1) : '0.0' }}%</span>
                  </div>
                  <div class="stat-item">
                    <label>剩余应还金额</label>
                    <span>￥{{ (repaymentStats?.payment_stats?.remaining_amount || repaymentStats?.remaining_amount || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (repaymentStats?.payment_stats?.payment_progress || repaymentStats?.payment_progress || 0) + '%' }"></div>
                </div>
              </div>

              <!-- 还款计划列表 -->
              <div v-if="repaymentSchedule && repaymentSchedule.length > 0" class="repayment-schedule">
                <h4>还款计划（共{{ repaymentSchedule.length }}期）</h4>
                <div class="schedule-table">
                  <table>
                    <thead>
                      <tr>
                        <th>选择</th>
                        <th>期数</th>
                        <th>到期日期</th>
                        <th>应还总额</th>
                        <th>本金</th>
                        <th>利息</th>
                        <th>滞纳金</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in repaymentSchedule" :key="item.period_number">
                        <td>
                          <input 
                            v-if="item.status !== 'paid'"
                            type="checkbox"
                            :checked="selectedSchedules.some(s => s.period_number === item.period_number)"
                            @change="toggleScheduleSelection(item)"
                          />
                        </td>
                        <td>第{{ item.period_number }}期</td>
                        <td>{{ formatDate(item.due_date) }}</td>
                        <td>￥{{ item.total_amount?.toLocaleString() }}</td>
                        <td>￥{{ item.principal_amount?.toLocaleString() }}</td>
                        <td>￥{{ item.interest_amount?.toLocaleString() }}</td>
                        <td>￥{{ (item.late_fee || 0).toLocaleString() }}</td>
                        <td>
                          <span :class="['payment-status', item.status]">
                            {{ getPaymentStatusText(item.status) }}
                          </span>
                        </td>
                        <td class="action-buttons">
                          <button 
                            v-if="item.status !== 'paid'"
                            @click="selectPaymentSchedule(item)"
                            class="action-btn pay"
                            title="记录还款"
                          >
                            记录
                          </button>
                          <button 
                            v-if="item.status !== 'paid'"
                            @click="selectScheduleForModify(item)"
                            class="action-btn modify"
                            title="修改计划"
                          >
                            修改
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改单期还款计划模态框 -->
    <div v-if="showModifyScheduleModal" class="modal-overlay" @click="showModifyScheduleModal = false">
      <div class="modal-content modify-schedule-modal" @click.stop>
        <h3>修改还款计划 - 第{{ modifyScheduleForm.period_number }}期</h3>
        <form @submit.prevent="modifySchedule" class="modify-form">
          <div class="form-row">
            <div class="form-group">
              <label>到期日期</label>
              <input v-model="modifyScheduleForm.due_date" type="date" required />
            </div>
            <div class="form-group">
              <label>应还总额</label>
              <input 
                v-model.number="modifyScheduleForm.total_amount" 
                type="number" 
                step="0.01" 
                min="0"
                required 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>应还本金</label>
              <input 
                v-model.number="modifyScheduleForm.principal_amount" 
                type="number" 
                step="0.01" 
                min="0"
                required 
              />
            </div>
            <div class="form-group">
              <label>应还利息</label>
              <input 
                v-model.number="modifyScheduleForm.interest_amount" 
                type="number" 
                step="0.01" 
                min="0"
                required 
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>滞纳金</label>
              <input 
                v-model.number="modifyScheduleForm.late_fee" 
                type="number" 
                step="0.01" 
                min="0"
              />
            </div>
            <div class="form-group amount-check">
              <label>金额校验</label>
              <div class="amount-check-result">
                <span>本金 + 利息 + 滞纳金 = </span>
                <span :class="{ 'error': modifyScheduleForm.principal_amount && modifyScheduleForm.interest_amount && modifyScheduleForm.total_amount && !PrecisionMath.equals(PrecisionMath.add(PrecisionMath.add(modifyScheduleForm.principal_amount, modifyScheduleForm.interest_amount), modifyScheduleForm.late_fee || 0), modifyScheduleForm.total_amount, 0.01) }">
                  ￥{{ (modifyScheduleForm.principal_amount || modifyScheduleForm.interest_amount) ? PrecisionMath.toFormattedString(PrecisionMath.add(PrecisionMath.add(PrecisionMath.safeDecimal(modifyScheduleForm.principal_amount), PrecisionMath.safeDecimal(modifyScheduleForm.interest_amount)), PrecisionMath.safeDecimal(modifyScheduleForm.late_fee, 0))) : '0.00' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>修改说明</label>
            <textarea v-model="modifyScheduleForm.notes" rows="3" placeholder="请输入修改原因..."></textarea>
          </div>
          
        <div class="modal-actions">
            <button type="button" @click="showModifyScheduleModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn" :disabled="isModifyingSchedule">
              {{ isModifyingSchedule ? '修改中...' : '确认修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 批量修改模态框 -->
    <div v-if="showBatchModifyModal" class="modal-overlay" @click="showBatchModifyModal = false">
      <div class="modal-content batch-modify-modal" @click.stop>
        <h3>批量修改还款计划</h3>
        <div class="selected-info">
          <p>已选择 <strong>{{ selectedSchedules.length }}</strong> 期进行批量修改</p>
        </div>
        
        <form @submit.prevent="batchModifySchedule" class="batch-form">
          <div class="form-group">
            <label>修改类型</label>
            <select v-model="batchModifyType" required>
              <option value="date">批量调整日期</option>
              <option value="amount">批量调整金额</option>
            </select>
          </div>
          
          <div v-if="batchModifyType === 'date'" class="form-group">
            <label>新的起始日期</label>
            <input v-model="batchModifyValue" type="date" required />
            <small>后续期数将自动按月递增</small>
          </div>
          
          <div v-if="batchModifyType === 'amount'" class="form-group">
            <label>调整比例 (%)</label>
            <input 
              v-model.number="batchModifyValue" 
              type="number" 
              step="0.1"
              placeholder="例如：5 表示增加5%，-10 表示减少10%"
              required 
            />
            <small>正数表示增加，负数表示减少</small>
          </div>
          
          <div class="preview-section" v-if="selectedSchedules.length > 0">
            <h4>预览前3期修改结果:</h4>
            <div class="preview-list">
              <div v-for="(schedule, index) in selectedSchedules.slice(0, 3)" :key="schedule.period_number" class="preview-item">
                <span>第{{ schedule.period_number }}期:</span>
                <span v-if="batchModifyType === 'date'">
                  {{ formatDate(schedule.due_date) }} → 
                  {{ formatPreviewDate(batchModifyValue, index) }}
                </span>
                <span v-if="batchModifyType === 'amount'">
                  ￥{{ schedule.total_amount?.toLocaleString() }} → 
                  ￥{{ schedule.total_amount && batchModifyValue ? PrecisionMath.toString(PrecisionMath.multiply(PrecisionMath.safeDecimal(schedule.total_amount), PrecisionMath.add(1, PrecisionMath.divide(PrecisionMath.safeDecimal(batchModifyValue, 0), 100)))) : '0.00' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showBatchModifyModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn" :disabled="isModifyingSchedule">
              {{ isModifyingSchedule ? '修改中...' : '确认批量修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 批量还款模态框 -->
    <div v-if="showBatchPaymentModal" class="modal-overlay" @click="showBatchPaymentModal = false">
      <div class="modal-content batch-payment-modal" @click.stop>
        <h3>批量还款</h3>
        
        <div class="batch-payment-form">
          <div class="form-group">
            <label>还款总金额</label>
            <input 
              v-model.number="batchPaymentForm.total_amount" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="请输入要还款的总金额"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>支付方式</label>
            <select v-model="batchPaymentForm.payment_method" required>
              <option value="">请选择支付方式</option>
              <option value="bank_transfer">银行转账</option>
              <option value="cash">现金</option>
              <option value="online_payment">在线支付</option>
              <option value="check">支票</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>交易号</label>
            <input v-model="batchPaymentForm.transaction_id" type="text" placeholder="可选" />
          </div>
          
          <div class="form-group">
            <label>还款日期</label>
            <input v-model="batchPaymentForm.paid_date" type="date" />
          </div>
          
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="batchPaymentForm.notes" rows="3" placeholder="批量还款备注..."></textarea>
          </div>
          
          <!-- 还款分配预览 -->
          <div v-if="batchPaymentPreview.length > 0" class="payment-preview">
            <h4>还款分配预览</h4>
            <div class="preview-summary">
              <p><strong>总金额:</strong> ￥{{ batchPaymentForm.total_amount?.toLocaleString() }}</p>
              <p><strong>可分配期数:</strong> {{ batchPaymentPreview.length }}期</p>
              <p><strong>剩余金额:</strong> ￥{{ batchPaymentRemaining?.toLocaleString() }}</p>
            </div>
            
            <div class="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>期数</th>
                    <th>应还总额</th>
                    <th>已还金额</th>
                    <th>剩余应还</th>
                    <th>本次还款</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in batchPaymentPreview.slice(0, 10)" :key="item.period_number">
                    <td>第{{ item.period_number }}期</td>
                    <td>￥{{ item.total_amount?.toLocaleString() }}</td>
                    <td>￥{{ (item.already_paid || 0).toLocaleString() }}</td>
                    <td>￥{{ (item.remaining_due_before || 0).toLocaleString() }}</td>
                    <td>￥{{ item.payment_amount?.toLocaleString() }}</td>
                    <td>
                      <span :class="['preview-status', item.payment_status]">
                        {{ item.payment_status === 'full' ? '还清剩余' : item.payment_status === 'partial' ? '部分还款' : '未还' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="batchPaymentPreview.length > 10" class="preview-more">
                还有 {{ batchPaymentPreview.length - 10 }} 期未显示...
              </div>
            </div>
          </div>
          
          <!-- 批量还款进度条 -->
          <div v-if="isBatchPaymentProcessing" class="batch-payment-progress">
            <h4>批量还款进度</h4>
            <div class="progress-info">
              <span>正在处理第 {{ batchPaymentCurrentPeriod }} / {{ batchPaymentTotalPeriods }} 期</span>
              <span class="progress-percentage">{{ batchPaymentProgress }}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: batchPaymentProgress + '%' }"></div>
            </div>
            <div class="progress-status">
              <small>请勿关闭窗口，正在处理批量还款...</small>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showBatchPaymentModal = false" class="cancel-btn">取消</button>
            <button type="button" @click="calculateBatchPayment" class="calc-btn" :disabled="!batchPaymentForm.total_amount">
              计算分配
            </button>
            <button 
              type="button" 
              @click="executeBatchPayment" 
              class="confirm-btn" 
              :disabled="isBatchPaymentProcessing || batchPaymentPreview.length === 0"
            >
              {{ isBatchPaymentProcessing ? '处理中...' : '确认批量还款' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 记录还款模态框 -->
    <div v-if="showRecordPaymentModal" class="modal-overlay" @click="showRecordPaymentModal = false">
      <div class="modal-content" @click.stop>
        <h3>记录还款</h3>
        <div v-if="selectedPaymentSchedule" class="payment-form">
          <div class="payment-info">
            <p><strong>期数:</strong> 第{{ selectedPaymentSchedule.period_number }}期</p>
            <p><strong>应还总额:</strong> ￥{{ selectedPaymentSchedule.total_amount?.toLocaleString() }}</p>
            <p><strong>已还金额:</strong> ￥{{ (selectedPaymentSchedule.paid_amount || 0).toLocaleString() }}</p>
            <p><strong>剩余应还:</strong> ￥{{ Math.max(0, (selectedPaymentSchedule.total_amount || 0) - (selectedPaymentSchedule.paid_amount || 0)).toLocaleString() }}</p>
            <p><strong>到期日期:</strong> {{ formatDate(selectedPaymentSchedule.due_date) }}</p>
          </div>
          
          <form @submit.prevent="recordPayment">
            <div class="form-group">
              <label>还款金额</label>
              <input 
                v-model.number="paymentForm.paid_amount" 
                type="number" 
                :max="Math.max(0, (selectedPaymentSchedule.total_amount || 0) - (selectedPaymentSchedule.paid_amount || 0))"
                step="0.01"
                required 
              />
              <small>最大可还款: ￥{{ Math.max(0, (selectedPaymentSchedule.total_amount || 0) - (selectedPaymentSchedule.paid_amount || 0)).toLocaleString() }}</small>
            </div>
            
            <div class="form-group">
              <label>支付方式</label>
              <select v-model="paymentForm.payment_method" required>
                <option value="">请选择支付方式</option>
                <option value="bank_transfer">银行转账</option>
                <option value="cash">现金</option>
                <option value="online_payment">在线支付</option>
                <option value="check">支票</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>交易号</label>
              <input v-model="paymentForm.transaction_id" type="text" />
            </div>
            
            <div class="form-group">
              <label>还款日期</label>
              <input v-model="paymentForm.paid_date" type="date" />
            </div>
            
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="paymentForm.notes" rows="3"></textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="showRecordPaymentModal = false" class="cancel-btn">取消</button>
              <button type="submit" class="confirm-btn" :disabled="isRecordingPayment">
                {{ isRecordingPayment ? '记录中...' : '确认记录' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 编辑贷款模态框 -->
    <div v-if="showEditLoanModal" class="modal-overlay" @click="showEditLoanModal = false">
      <div class="modal-content" @click.stop>
        <h3>编辑贷款</h3>
        <form @submit.prevent="updateLoan" v-if="editingLoan">
          <div class="form-group">
            <label>贷款名称</label>
            <input v-model="editingLoan.loanName" type="text" required />
          </div>
          <div class="form-group">
            <label>申请人</label>
            <input v-model="editingLoan.applicantName" type="text" required />
          </div>
          <div class="form-group">
            <label>贷款金额</label>
            <input v-model.number="editingLoan.amount" type="number" min="1000" max="10000000" step="100" required />
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model.number="editingLoan.interestRate" type="number" min="0.01" max="36" step="0.01" required />
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="editingLoan.bank" type="text" required />
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model.number="editingLoan.term" type="number" min="1" max="360" step="1" required />
          </div>
          <div class="form-group">
            <label>还款方式</label>
            <select v-model="editingLoan.repaymentMethod" required>
              <option value="等额本息">等额本息</option>
              <option value="等额本金">等额本金</option>
            </select>
          </div>
          <div class="form-group">
            <label>申请状态</label>
            <select v-model="editingLoan.status">
              <option value="pending">待审批</option>
              <option value="approved">已批准</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditLoanModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加用户模态框 -->
    <div v-if="showAddUserModal" class="modal-overlay" @click="showAddUserModal = false">
      <div class="modal-content" @click.stop>
        <h3>添加用户</h3>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label>用户名 *</label>
            <input v-model="newUser.username" type="text" required placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>密码 *</label>
            <input v-model="newUser.password" type="password" required placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="newUser.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddUserModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">添加用户</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑用户模态框 -->
    <div v-if="showEditUserModal" class="modal-overlay" @click="showEditUserModal = false">
      <div class="modal-content" @click.stop>
        <h3>编辑用户</h3>
        <form @submit.prevent="updateUser">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="editingUser.username" type="text" disabled />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="editingUser.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditUserModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">保存修改</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看用户详情模态框 -->
    <div v-if="showUserDetailModal" class="modal-overlay" @click="showUserDetailModal = false">
      <div class="modal-content" @click.stop>
        <h3>用户详情</h3>
        <div v-if="selectedUser" class="user-detail">
          <div class="detail-row">
            <label>用户ID:</label>
            <span>{{ selectedUser._id }}</span>
          </div>
          <div class="detail-row">
            <label>用户名:</label>
            <span>{{ selectedUser.username }}</span>
          </div>
          <div class="detail-row">
            <label>角色:</label>
            <span>{{ selectedUser.role === 'admin' ? '管理员' : '普通用户' }}</span>
          </div>
          <div class="detail-row">
            <label>注册时间:</label>
            <span>{{ formatDate(selectedUser.created_at) }}</span>
          </div>
          <div class="detail-row">
            <label>最后登录:</label>
            <span>{{ selectedUser.last_login ? formatDate(selectedUser.last_login) : '从未登录' }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showUserDetailModal = false" class="confirm-btn">关闭</button>
        </div>
      </div>
    </div>

    <!-- 日志详情模态框 -->
    <div v-if="showLogDetailModal" class="modal-overlay" @click="showLogDetailModal = false">
      <div class="modal-content log-detail-modal" @click.stop>
        <h3>日志详情</h3>
        <div v-if="selectedLog" class="log-detail">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-row">
              <label>时间:</label>
              <span>{{ formatDate(selectedLog.created_at) }}</span>
            </div>
            <div class="detail-row">
              <label>级别:</label>
              <span :class="['level-badge', selectedLog.level]">{{ getLevelText(selectedLog.level) }}</span>
            </div>
            <div class="detail-row">
              <label>模块:</label>
              <span class="module-badge">{{ getModuleText(selectedLog.module) }}</span>
            </div>
            <div class="detail-row">
              <label>操作:</label>
              <span>{{ selectedLog.action }}</span>
            </div>
            <div class="detail-row">
              <label>消息:</label>
              <span>{{ selectedLog.message }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>用户信息</h4>
            <div class="detail-row">
              <label>用户:</label>
              <span>{{ selectedLog.username || '系统' }}</span>
            </div>
            <div class="detail-row">
              <label>IP地址:</label>
              <span>{{ selectedLog.ip_address }}</span>
            </div>
            <div class="detail-row">
              <label>用户代理:</label>
              <span class="text-small">{{ selectedLog.user_agent || '未知' }}</span>
            </div>
          </div>

          <div v-if="selectedLog.request_method" class="detail-section">
            <h4>请求信息</h4>
            <div class="detail-row">
              <label>请求方法:</label>
              <span :class="['method-badge', selectedLog.request_method?.toLowerCase()]">{{ selectedLog.request_method }}</span>
            </div>
            <div class="detail-row">
              <label>请求URL:</label>
              <span class="text-small">{{ selectedLog.request_url }}</span>
            </div>
            <div class="detail-row">
              <label>响应状态:</label>
              <span :class="['status-badge', getStatusClass(selectedLog.response_status)]">{{ selectedLog.response_status }}</span>
            </div>
            <div v-if="selectedLog.response_time" class="detail-row">
              <label>响应时间:</label>
              <span>{{ selectedLog.response_time }}ms</span>
            </div>
          </div>

          <div v-if="selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0" class="detail-section">
            <h4>元数据</h4>
            <pre class="metadata-block">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>

          <div v-if="selectedLog.error_details || selectedLog.stack_trace" class="detail-section">
            <h4>错误信息</h4>
            <div v-if="selectedLog.error_details" class="detail-row">
              <label>错误详情:</label>
              <span class="error-text">{{ selectedLog.error_details }}</span>
            </div>
            <div v-if="selectedLog.stack_trace" class="detail-row">
              <label>堆栈跟踪:</label>
              <pre class="stack-trace">{{ selectedLog.stack_trace }}</pre>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showLogDetailModal = false" class="confirm-btn">关闭</button>
        </div>
      </div>
    </div>

    <!-- 清理日志模态框 -->
    <div v-if="showLogCleanupModal" class="modal-overlay" @click="showLogCleanupModal = false">
      <div class="modal-content" @click.stop>
        <h3>清理系统日志</h3>
        <div class="cleanup-form">
          <p>清理操作将删除指定天数之前的所有日志记录，此操作不可撤销。</p>
          <div class="form-group">
            <label>保留天数:</label>
            <select v-model="cleanupDays">
              <option value="7">7天</option>
              <option value="30">30天</option>
              <option value="60">60天</option>
              <option value="90">90天</option>
            </select>
          </div>
          <div class="warning-note">
            ⚠️ 此操作将删除 {{ cleanupDays }} 天前的所有日志记录
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showLogCleanupModal = false" class="cancel-btn">取消</button>
          <button @click="cleanupLogs" class="danger-btn" :disabled="isCleaningLogs">
            {{ isCleaningLogs ? '清理中...' : '确认清理' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义确认对话框 -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>{{ confirmDialog.title }}</h3>
        </div>
        <div class="confirm-content">
          <p>{{ confirmDialog.message }}</p>
        </div>
        <div class="confirm-actions">
          <button @click="handleCancel" class="cancel-btn">{{ confirmDialog.cancelText }}</button>
          <button @click="handleConfirm" class="danger-btn">{{ confirmDialog.confirmText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { loanService, userService, logService, loanCalculatorService, repaymentService } from '../services/index.js'
import PrecisionMath from '../utils/precisionMath.js'

export default {
  name: 'AdminDashboard',
  emits: ['go-to-login'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    // 响应式数据
    const activeTab = ref('overview')
    const showAddLoanModal = ref(false)
    const showViewLoanModal = ref(false)
    const showEditLoanModal = ref(false)
    const showRecordPaymentModal = ref(false)
    const showModifyScheduleModal = ref(false)
    const showBatchModifyModal = ref(false)
    const showBatchPaymentModal = ref(false)
    const showAddUserModal = ref(false)
    const showEditUserModal = ref(false)
    const showUserDetailModal = ref(false)
    const showLogDetailModal = ref(false)
    const showLogCleanupModal = ref(false)
    const isLoading = ref(false)
    const error = ref(null)
    const activeDetailTab = ref('basic')
    
    // 计算相关状态
    const isCalculating = ref(false)
    const calculationResult = ref(null)
    
    // 还款计划相关状态
    const isLoadingRepayment = ref(false)
    const repaymentSchedule = ref([])
    const repaymentStats = ref(null)
    const selectedPaymentSchedule = ref(null)
    const isRecordingPayment = ref(false)
    
    // 批量还款相关状态
    const isBatchPaymentProcessing = ref(false)
    const batchPaymentPreview = ref([])
    const batchPaymentRemaining = ref(0)
    const batchPaymentProgress = ref(0)
    const batchPaymentCurrentPeriod = ref(0)
    const batchPaymentTotalPeriods = ref(0)
    
    // 通知系统
    const notifications = ref([])
    let notificationId = 0
    
    // 确认对话框系统
    const showConfirmDialog = ref(false)
    const confirmDialog = reactive({
      title: '',
      message: '',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: null,
      onCancel: null
    })
    
    // 数据状态
    const loans = ref([])
    const users = ref([])
    const logs = ref([])
    const selectedUser = ref(null)
    const selectedLog = ref(null)
    const statistics = ref({
      totalLoans: 0,
      pendingLoans: 0,
      approvedLoans: 0,
      totalUsers: 0
    })

    // 日志相关状态
    const isLoadingLogs = ref(false)
    const isCleaningLogs = ref(false)
    const logStats = ref(null)
    const logPagination = ref({
      current_page: 1,
      per_page: 20,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    })
    const cleanupDays = ref(30)
    
    // 新贷款表单数据
    const newLoan = reactive({
      loanName: '',
      applicantName: '',
      amount: 0,
      interestRate: 0,
      bank: '',
      term: 0,
      repaymentMethod: ''
    })
    
    // 选中的贷款和编辑表单
    const selectedLoan = ref(null)
    const editingLoan = reactive({
      id: null,
      loanName: '',
      applicantName: '',
      amount: 0,
      interestRate: 0,
      bank: '',
      term: 0,
      repaymentMethod: '',
      status: 'pending'
    })

    // 用户表单数据
    const newUser = reactive({
      username: '',
      password: '',
      role: 'user'
    })

    const editingUser = reactive({
      _id: '',
      username: '',
      role: 'user'
    })
    
    // 还款表单数据
    const paymentForm = reactive({
      paid_amount: 0,
      payment_method: '',
      transaction_id: '',
      paid_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    
    // 批量还款表单数据
    const batchPaymentForm = reactive({
      total_amount: 0,
      payment_method: '',
      transaction_id: '',
      paid_date: new Date().toISOString().split('T')[0],
      notes: ''
    })

    // 修改还款计划表单数据
    const modifyScheduleForm = reactive({
      period_number: 0,
      due_date: '',
      total_amount: 0,
      principal_amount: 0,
      interest_amount: 0,
      late_fee: 0,
      notes: ''
    })

    // 批量修改相关状态
    const selectedSchedules = ref([])
    const batchModifyType = ref('date') // 'date', 'amount', 'custom'
    const batchModifyValue = ref('')
    const isModifyingSchedule = ref(false)
    
    // 菜单项
    const menuItems = [
      { id: 'overview', icon: '📊', text: '贷款管理' },
      { id: 'users', icon: '👥', text: '用户管理' },
      { id: 'logs', icon: '📋', text: '系统日志' }
    ]
    
    // 计算属性
    const currentUser = computed(() => authStore.state.user)
    
    // 获取贷款列表
    const fetchLoans = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        const result = await loanService.getLoans()
        
        console.log('获取贷款列表完整响应:', result)
        console.log('响应成功状态:', result.success)
        console.log('响应数据:', result.data)
        
        if (result.success) {
          // 检查数据结构并转换字段名
          if (result.data && result.data.items && Array.isArray(result.data.items)) {
            // 转换下划线格式到驼峰格式
            loans.value = result.data.items.map(loan => ({
              id: loan._id,
              loanName: loan.loan_name,
              applicantName: loan.applicant_name,
              amount: loan.amount,
              interestRate: loan.interest_rate,
              bank: loan.bank,
              term: loan.term,
              repaymentMethod: loan.repayment_method,
              status: loan.status,
              applicationDate: loan.created_at ? new Date(loan.created_at).toLocaleDateString() : '未知',
              applicantId: loan.applicant_id?._id || loan.applicant_id
            }))
            console.log('使用 result.data.items 数组并转换格式:', loans.value)
            console.log('原始数据示例:', result.data.items[0])
          } else {
            console.warn('未预期的数据结构:', result.data)
            loans.value = []
          }
          
          console.log('最终设置的贷款列表:', loans.value)
          console.log('贷款数量:', loans.value.length)
          
          // 更新统计信息
          updateStatistics()
        } else {
          error.value = result.message
          console.error('获取贷款列表失败:', result.message)
        }
      } catch (err) {
        error.value = '获取贷款列表失败'
        console.error('获取贷款列表错误:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // 获取用户列表
    const fetchUsers = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        const result = await userService.getUsers()
        
        if (result.success) {
          users.value = result.data.items || result.data.users || []
        } else {
          error.value = result.message
          console.error('获取用户列表失败:', result.message)
        }
      } catch (err) {
        error.value = '获取用户列表失败'
        console.error('获取用户列表错误:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 添加用户
    const addUser = async () => {
      try {
        const result = await userService.createUser(newUser)
        
        if (result.success) {
          showNotification('用户添加成功', 'success')
          showAddUserModal.value = false
          
          // 重置表单
          Object.assign(newUser, {
            username: '',
            password: '',
            role: 'user'
          })
          
          // 重新加载用户列表
          await fetchUsers()
        } else {
          showNotification(result.message || '添加用户失败', 'error')
        }
      } catch (error) {
        console.error('添加用户错误:', error)
        showNotification('添加用户失败，请稍后重试', 'error')
      }
    }

    // 编辑用户
    const editUser = (user) => {
      Object.assign(editingUser, {
        _id: user._id,
        username: user.username,
        role: user.role
      })
      showEditUserModal.value = true
    }

    // 更新用户
    const updateUser = async () => {
      try {
        const updateData = {
          role: editingUser.role
        }
        
        const result = await userService.updateUser(editingUser._id, updateData)
        
        if (result.success) {
          showNotification('用户信息更新成功', 'success')
          showEditUserModal.value = false
          
          // 重新加载用户列表
          await fetchUsers()
        } else {
          showNotification(result.message || '更新用户信息失败', 'error')
        }
      } catch (error) {
        console.error('更新用户错误:', error)
        showNotification('更新用户信息失败，请稍后重试', 'error')
      }
    }

    // 查看用户详情
    const viewUser = (user) => {
      selectedUser.value = user
      showUserDetailModal.value = true
    }



    // 删除用户
    const deleteUser = (user) => {
      showConfirm(
        '确认删除用户',
        `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`,
        async () => {
          try {
            const result = await userService.deleteUser(user._id)
            
            if (result.success) {
              showNotification('用户删除成功', 'success')
              // 重新加载用户列表
              await fetchUsers()
            } else {
              showNotification(result.message || '删除用户失败', 'error')
            }
          } catch (error) {
            console.error('删除用户错误:', error)
            showNotification('删除用户失败，请稍后重试', 'error')
          }
        }
      )
    }

    // 获取系统日志
    const fetchLogs = async (page = 1) => {
      isLoadingLogs.value = true
      
      try {
        const params = {
          page: typeof page === 'number' ? page : 1,
          per_page: logPagination.value.per_page
        }

        const result = await logService.getLogs(params)
        
        if (result.success) {
          logs.value = result.data.items || []
          logPagination.value = result.data.pagination
          
          // 获取统计信息
          await fetchLogStatistics()
        } else {
          showNotification(result.message || '获取日志失败', 'error')
        }
      } catch (error) {
        console.error('获取日志错误:', error)
        showNotification('获取日志失败，请稍后重试', 'error')
      } finally {
        isLoadingLogs.value = false
      }
    }

    // 获取日志统计
    const fetchLogStatistics = async () => {
      try {
        const result = await logService.getLogStatistics(7)
        
        if (result.success) {
          logStats.value = result.data
        }
      } catch (error) {
        console.error('获取日志统计错误:', error)
      }
    }

    // 刷新日志
    const refreshLogs = () => {
      fetchLogs(logPagination.value.current_page)
    }

    // 改变页面
    const changePage = (page) => {
      if (page >= 1 && page <= logPagination.value.total_pages) {
        fetchLogs(page)
      }
    }

    // 查看日志详情
    const viewLogDetail = (log) => {
      selectedLog.value = log
      showLogDetailModal.value = true
    }

    // 清理日志
    const cleanupLogs = async () => {
      isCleaningLogs.value = true
      
      try {
        const result = await logService.cleanupLogs(cleanupDays.value)
        
        if (result.success) {
          showNotification(`成功清理 ${result.data.deleted_count} 条日志`, 'success')
          showLogCleanupModal.value = false
          
          // 重新加载日志
          await fetchLogs(1)
        } else {
          showNotification(result.message || '清理日志失败', 'error')
        }
      } catch (error) {
        console.error('清理日志错误:', error)
        showNotification('清理日志失败，请稍后重试', 'error')
      } finally {
        isCleaningLogs.value = false
      }
    }

    // 获取级别文本
    const getLevelText = (level) => {
      const levelMap = {
        debug: '调试',
        info: '信息',
        warning: '警告',
        error: '错误'
      }
      return levelMap[level] || level
    }

    // 获取模块文本
    const getModuleText = (module) => {
      const moduleMap = {
        auth: '认证',
        user: '用户',
        loan: '贷款',
        system: '系统',
        upload: '上传'
      }
      return moduleMap[module] || module
    }

    // 获取状态码样式类
    const getStatusClass = (status) => {
      if (status >= 200 && status < 300) return 'success'
      if (status >= 300 && status < 400) return 'redirect'
      if (status >= 400 && status < 500) return 'client-error'
      if (status >= 500) return 'server-error'
      return 'unknown'
    }
    
    // 获取统计信息
    const fetchStatistics = async () => {
      try {
        const result = await loanService.getLoanStatistics()
        
        if (result.success) {
          statistics.value = result.data
        }
      } catch (err) {
        console.error('获取统计信息错误:', err)
      }
    }
    
    // 更新统计信息（基于本地数据）
    const updateStatistics = () => {
      statistics.value.totalLoans = loans.value.length
      statistics.value.pendingLoans = loans.value.filter(loan => loan.status === 'pending').length
      statistics.value.approvedLoans = loans.value.filter(loan => loan.status === 'approved').length
    }
    
    // 添加贷款
    const addLoan = async () => {
      if (!validateLoanForm()) return
      
      // 检查认证状态
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      console.log('Token状态:', token ? `存在 (长度: ${token.length})` : '不存在')
      console.log('用户状态:', user ? `存在: ${user}` : '不存在')
      
      // 关键：验证申请人姓名问题
      console.log('🔍 验证申请人姓名问题:')
      console.log('前端发送的申请人姓名:', newLoan.applicantName)
      
      isLoading.value = true
      
      try {
        // 还款方式映射：中文转英文
        const repaymentMethodMap = {
          '等额本息': 'equal_payment',
          '等额本金': 'equal_principal'
        }
        
        const loanData = {
          loan_name: newLoan.loanName,
          applicant_name: newLoan.applicantName,
          amount: PrecisionMath.toNumber(PrecisionMath.safeDecimal(newLoan.amount)),
          interest_rate: PrecisionMath.toNumber(PrecisionMath.safeDecimal(newLoan.interestRate)),
          bank: newLoan.bank,
          term: PrecisionMath.toNumber(PrecisionMath.safeDecimal(newLoan.term)),
          repayment_method: repaymentMethodMap[newLoan.repaymentMethod] || newLoan.repaymentMethod,
          applicant_id: currentUser.value?.id || currentUser.value?._id || 1,
          status: 'pending'
        }
        
        console.log('发送给后端的申请人姓名:', loanData.applicant_name)
        
        const result = await loanService.createLoan(loanData)
        
        // 检查后端是否覆盖了申请人姓名
        if (result.success && result.data?.loan) {
          const backendApplicantName = result.data.loan.applicant_name
          console.log('后端返回的申请人姓名:', backendApplicantName)
          
          if (backendApplicantName !== loanData.applicant_name) {
            console.warn('⚠️ 后端覆盖了申请人姓名！')
            console.warn(`发送: "${loanData.applicant_name}" -> 返回: "${backendApplicantName}"`)
            console.warn('这是后端的问题，请查看 BACKEND_ISSUE_GUIDE.md')
          }
        }
        
        if (result.success) {
          // 重新获取贷款列表
          await fetchLoans()
          
          // 重置表单
          resetLoanForm()
          showAddLoanModal.value = false
          
          showNotification('贷款添加成功！', 'success')
        } else {
          console.error('添加失败详情:', result)
          console.error('错误信息:', result.message)
          console.error('详细错误:', result.errors)
          showNotification(`添加失败: ${result.message}`, 'error')
        }
      } catch (err) {
        console.error('添加贷款完整错误:', err)
        console.error('错误响应:', err.response?.data)
        showNotification('添加贷款失败，请稍后重试', 'error')
      } finally {
        isLoading.value = false
      }
    }
    
    // 审批贷款
    const approveLoan = async (loan) => {
      showConfirm(
        '确认审批',
        `确定要审批贷款 "${loan.loanName}" 吗？`,
        async () => {
          isLoading.value = true
          
          try {
            const approvalData = {
              status: 'approved',
              approved_amount: loan.amount,
              approved_rate: loan.interestRate,
              remark: '管理员审批通过'
            }
            const result = await loanService.approveLoan(loan.id, approvalData)
            
            if (result.success) {
              // 重新获取贷款列表
              await fetchLoans()
              showNotification('贷款审批成功！', 'success')
            } else {
              showNotification(`审批失败: ${result.message}`, 'error')
            }
          } catch (err) {
            showNotification('审批失败，请稍后重试', 'error')
            console.error('审批贷款错误:', err)
          } finally {
            isLoading.value = false
          }
        }
      )
    }
    
    // 删除贷款
    const deleteLoan = async (loan) => {
      showConfirm(
        '确认删除',
        `确定要删除贷款 "${loan.loanName}" 吗？此操作不可撤销。`,
        async () => {
          isLoading.value = true
          
          try {
            const result = await loanService.deleteLoan(loan.id)
            
            if (result.success) {
              // 重新获取贷款列表
              await fetchLoans()
              showNotification('贷款删除成功！', 'success')
            } else {
              showNotification(`删除失败: ${result.message}`, 'error')
            }
          } catch (err) {
            showNotification('删除失败，请稍后重试', 'error')
            console.error('删除贷款错误:', err)
          } finally {
            isLoading.value = false
          }
        }
      )
    }
    
    // 查看贷款详情
    const viewLoan = (loan) => {
      selectedLoan.value = loan
      console.log('选中的贷款信息:', loan)
      console.log('贷款基本数据:', {
        amount: loan.amount,
        interestRate: loan.interestRate,
        term: loan.term,
        repaymentMethod: loan.repaymentMethod
      })
      showViewLoanModal.value = true
      activeDetailTab.value = 'basic'
      // 重置计算结果和还款数据
      calculationResult.value = null
      repaymentSchedule.value = []
      repaymentStats.value = null
      selectedPaymentSchedule.value = null
    }
    
    // 编辑贷款
    const editLoan = (loan) => {
      Object.assign(editingLoan, {
        id: loan.id,
        loanName: loan.loanName,
        applicantName: loan.applicantName,
        amount: loan.amount,
        interestRate: loan.interestRate,
        bank: loan.bank,
        term: loan.term,
        repaymentMethod: loan.repaymentMethod,
        status: loan.status
      })
      showEditLoanModal.value = true
    }
    
    // 更新贷款
    const updateLoan = async () => {
      if (!validateEditLoanForm()) return
      
      isLoading.value = true
      
      try {
        const result = await loanService.updateLoan(editingLoan.id, {
          loanName: editingLoan.loanName,
          applicantName: editingLoan.applicantName,
          amount: editingLoan.amount,
          interestRate: editingLoan.interestRate,
          bank: editingLoan.bank,
          term: editingLoan.term,
          repaymentMethod: editingLoan.repaymentMethod,
          status: editingLoan.status
        })
        
        if (result.success) {
          // 重新获取贷款列表
          await fetchLoans()
          showEditLoanModal.value = false
          showNotification('贷款更新成功！', 'success')
        } else {
          showNotification(`更新失败: ${result.message}`, 'error')
        }
      } catch (err) {
        showNotification('更新贷款失败，请稍后重试', 'error')
        console.error('更新贷款错误:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // 验证贷款表单
    const validateLoanForm = () => {
      if (!newLoan.loanName.trim()) {
        showNotification('请输入贷款名称', 'warning')
        return false
      }
      if (!newLoan.applicantName.trim()) {
        showNotification('请输入申请人姓名', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(newLoan.amount)) {
        showNotification('请输入有效的贷款金额', 'warning')
        return false
      }
      const amount = PrecisionMath.safeDecimal(newLoan.amount)
      if (PrecisionMath.lessThan(amount, 1000)) {
        showNotification('请输入有效的贷款金额（最少1000元）', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(newLoan.interestRate)) {
        showNotification('请输入有效的年利率', 'warning')
        return false
      }
      const interestRate = PrecisionMath.safeDecimal(newLoan.interestRate)
      if (PrecisionMath.lessThanOrEqual(interestRate, 0) || PrecisionMath.greaterThan(interestRate, 36)) {
        showNotification('请输入有效的年利率（0-36%）', 'warning')
        return false
      }
      
      if (!newLoan.bank.trim()) {
        showNotification('请输入贷款银行', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(newLoan.term)) {
        showNotification('请输入有效的还款期限', 'warning')
        return false
      }
      const term = PrecisionMath.safeDecimal(newLoan.term)
      if (PrecisionMath.lessThanOrEqual(term, 0) || PrecisionMath.greaterThan(term, 360)) {
        showNotification('请输入有效的还款期限（1-360个月）', 'warning')
        return false
      }
      
      if (!newLoan.repaymentMethod) {
        showNotification('请选择还款方式', 'warning')
        return false
      }
      return true
    }
    
    // 重置贷款表单
    const resetLoanForm = () => {
      Object.assign(newLoan, {
        loanName: '',
        applicantName: '',
        amount: 0,
        interestRate: 0,
        bank: '',
        term: 0,
        repaymentMethod: ''
      })
    }
    
    // 验证编辑贷款表单
    const validateEditLoanForm = () => {
      if (!editingLoan.loanName.trim()) {
        showNotification('请输入贷款名称', 'warning')
        return false
      }
      if (!editingLoan.applicantName.trim()) {
        showNotification('请输入申请人姓名', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(editingLoan.amount)) {
        showNotification('请输入有效的贷款金额', 'warning')
        return false
      }
      const amount = PrecisionMath.safeDecimal(editingLoan.amount)
      if (PrecisionMath.lessThan(amount, 1000)) {
        showNotification('请输入有效的贷款金额（最少1000元）', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(editingLoan.interestRate)) {
        showNotification('请输入有效的年利率', 'warning')
        return false
      }
      const interestRate = PrecisionMath.safeDecimal(editingLoan.interestRate)
      if (PrecisionMath.lessThanOrEqual(interestRate, 0) || PrecisionMath.greaterThan(interestRate, 36)) {
        showNotification('请输入有效的年利率（0-36%）', 'warning')
        return false
      }
      
      if (!editingLoan.bank.trim()) {
        showNotification('请输入贷款银行', 'warning')
        return false
      }
      
      if (!PrecisionMath.isValidNumber(editingLoan.term)) {
        showNotification('请输入有效的还款期限', 'warning')
        return false
      }
      const term = PrecisionMath.safeDecimal(editingLoan.term)
      if (PrecisionMath.lessThanOrEqual(term, 0) || PrecisionMath.greaterThan(term, 360)) {
        showNotification('请输入有效的还款期限（1-360个月）', 'warning')
        return false
      }
      
      if (!editingLoan.repaymentMethod) {
        showNotification('请选择还款方式', 'warning')
        return false
      }
      return true
    }
    
    // 获取还款方式中文文本
    const getRepaymentMethodText = (method) => {
      const methodMap = {
        'equal_payment': '等额本息',
        'equal_principal': '等额本金'
      }
      return methodMap[method] || method
    }
    
    // 获取贷款状态文本
    const getLoanStatusText = (status) => {
      const statusMap = {
        pending: '待审批',
        approved: '已批准',
        rejected: '已拒绝',
        completed: '已完成'
      }
      return statusMap[status] || status
    }
    
    // 贷款计算功能
    const calculateLoan = async (type) => {
      if (!selectedLoan.value) return
      
      console.log('开始计算贷款，类型:', type)
      console.log('贷款数据:', selectedLoan.value)
      
      isCalculating.value = true
      
      try {
        const principal = PrecisionMath.toNumber(PrecisionMath.safeDecimal(selectedLoan.value.amount))
        const annualRate = PrecisionMath.toNumber(PrecisionMath.divide(PrecisionMath.safeDecimal(selectedLoan.value.interestRate), 100))
        const months = PrecisionMath.toNumber(PrecisionMath.safeDecimal(selectedLoan.value.term))
        
        console.log('计算参数:', { principal, annualRate, months })
        
        if (type === 'equal-installment') {
          try {
            const result = await loanCalculatorService.calculateEqualInstallment(principal, annualRate, months)
            console.log('等额本息API返回结果:', result)
            calculationResult.value = result.success ? result.data : result
          } catch (error) {
            console.warn('API计算失败，使用本地计算:', error)
            const localResult = loanCalculatorService.calculateEqualInstallmentLocal(principal, annualRate, months)
            console.log('等额本息本地计算结果:', localResult)
            calculationResult.value = localResult
          }
        } else if (type === 'equal-principal') {
          try {
            const result = await loanCalculatorService.calculateEqualPrincipal(principal, annualRate, months)
            console.log('等额本金API返回结果:', result)
            calculationResult.value = result.success ? result.data : result
          } catch (error) {
            console.warn('API计算失败，使用本地计算:', error)
            const localResult = loanCalculatorService.calculateEqualPrincipalLocal(principal, annualRate, months)
            console.log('等额本金本地计算结果:', localResult)
            calculationResult.value = localResult
          }
        } else if (type === 'compare') {
          try {
            const result = await loanCalculatorService.compareRepaymentMethods(principal, annualRate, months)
            console.log('比较方式API返回结果:', result)
            calculationResult.value = result.success ? result.data : result
          } catch (error) {
            console.warn('API比较失败，使用本地计算:', error)
            const equalInstallment = loanCalculatorService.calculateEqualInstallmentLocal(principal, annualRate, months)
            const equalPrincipal = loanCalculatorService.calculateEqualPrincipalLocal(principal, annualRate, months)
            
            const localResult = {
              equalInstallment,
              equalPrincipal,
              comparison: {
                interestDifference: equalInstallment.totalInterest - equalPrincipal.totalInterest,
                paymentDifference: equalInstallment.totalPayment - equalPrincipal.totalPayment,
                recommendation: `等额本金比等额本息少支付利息 ${(equalInstallment.totalInterest - equalPrincipal.totalInterest).toLocaleString()} 元`
              }
            }
            console.log('比较方式本地计算结果:', localResult)
            calculationResult.value = localResult
          }
        }
      } catch (error) {
        console.error('贷款计算失败:', error)
        showNotification('计算失败，请稍后重试', 'error')
      } finally {
        isCalculating.value = false
        console.log('计算完成，最终结果:', calculationResult.value)
      }
    }
    
    // 加载还款计划
    const loadRepaymentSchedule = async () => {
      if (!selectedLoan.value || !selectedLoan.value.id) {
        console.error('贷款ID无效，无法加载还款计划')
        showNotification('贷款ID无效，无法加载还款计划', 'error')
        return
      }
      
      isLoadingRepayment.value = true
      console.log('开始加载还款计划，贷款ID:', selectedLoan.value.id)
      
      try {
        // 同时获取还款计划和统计信息
        const [scheduleResult, statsResult] = await Promise.all([
          repaymentService.getRepaymentSchedule(selectedLoan.value.id, 1, 500),
          repaymentService.getPaymentStats(selectedLoan.value.id)
        ])
        
        console.log('还款计划API响应:', scheduleResult)
        console.log('还款统计API响应:', statsResult)
        
        // 处理还款计划数据（支持多种API响应格式）
        let scheduleData = []
        if (scheduleResult.success && scheduleResult.data) {
          if (Array.isArray(scheduleResult.data)) {
            scheduleData = scheduleResult.data
          } else if (scheduleResult.data.items) {
            scheduleData = scheduleResult.data.items
          } else if (scheduleResult.data.repayment_schedule) {
            scheduleData = scheduleResult.data.repayment_schedule
          } else if (scheduleResult.data.schedules) {
            scheduleData = scheduleResult.data.schedules
          }
        } else if (Array.isArray(scheduleResult)) {
          scheduleData = scheduleResult
        } else if (scheduleResult.items) {
          scheduleData = scheduleResult.items
        }
        
        // 处理还款统计数据
        let statsData = null
        if (statsResult.success && statsResult.data) {
          statsData = statsResult.data
        } else if (statsResult && typeof statsResult === 'object') {
          statsData = statsResult
        }
        
        repaymentSchedule.value = scheduleData
        repaymentStats.value = statsData
        
        console.log('处理后的还款计划:', repaymentSchedule.value)
        console.log('处理后的还款统计:', repaymentStats.value)
        
        if (!scheduleData || scheduleData.length === 0) {
          console.warn('后端未返回还款计划数据')
          showNotification('后端未返回还款计划数据，请检查后端实现', 'warning')
        } else {
          console.log('第一期数据示例:', scheduleData[0])
          showNotification('还款计划加载成功', 'success')
        }
        
      } catch (error) {
        console.error('获取还款计划失败:', error)
        console.error('错误详情:', error.response?.data)
        
        // 显示具体错误信息
        const errorMessage = error.response?.data?.message || error.message || '获取还款计划失败'
        showNotification(`获取还款计划失败: ${errorMessage}`, 'error')
        
        // 清空数据
        repaymentSchedule.value = []
        repaymentStats.value = null
      } finally {
        isLoadingRepayment.value = false
      }
    }
    

    
    // 选择还款计划项
    const selectPaymentSchedule = (schedule) => {
      selectedPaymentSchedule.value = schedule
      
      // 计算剩余应还金额（考虑已还部分）
      const totalDue = schedule.total_amount || 0
      const alreadyPaid = schedule.paid_amount || 0
      const remainingDue = Math.max(0, totalDue - alreadyPaid)
      
      // 设置默认还款金额为剩余应还金额
      paymentForm.paid_amount = remainingDue
      
      console.log(`选择第${schedule.period_number}期: 应还=${totalDue}, 已还=${alreadyPaid}, 剩余=${remainingDue}`)
      
      showRecordPaymentModal.value = true
    }
    
    // 记录还款
    const recordPayment = async () => {
      if (!selectedLoan.value || !selectedPaymentSchedule.value) return
      
      isRecordingPayment.value = true
      
      try {
        if (selectedLoan.value.id) {
          // 尝试调用API记录还款
          const result = await repaymentService.recordPayment(
            selectedLoan.value.id,
            selectedPaymentSchedule.value.period_number,
            paymentForm
          )
          
          if (result.success) {
            showNotification('还款记录成功！', 'success')
            showRecordPaymentModal.value = false
            // 重新加载还款计划
            await loadRepaymentSchedule()
          } else {
            showNotification(`记录失败: ${result.message}`, 'error')
          }
        } else {
          showNotification('贷款ID无效，无法记录还款', 'error')
        }
      } catch (error) {
        console.error('记录还款失败:', error)
        showNotification('记录还款失败，请稍后重试', 'error')
      } finally {
        isRecordingPayment.value = false
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      return repaymentService.formatDate(dateString)
    }

    // 格式化预览日期
    const formatPreviewDate = (baseDate, index) => {
      if (!baseDate) return ''
      const date = new Date(baseDate)
      date.setMonth(date.getMonth() + index)
      return date.toLocaleDateString('zh-CN')
    }
    
    // 获取还款状态文本
    const getPaymentStatusText = (status) => {
      return repaymentService.getPaymentStatusText(status)
    }

    // 选择要修改的还款计划项
    const selectScheduleForModify = (schedule) => {
      if (schedule.status === 'paid') {
        showNotification('已完成的还款不能修改', 'warning')
        return
      }
      
      Object.assign(modifyScheduleForm, {
        period_number: schedule.period_number,
        due_date: schedule.due_date.split('T')[0], // 转换为YYYY-MM-DD格式
        total_amount: schedule.total_amount,
        principal_amount: schedule.principal_amount,
        interest_amount: schedule.interest_amount,
        late_fee: schedule.late_fee || 0,
        notes: ''
      })
      
      showModifyScheduleModal.value = true
    }

    // 修改单期还款计划
    const modifySchedule = async () => {
      if (!selectedLoan.value || !modifyScheduleForm.period_number) return

      // 验证数据
      const errors = repaymentService.validateModificationData(modifyScheduleForm)
      if (errors.length > 0) {
        showNotification(errors.join(', '), 'error')
        return
      }

      isModifyingSchedule.value = true
      
      try {
        const updateData = {
          due_date: modifyScheduleForm.due_date,
          total_amount: modifyScheduleForm.total_amount,
          principal_amount: modifyScheduleForm.principal_amount,
          interest_amount: modifyScheduleForm.interest_amount,
          late_fee: modifyScheduleForm.late_fee,
          notes: modifyScheduleForm.notes
        }

        const result = await repaymentService.modifySchedulePeriod(
          selectedLoan.value.id,
          modifyScheduleForm.period_number,
          updateData
        )

        if (result.success) {
          showNotification('还款计划修改成功！', 'success')
          showModifyScheduleModal.value = false
          
          // 重新加载还款计划
          await loadRepaymentSchedule()
        } else {
          showNotification(`修改失败: ${result.message}`, 'error')
        }
      } catch (error) {
        console.error('修改还款计划失败:', error)
        showNotification('修改失败，请稍后重试', 'error')
      } finally {
        isModifyingSchedule.value = false
      }
    }

    // 切换批量选择
    const toggleScheduleSelection = (schedule) => {
      const index = selectedSchedules.value.findIndex(s => s.period_number === schedule.period_number)
      if (index > -1) {
        selectedSchedules.value.splice(index, 1)
      } else {
        selectedSchedules.value.push(schedule)
      }
    }

    // 全选/取消全选
    const toggleSelectAll = () => {
      if (selectedSchedules.value.length === repaymentSchedule.value.length) {
        selectedSchedules.value = []
      } else {
        selectedSchedules.value = [...repaymentSchedule.value.filter(s => s.status !== 'paid')]
      }
    }

    // 批量修改还款计划
    const batchModifySchedule = async () => {
      if (selectedSchedules.value.length === 0) {
        showNotification('请选择要修改的还款计划', 'warning')
        return
      }

      isModifyingSchedule.value = true
      
      try {
        let schedules = []
        
        if (batchModifyType.value === 'date') {
          // 批量修改日期
          schedules = selectedSchedules.value.map((schedule, index) => {
            const baseDate = new Date(batchModifyValue.value)
            baseDate.setMonth(baseDate.getMonth() + index)
            
            return {
              period_number: schedule.period_number,
              due_date: baseDate.toISOString().split('T')[0],
              notes: `批量调整还款日期`
            }
          })
        } else if (batchModifyType.value === 'amount') {
          // 批量调整金额（按比例）
          const adjustmentRatio = PrecisionMath.divide(PrecisionMath.safeDecimal(batchModifyValue.value), 100)
          
          schedules = selectedSchedules.value.map(schedule => {
            const multiplier = PrecisionMath.add(1, adjustmentRatio)
            return {
              period_number: schedule.period_number,
              total_amount: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.multiply(PrecisionMath.safeDecimal(schedule.total_amount), multiplier))),
              principal_amount: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.multiply(PrecisionMath.safeDecimal(schedule.principal_amount), multiplier))),
              interest_amount: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.multiply(PrecisionMath.safeDecimal(schedule.interest_amount), multiplier))),
              notes: `批量调整金额 ${PrecisionMath.greaterThan(adjustmentRatio, 0) ? '+' : ''}${PrecisionMath.toString(PrecisionMath.multiply(adjustmentRatio, 100))}%`
            }
          })
        }

        const result = await repaymentService.batchModifySchedule(
          selectedLoan.value.id,
          schedules
        )

        if (result.success) {
          const successCount = result.data.modified_schedules?.length || 0
          const errorCount = result.data.errors?.length || 0
          
          showNotification(
            `批量修改完成，成功${successCount}条，失败${errorCount}条`,
            errorCount > 0 ? 'warning' : 'success'
          )
          
          if (result.data.errors && result.data.errors.length > 0) {
            console.warn('批量修改部分失败:', result.data.errors)
          }
          
          showBatchModifyModal.value = false
          selectedSchedules.value = []
          
          // 重新加载还款计划
          await loadRepaymentSchedule()
        } else {
          showNotification(`批量修改失败: ${result.message}`, 'error')
        }
      } catch (error) {
        console.error('批量修改失败:', error)
        showNotification('批量修改失败，请稍后重试', 'error')
      } finally {
        isModifyingSchedule.value = false
      }
    }
    
    // 计算批量还款分配
    const calculateBatchPayment = () => {
      if (!PrecisionMath.isValidNumber(batchPaymentForm.total_amount)) {
        showNotification('请输入有效的还款金额', 'warning')
        return
      }
      
      const totalAmount = PrecisionMath.safeDecimal(batchPaymentForm.total_amount)
      if (PrecisionMath.lessThanOrEqual(totalAmount, 0)) {
        showNotification('请输入有效的还款金额', 'warning')
        return
      }
      
      if (!repaymentSchedule.value || repaymentSchedule.value.length === 0) {
        showNotification('请先获取还款计划', 'warning')
        return
      }
      
      // 获取所有未还清的期数，按期数排序
      const unpaidSchedules = repaymentSchedule.value
        .filter(schedule => schedule.status !== 'paid')
        .sort((a, b) => a.period_number - b.period_number)
      
      if (unpaidSchedules.length === 0) {
        showNotification('所有期数都已还清', 'info')
        return
      }
      
      let remainingAmount = totalAmount
      const preview = []
      
      console.log('开始批量还款计算:')
      console.log('总金额:', PrecisionMath.toString(totalAmount))
      console.log('未还清期数:', unpaidSchedules.length)
      
      // 逐期分配还款金额
      for (const schedule of unpaidSchedules) {
        if (PrecisionMath.lessThanOrEqual(remainingAmount, 0)) break
        
        // 计算这一期的剩余应还金额（考虑已还部分）
        const totalDue = PrecisionMath.safeDecimal(schedule.total_amount || 0)
        const alreadyPaid = PrecisionMath.safeDecimal(schedule.paid_amount || 0)
        const remainingDue = PrecisionMath.subtract(totalDue, alreadyPaid)
        
        console.log(`第${schedule.period_number}期: 应还=${PrecisionMath.toString(totalDue)}, 已还=${PrecisionMath.toString(alreadyPaid)}, 剩余=${PrecisionMath.toString(remainingDue)}`)
        
        // 如果这一期已经还清，跳过
        if (PrecisionMath.lessThanOrEqual(remainingDue, 0)) {
          console.log(`第${schedule.period_number}期已还清，跳过`)
          continue
        }
        
        let paymentAmount = PrecisionMath.decimal(0)
        let paymentStatus = 'none'
        
        if (PrecisionMath.greaterThanOrEqual(remainingAmount, remainingDue)) {
          // 可以还清这一期的剩余金额
          paymentAmount = remainingDue
          paymentStatus = 'full'
          remainingAmount = PrecisionMath.subtract(remainingAmount, remainingDue)
          console.log(`第${schedule.period_number}期: 全额还清剩余金额 ${PrecisionMath.toString(remainingDue)}`)
        } else {
          // 只能部分还款
          paymentAmount = remainingAmount
          paymentStatus = 'partial'
          remainingAmount = PrecisionMath.decimal(0)
          console.log(`第${schedule.period_number}期: 部分还款 ${PrecisionMath.toString(paymentAmount)}`)
        }
        
        preview.push({
          period_number: schedule.period_number,
          due_date: schedule.due_date,
          total_amount: PrecisionMath.toNumber(totalDue),
          already_paid: PrecisionMath.toNumber(alreadyPaid),
          remaining_due_before: PrecisionMath.toNumber(remainingDue),
          payment_amount: PrecisionMath.toNumber(paymentAmount),
          payment_status: paymentStatus,
          remaining_due_after: PrecisionMath.toNumber(PrecisionMath.subtract(remainingDue, paymentAmount))
        })
      }
      
      batchPaymentPreview.value = preview
      batchPaymentRemaining.value = PrecisionMath.toNumber(remainingAmount)
      
      showNotification(`计算完成，可分配${preview.length}期还款`, 'success')
      
      console.log('批量还款分配预览:', preview)
      console.log('剩余金额:', PrecisionMath.toString(remainingAmount))
    }
    
    // 执行批量还款
    const executeBatchPayment = async () => {
      if (!selectedLoan.value || !selectedLoan.value.id) {
        showNotification('贷款信息无效', 'error')
        return
      }
      
      if (batchPaymentPreview.value.length === 0) {
        showNotification('请先计算还款分配', 'warning')
        return
      }
      
      if (!batchPaymentForm.payment_method) {
        showNotification('请选择支付方式', 'warning')
        return
      }
      
      // 确认批量还款
      showConfirm(
        '确认批量还款',
        `确定要执行批量还款吗？\n总金额: ￥${batchPaymentForm.total_amount?.toLocaleString()}\n分配期数: ${batchPaymentPreview.value.length}期`,
        async () => {
          await processBatchPayment()
        }
      )
    }
    
    // 处理批量还款
    const processBatchPayment = async () => {
      isBatchPaymentProcessing.value = true
      
      // 初始化进度
      const validPayments = batchPaymentPreview.value.filter(p => p.payment_amount > 0)
      batchPaymentTotalPeriods.value = validPayments.length
      batchPaymentCurrentPeriod.value = 0
      batchPaymentProgress.value = 0
      
      try {
        let successCount = 0
        let failureCount = 0
        const errors = []
        
        showNotification('开始处理批量还款...', 'info')
        
        // 依次处理每期还款
        for (let index = 0; index < validPayments.length; index++) {
          const payment = validPayments[index]
          
          // 更新进度
          batchPaymentCurrentPeriod.value = index + 1
          batchPaymentProgress.value = Math.round(((index + 1) / validPayments.length) * 100)
          
          try {
            // 构造还款数据
            const paymentData = {
              paid_amount: payment.payment_amount,
              payment_method: batchPaymentForm.payment_method,
              transaction_id: batchPaymentForm.transaction_id ? 
                `${batchPaymentForm.transaction_id}-P${payment.period_number}` : 
                `BATCH-${Date.now()}-P${payment.period_number}`,
              paid_date: batchPaymentForm.paid_date,
              notes: `${batchPaymentForm.notes || '批量还款'} - 第${payment.period_number}期 ${payment.payment_status === 'full' ? '全额' : '部分'}还款`
            }
            
            console.log(`处理第${payment.period_number}期还款 (${index + 1}/${validPayments.length}):`, paymentData)
            
            // 调用API记录还款
            const result = await repaymentService.recordPayment(
              selectedLoan.value.id,
              payment.period_number,
              paymentData
            )
            
            if (result.success) {
              successCount++
              console.log(`第${payment.period_number}期还款成功`)
            } else {
              failureCount++
              errors.push(`第${payment.period_number}期: ${result.message}`)
              console.error(`第${payment.period_number}期还款失败:`, result.message)
            }
            
            // 添加小延迟避免请求过快，同时让进度条有更好的视觉效果
            await new Promise(resolve => setTimeout(resolve, 200))
            
          } catch (error) {
            failureCount++
            errors.push(`第${payment.period_number}期: ${error.message || '网络错误'}`)
            console.error(`第${payment.period_number}期还款异常:`, error)
          }
        }
        
        // 显示批量还款结果
        if (successCount > 0 && failureCount === 0) {
          showNotification(`批量还款完成！成功处理${successCount}期`, 'success', 5000)
        } else if (successCount > 0 && failureCount > 0) {
          showNotification(`批量还款部分完成：成功${successCount}期，失败${failureCount}期`, 'warning', 8000)
          console.warn('批量还款错误详情:', errors)
        } else {
          showNotification(`批量还款失败：${failureCount}期处理失败`, 'error', 5000)
          console.error('批量还款错误详情:', errors)
        }
        
        // 重置表单和预览
        batchPaymentForm.total_amount = 0
        batchPaymentForm.transaction_id = ''
        batchPaymentForm.notes = ''
        batchPaymentPreview.value = []
        batchPaymentRemaining.value = 0
        
        // 重置进度
        batchPaymentProgress.value = 0
        batchPaymentCurrentPeriod.value = 0
        batchPaymentTotalPeriods.value = 0
        
        // 关闭模态框
        showBatchPaymentModal.value = false
        
        // 重新加载还款计划
        await loadRepaymentSchedule()
        
      } catch (error) {
        console.error('批量还款处理异常:', error)
        showNotification('批量还款处理异常，请稍后重试', 'error')
      } finally {
        isBatchPaymentProcessing.value = false
      }
    }
    
    // 登出
    const logout = async () => {
      showConfirm(
        '确认退出',
        '确定要退出登录吗？',
        async () => {
          await authStore.logout()
          emit('go-to-login')
        }
      )
    }
    
    // 组件挂载时初始化数据
    onMounted(async () => {
      // 检查用户权限
      if (!authStore.isAdmin.value) {
        showNotification('权限不足，请使用管理员账户登录', 'error', 5000)
        emit('go-to-login')
        return
      }
      
      console.log('管理员用户信息:', authStore.state.user)
      console.log('认证状态:', authStore.state.isAuthenticated)
      
      // 获取初始数据（暂时不获取统计信息）
      await Promise.all([
        fetchLoans(),
        fetchUsers(),
        fetchLogs()
      ])
    })
    
    // 显示通知
    const showNotification = (message, type = 'info', duration = 3000) => {
      const id = ++notificationId
      const notification = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration
      }
      notifications.value.push(notification)
      
      // 自动移除通知
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    // 移除通知
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }
    
    // 显示确认对话框
    const showConfirm = (title, message, onConfirm, onCancel = null) => {
      confirmDialog.title = title
      confirmDialog.message = message
      confirmDialog.onConfirm = onConfirm
      confirmDialog.onCancel = onCancel
      showConfirmDialog.value = true
    }
    
    // 确认对话框确定
    const handleConfirm = () => {
      if (confirmDialog.onConfirm) {
        confirmDialog.onConfirm()
      }
      showConfirmDialog.value = false
    }
    
    // 确认对话框取消
    const handleCancel = () => {
      if (confirmDialog.onCancel) {
        confirmDialog.onCancel()
      }
      showConfirmDialog.value = false
    }
    
    return {
      // 响应式数据
      activeTab,
      showAddLoanModal,
      showViewLoanModal,
      showEditLoanModal,
      showRecordPaymentModal,
      showModifyScheduleModal,
      showBatchModifyModal,
      showBatchPaymentModal,
      showAddUserModal,
      showEditUserModal,
      showUserDetailModal,
      showLogDetailModal,
      showLogCleanupModal,
      isLoading,
      error,
      loans,
      users,  
      logs,
      selectedUser,
      selectedLog,
      statistics,
      isLoadingLogs,
      isCleaningLogs,
      logStats,
      logPagination,
      cleanupDays,
      newLoan,
      selectedLoan,
      editingLoan,
      newUser,
      editingUser,
      paymentForm,
      batchPaymentForm,
      modifyScheduleForm,
      selectedSchedules,
      batchModifyType,
      batchModifyValue,
      isModifyingSchedule,
      menuItems,
      activeDetailTab,
      isCalculating,
      calculationResult,
      isLoadingRepayment,
      repaymentSchedule,
      repaymentStats,
      selectedPaymentSchedule,
      isRecordingPayment,
      isBatchPaymentProcessing,
      batchPaymentPreview,
      batchPaymentRemaining,
      batchPaymentProgress,
      batchPaymentCurrentPeriod,
      batchPaymentTotalPeriods,
      
      // 计算属性
      currentUser,
      
      // 工具类
      PrecisionMath,
      
      // 方法
      addLoan,
      approveLoan,
      deleteLoan,
      viewLoan,
      editLoan,
      calculateLoan,
      loadRepaymentSchedule,
      selectPaymentSchedule,
      recordPayment,
      selectScheduleForModify,
      modifySchedule,
      toggleScheduleSelection,
      toggleSelectAll,
      batchModifySchedule,
      calculateBatchPayment,
      executeBatchPayment,
      formatDate,
      formatPreviewDate,
      getPaymentStatusText,
      getRepaymentMethodText,
      getLoanStatusText,
      logout,
      fetchLoans,
      fetchUsers,
      addUser,
      editUser,
      updateUser,
      viewUser,
      deleteUser,
      fetchLogs,
      refreshLogs,
      changePage,
      viewLogDetail,
      cleanupLogs,
      getLevelText,
      getModuleText,
      getStatusClass,
      updateLoan,
      
      // 通知系统
      notifications,
      showNotification,
      removeNotification,
      
      // 确认对话框系统
      showConfirmDialog,
      confirmDialog,
      showConfirm,
      handleConfirm,
      handleCancel
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.admin-dashboard::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 30px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
}

.admin-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.user-info span {
  font-size: 15px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.logout-btn:hover::before {
  left: 100%;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dashboard-content {
  display: flex;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
}

.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 30px 0;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  pointer-events: none;
}

.nav-menu {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 30px;
  margin: 2px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(4px);
  box-shadow: 4px 4px 20px rgba(102, 126, 234, 0.15);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-left-color: #667eea;
  color: #667eea;
  transform: translateX(6px);
  box-shadow: 6px 6px 25px rgba(102, 126, 234, 0.25);
}

.nav-item.active .nav-text {
  font-weight: 600;
}

.nav-icon {
  font-size: 20px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-weight: 500;
  font-size: 15px;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
}

.overview-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header h2 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.add-btn:hover::before {
  left: 100%;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.loans-table {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.loans-table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  pointer-events: none;
}

.table-container {
  overflow-x: auto;
  overflow-y: hidden;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.loans-table table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  position: relative;
  z-index: 1;
}

.loans-table th,
.loans-table td {
  padding: 18px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loans-table th {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  backdrop-filter: blur(10px);
  font-weight: 700;
  color: #4a5568;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.loans-table td {
  font-size: 14px;
  color: #2d3748;
  transition: all 0.2s ease;
}

.loans-table tr:hover td {
  background: rgba(102, 126, 234, 0.04);
  color: #1a202c;
}

.loans-table tr:hover {
  transform: scale(1.002);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* 各列的具体宽度设置 */
.id-col {
  width: 160px;
  min-width: 160px;
  font-family: monospace;
  font-size: 12px;
}

.name-col {
  width: 120px;
  min-width: 120px;
}

.applicant-col {
  width: 100px;
  min-width: 100px;
}

.amount-col {
  width: 120px;
  min-width: 120px;
  text-align: right;
}

.rate-col {
  width: 80px;
  min-width: 80px;
  text-align: center;
}

.bank-col {
  width: 100px;
  min-width: 100px;
}

.term-col {
  width: 90px;
  min-width: 90px;
  text-align: center;
}

.method-col {
  width: 130px;
  min-width: 130px;
  text-align: center;
}

.status-col {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.date-col {
  width: 110px;
  min-width: 110px;
}

.action-col {
  width: 200px;
  min-width: 200px;
  text-align: center;
}

.loan-name {
  font-weight: 500;
  color: #333;
}

.amount {
  font-weight: 700;
  color: #2d3748;
  font-size: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rate {
  font-weight: 700;
  color: #f56565;
  font-size: 14px;
  padding: 4px 8px;
  background: rgba(245, 101, 101, 0.1);
  border-radius: 6px;
  display: inline-block;
}

.term {
  color: #718096;
  font-weight: 500;
}

.repayment-method {
  color: #718096;
  font-weight: 500;
  font-size: 13px;
}

.loan-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1.5px solid transparent;
}

.loan-status::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.loan-status:hover::before {
  left: 100%;
}

.loan-status.pending {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%);
  color: #f57c00;
  border-color: rgba(255, 152, 0, 0.3);
}

.loan-status.approved {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.15) 100%);
  color: #2e7d32;
  border-color: rgba(76, 175, 80, 0.3);
}

.loan-status.completed {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.15) 100%);
  color: #1565c0;
  border-color: rgba(33, 150, 243, 0.3);
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 6px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1.5px solid transparent;
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
  z-index: 0;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn span {
  position: relative;
  z-index: 1;
  font-size: 14px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.view {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.15) 100%);
  color: #1565c0;
  border-color: rgba(33, 150, 243, 0.3);
}

.action-btn.view:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.25) 0%, rgba(100, 181, 246, 0.25) 100%);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.action-btn.approve {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.15) 100%);
  color: #2e7d32;
  border-color: rgba(76, 175, 80, 0.3);
}

.action-btn.approve:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.25) 0%, rgba(129, 199, 132, 0.25) 100%);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.action-btn.edit {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(186, 104, 200, 0.15) 100%);
  color: #7b1fa2;
  border-color: rgba(156, 39, 176, 0.3);
}

.action-btn.edit:hover {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.25) 0%, rgba(186, 104, 200, 0.25) 100%);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
}

.action-btn.delete {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(239, 154, 154, 0.15) 100%);
  color: #d32f2f;
  border-color: rgba(244, 67, 54, 0.3);
}

.action-btn.delete:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.25) 0%, rgba(239, 154, 154, 0.25) 100%);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.empty-loans-state {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-loans-state .empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-loans-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-loans-state p {
  color: #666;
  font-size: 14px;
}

.users-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}



.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.empty-users-state {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-users-state .empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-users-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-users-state p {
  color: #666;
  font-size: 14px;
}

.logs-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-height: 500px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 15px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.log-item.info {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.log-item.warning {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.log-item.error {
  background: #ffebee;
  border-left-color: #f44336;
}

.log-time {
  font-size: 12px;
  color: #666;
  min-width: 140px;
}

.log-type {
  font-size: 11px;
  font-weight: 600;
  min-width: 70px;
}

.log-message {
  flex: 1;
}

.empty-logs-state {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-logs-state .empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-logs-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.empty-logs-state p {
  color: #666;
  font-size: 14px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  background: #e1e8ed;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #d1d9e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* 详情页面样式 */
.loan-details {
  display: grid;
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0;
}

.detail-item span {
  color: #666;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
  }
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: #667eea;
  color: white;
  padding: 20px 40px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 错误提示样式 */
.error-banner {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 20px;
  position: relative;
  font-size: 14px;
}

.close-error {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #c33;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义通知系统样式 */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification {
  background: white;
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.notification.notification-success {
  border-left: 4px solid #4caf50;
}

.notification.notification-error {
  border-left: 4px solid #f44336;
}

.notification.notification-warning {
  border-left: 4px solid #ff9800;
}

.notification.notification-info {
  border-left: 4px solid #2196f3;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-icon {
  font-size: 18px;
}

.notification-message {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.notification-close {
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 自定义确认对话框样式 */
.confirm-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.confirm-header {
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.confirm-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.confirm-content {
  padding: 24px;
}

.confirm-content p {
  margin: 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #f8f9fa;
  justify-content: flex-end;
}

.danger-btn {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.danger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
}

.cancel-btn:hover {
  background: #d1d9e0;
}

/* 新增样式：贷款详情弹窗 */
.loan-detail-modal {
  max-width: 900px;
  max-height: 90vh;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #e74c3c;
}

.modal-body {
  padding: 20px 30px 30px;
}

/* 标签页样式 */
.detail-tabs {
  display: flex;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 20px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #7f8c8d;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  min-height: 300px;
}

/* 计算器样式 */
.calculator-section {
  padding: 20px 0;
}

.calculator-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.calc-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.calc-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.calc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.calc-btn.record-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.calc-btn.record-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  color: #7f8c8d;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 计算结果样式 */
.calculation-result {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.result-section {
  margin-bottom: 30px;
}

.result-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.summary-item label {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
  font-weight: 500;
}

.summary-item span {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-item .highlight {
  color: #e74c3c;
  font-size: 20px;
}

/* 比较表格样式 */
.comparison-table {
  overflow-x: auto;
  margin: 15px 0;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table th,
.comparison-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.comparison-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.comparison-recommendation {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.recommendation {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

/* 详细计划表格样式 */
.schedule-section {
  margin-top: 20px;
}

.schedule-table {
  overflow-x: auto;
  margin-top: 15px;
}

.schedule-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}

.schedule-table th,
.schedule-table td {
  padding: 10px 8px;
  text-align: right;
  border-bottom: 1px solid #e1e8ed;
}

.schedule-table th:first-child,
.schedule-table td:first-child {
  text-align: left;
}

.schedule-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

/* 还款计划样式 */
.repayment-section {
  padding: 20px 0;
}

.repayment-controls {
  margin-bottom: 20px;
}

.repayment-stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.repayment-stats h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-item label {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-item span {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-item .overdue {
  color: #e74c3c;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.payment-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.payment-status.paid {
  background: #d4edda;
  color: #155724;
}

.payment-status.overdue {
  background: #f8d7da;
  color: #721c24;
}

.payment-status.partial {
  background: #d1ecf1;
  color: #0c5460;
}

.action-btn.pay {
  background: #28a745;
  color: white;
}

.action-btn.pay:hover {
  background: #218838;
}

.action-btn.modify {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  margin-left: 4px;
}

.action-btn.modify:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.calc-btn.modify-btn {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
}

.calc-btn.select-btn {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
}

/* 修改模态框样式 */
.modify-schedule-modal, .batch-modify-modal {
  max-width: 600px;
  width: 90%;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-row .form-group {
  flex: 1;
}

.amount-check-result {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.amount-check-result .error {
  color: #dc3545;
  font-weight: bold;
}

.selected-info {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.preview-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.preview-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
}

.modify-form, .batch-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 还款表单样式 */
.payment-form {
  margin-top: 20px;
}

.payment-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.payment-info p {
  margin: 5px 0;
  color: #2c3e50;
}

/* 批量还款样式 */
.batch-payment-btn {
  background: #17a2b8;
  color: white;
}

.batch-payment-btn:hover {
  background: #138496;
}

.batch-payment-modal .modal-content {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.batch-payment-form {
  padding: 20px;
}

.payment-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.payment-preview h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.preview-summary p {
  margin: 5px 0;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
}

.preview-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.preview-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.preview-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.preview-status.full {
  background: #d4edda;
  color: #155724;
}

.preview-status.partial {
  background: #d1ecf1;
  color: #0c5460;
}

.preview-status.none {
  background: #f8d7da;
  color: #721c24;
}

.preview-more {
  text-align: center;
  padding: 10px;
  color: #6c757d;
  font-style: italic;
}

.modal-actions .calc-btn {
  background: #6c757d;
  color: white;
  margin-right: 10px;
}

.modal-actions .calc-btn:hover {
  background: #5a6268;
}

.modal-actions .calc-btn:disabled {
  background: #dee2e6;
  color: #6c757d;
  cursor: not-allowed;
}

/* 批量还款进度条样式 */
.batch-payment-progress {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.batch-payment-progress h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #495057;
}

.progress-percentage {
  font-weight: 600;
  color: #007bff;
  font-size: 16px;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-status {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

.progress-status small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.progress-status small::before {
  content: '⏳';
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 用户管理相关样式 */
.users-section {
  padding: 20px;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.users-table tr:hover {
  background: #f8f9fa;
}



.action-btn {
  padding: 6px 12px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #007bff;
  color: white;
}

.action-btn.edit:hover {
  background: #0056b3;
}

.action-btn.view {
  background: #6c757d;
  color: white;
}

.action-btn.view:hover {
  background: #545b62;
}



.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
}

.empty-users-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-users-state .empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-users-state h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.empty-users-state p {
  margin: 0;
  color: #6c757d;
}

.user-detail {
  max-width: 500px;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row label {
  min-width: 100px;
  font-weight: 600;
  color: #495057;
  margin-right: 15px;
}

.detail-row span {
  color: #6c757d;
  word-break: break-all;
}

.detail-row .user-status {
  margin: 0;
}

@media (max-width: 768px) {
  .users-table {
    overflow-x: auto;
  }
  
  .users-table table {
    min-width: 800px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
    margin: 1px;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-row label {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 5px;
  }
}

/* 系统日志样式 */
.logs-section {
  padding: 20px;
}

.logs-controls {
  display: flex;
  gap: 10px;
}

.refresh-btn, .cleanup-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cleanup-btn {
  background: #dc3545;
  color: white;
}

.cleanup-btn:hover {
  background: #c82333;
}



.logs-stats {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  padding: 10px;
  background: #e9ecef;
  border-radius: 6px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  gap: 5px;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.stat-item.level-error .stat-value {
  color: #dc3545;
}

.stat-item.level-warning .stat-value {
  color: #ffc107;
}

.stat-item.level-info .stat-value {
  color: #17a2b8;
}

.stat-item.level-debug .stat-value {
  color: #6c757d;
}

.logs-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.logs-header {
  display: grid;
  grid-template-columns: 180px 80px 80px 120px 1fr 80px;
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.header-cell {
  padding: 12px 8px;
  font-weight: 600;
  color: #495057;
  font-size: 12px;
  border-right: 1px solid #dee2e6;
}

.header-cell:last-child {
  border-right: none;
}

.logs-body {
  max-height: 600px;
  overflow-y: auto;
}

.log-row {
  display: grid;
  grid-template-columns: 180px 80px 80px 120px 1fr 80px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.log-row:hover {
  background: #f8f9fa;
}

.log-row.level-error {
  border-left: 4px solid #dc3545;
}

.log-row.level-warning {
  border-left: 4px solid #ffc107;
}

.log-row.level-info {
  border-left: 4px solid #17a2b8;
}

.log-row.level-debug {
  border-left: 4px solid #6c757d;
}

.log-cell {
  padding: 8px;
  font-size: 12px;
  color: #495057;
  border-right: 1px solid #e9ecef;
  word-break: break-word;
  display: flex;
  align-items: center;
}

.log-cell:last-child {
  border-right: none;
}

.log-cell.time {
  font-family: monospace;
  font-size: 11px;
}

.log-cell.message {
  line-height: 1.3;
}

.level-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.level-badge.debug {
  background: #6c757d;
  color: white;
}

.level-badge.info {
  background: #17a2b8;
  color: white;
}

.level-badge.warning {
  background: #ffc107;
  color: #212529;
}

.level-badge.error {
  background: #dc3545;
  color: white;
}

.module-badge {
  padding: 2px 6px;
  background: #e9ecef;
  border-radius: 10px;
  font-size: 10px;
  color: #495057;
}

.method-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  font-family: monospace;
}

.method-badge.get { background: #28a745; color: white; }
.method-badge.post { background: #007bff; color: white; }
.method-badge.put { background: #ffc107; color: #212529; }
.method-badge.patch { background: #17a2b8; color: white; }
.method-badge.delete { background: #dc3545; color: white; }

.status-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  font-family: monospace;
}

.status-badge.success { background: #28a745; color: white; }
.status-badge.redirect { background: #17a2b8; color: white; }
.status-badge.client-error { background: #ffc107; color: #212529; }
.status-badge.server-error { background: #dc3545; color: white; }
.status-badge.unknown { background: #6c757d; color: white; }

.logs-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.log-detail-modal {
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 5px;
}

.metadata-block,
.stack-trace {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  font-size: 11px;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.text-small {
  font-size: 11px;
  word-break: break-all;
}

.error-text {
  color: #dc3545;
  font-weight: 500;
}

.cleanup-form {
  padding: 10px 0;
}

.warning-note {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 12px;
}

/* 响应式设计 - 优化版本 */

/* 大屏设备 */
@media (min-width: 1400px) {
  .admin-header {
    padding: 0 50px;
    height: 90px;
  }
  
  .main-content {
    padding: 50px;
  }
  
  .section-header h2 {
    font-size: 32px;
  }
  
  .loans-table table {
    min-width: 1400px;
  }
}

/* 中等屏幕 */
@media (max-width: 1200px) {
  .sidebar {
    width: 240px;
  }
  
  .nav-text {
    font-size: 14px;
  }
  
  .loans-table table {
    min-width: 1000px;
  }
  
  .loans-table th,
  .loans-table td {
    padding: 14px 12px;
    font-size: 13px;
  }
}

/* 平板设备 */
@media (max-width: 992px) {
  .admin-header {
    padding: 0 20px;
    height: 70px;
  }
  
  .admin-header h1 {
    font-size: 20px;
  }
  
  .dashboard-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 20px 0;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 20px;
    gap: 10px;
  }
  
  .nav-item {
    margin: 0;
    min-width: 120px;
    justify-content: center;
    transform: none !important;
  }
  
  .nav-item:hover {
    transform: none !important;
  }
  
  .nav-item.active {
    transform: none !important;
  }
  
  .main-content {
    padding: 30px 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px 25px;
  }
  
  .section-header h2 {
    font-size: 24px;
  }
  
  .add-btn {
    align-self: stretch;
    width: 100%;
    justify-content: center;
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 15px;
    height: 60px;
    flex-wrap: wrap;
  }
  
  .admin-header h1 {
    font-size: 18px;
  }
  
  .admin-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
  
  .user-info {
    gap: 10px;
  }
  
  .user-info span {
    font-size: 13px;
  }
  
  .logout-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .main-content {
    padding: 20px 15px;
  }
  
  .section-header {
    padding: 20px;
    border-radius: 15px;
  }
  
  .section-header h2 {
    font-size: 22px;
  }
  
  /* 表格移动端优化 */
  .loans-table {
    border-radius: 15px;
    overflow: visible;
  }
  
  .table-container {
    overflow: visible;
  }
  
  .loans-table table,
  .loans-table tbody,
  .loans-table tr,
  .loans-table td {
    display: block;
  }
  
  .loans-table thead {
    display: none;
  }
  
  .loans-table tr {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 15px;
    margin-bottom: 15px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
  }
  
  .loans-table tr:hover {
    transform: none;
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.15);
  }
  
  .loans-table td {
    border: none;
    padding: 8px 0;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .loans-table td:before {
    content: attr(data-label);
    font-weight: 700;
    color: #4a5568;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 80px;
    margin-right: 15px;
  }
  
  .loans-table td:last-child {
    border-bottom: none;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .action-btn {
    margin-right: 8px;
    margin-bottom: 5px;
  }
  
  /* 状态徽章优化 */
  .loan-status {
    margin-left: auto;
  }
  
  /* 金额显示优化 */
  .amount {
    font-size: 16px;
    font-weight: 800;
  }
  
  .logs-header,
  .log-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .header-cell,
  .log-cell {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 6px 8px;
  }
  
  .log-cell:before {
    content: attr(data-label) ': ';
    font-weight: 600;
    margin-right: 5px;
  }
  
  .logs-stats {
    flex-direction: column;
    gap: 8px;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .admin-header {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 15px 10px;
  }
  
  .section-header {
    padding: 15px;
  }
  
  .loans-table tr {
    padding: 15px;
    margin-bottom: 12px;
  }
  
  .loans-table td:before {
    min-width: 70px;
    font-size: 11px;
  }
  
  .action-btn {
    min-width: 32px;
    height: 32px;
    padding: 6px 8px;
  }
}

/* 文字溢出处理 */
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.text-break {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

/* 无障碍优化 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style> 