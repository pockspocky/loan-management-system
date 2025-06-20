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
            <button class="add-btn">添加用户</button>
          </div>
          
          <div v-if="users.length > 0" class="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['status', user.status]">
                      {{ user.status === 'active' ? '活跃' : '禁用' }}
                    </span>
                  </td>
                  <td>{{ user.createdAt }}</td>
                  <td>
                    <button class="action-btn edit">编辑</button>
                    <button class="action-btn delete">删除</button>
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
          <h2>系统日志</h2>
          
          <div v-if="logs.length > 0" class="logs-container">
            <div v-for="log in logs" :key="log.id" :class="['log-item', log.type]">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-type">{{ log.type.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
          
          <div v-else class="empty-logs-state">
            <div class="empty-icon">📋</div>
            <h3>暂无系统日志</h3>
            <p>系统中还没有日志记录，等待后端数据接入...</p>
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
                    <span>{{ repaymentStats.payment_stats?.total_periods || repaymentStats.total_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>已还期数</label>
                    <span>{{ repaymentStats.payment_stats?.paid_periods || repaymentStats.paid_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>待还期数</label>
                    <span>{{ repaymentStats.payment_stats?.pending_periods || repaymentStats.pending_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>逾期期数</label>
                    <span class="overdue">{{ repaymentStats.payment_stats?.overdue_periods || repaymentStats.overdue_periods || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <label>还款进度</label>
                    <span>{{ (repaymentStats.payment_stats?.payment_progress || repaymentStats.payment_progress || 0).toFixed(1) }}%</span>
                  </div>
                  <div class="stat-item">
                    <label>剩余应还金额</label>
                    <span>￥{{ (repaymentStats.payment_stats?.remaining_amount || repaymentStats.remaining_amount || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (repaymentStats.payment_stats?.payment_progress || repaymentStats.payment_progress || 0) + '%' }"></div>
                </div>
              </div>

              <!-- 还款计划列表 -->
              <div v-if="repaymentSchedule && repaymentSchedule.length > 0" class="repayment-schedule">
                <h4>还款计划（前20期）</h4>
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
                      <tr v-for="item in repaymentSchedule.slice(0, 20)" :key="item.period_number">
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
                <span :class="{ 'error': Math.abs((modifyScheduleForm.principal_amount + modifyScheduleForm.interest_amount + modifyScheduleForm.late_fee) - modifyScheduleForm.total_amount) > 0.01 }">
                  ￥{{ ((modifyScheduleForm.principal_amount + modifyScheduleForm.interest_amount + modifyScheduleForm.late_fee) || 0).toLocaleString() }}
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
                  ￥{{ Math.round(schedule.total_amount * (1 + (batchModifyValue || 0) / 100) * 100) / 100 }}
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

    <!-- 记录还款模态框 -->
    <div v-if="showRecordPaymentModal" class="modal-overlay" @click="showRecordPaymentModal = false">
      <div class="modal-content" @click.stop>
        <h3>记录还款</h3>
        <div v-if="selectedPaymentSchedule" class="payment-form">
          <div class="payment-info">
            <p><strong>期数:</strong> 第{{ selectedPaymentSchedule.period_number }}期</p>
            <p><strong>应还金额:</strong> ￥{{ selectedPaymentSchedule.total_amount?.toLocaleString() }}</p>
            <p><strong>到期日期:</strong> {{ formatDate(selectedPaymentSchedule.due_date) }}</p>
          </div>
          
          <form @submit.prevent="recordPayment">
            <div class="form-group">
              <label>还款金额</label>
              <input 
                v-model.number="paymentForm.paid_amount" 
                type="number" 
                :max="selectedPaymentSchedule.total_amount"
                step="0.01"
                required 
              />
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
import { loanService, userService, loanCalculatorService, repaymentService } from '../services/index.js'

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
    const statistics = ref({
      totalLoans: 0,
      pendingLoans: 0,
      approvedLoans: 0,
      totalUsers: 0
    })
    
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
    
    // 还款表单数据
    const paymentForm = reactive({
      paid_amount: 0,
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
          users.value = result.data.users || []
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
          amount: parseFloat(newLoan.amount),
          interest_rate: parseFloat(newLoan.interestRate),
          bank: newLoan.bank,
          term: parseInt(newLoan.term),
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
      const amount = parseFloat(newLoan.amount)
      if (isNaN(amount) || amount <= 0 || amount < 1000) {
        showNotification('请输入有效的贷款金额（最少1000元）', 'warning')
        return false
      }
      const interestRate = parseFloat(newLoan.interestRate)
      if (isNaN(interestRate) || interestRate <= 0 || interestRate > 36) {
        showNotification('请输入有效的年利率（0-36%）', 'warning')
        return false
      }
      if (!newLoan.bank.trim()) {
        showNotification('请输入贷款银行', 'warning')
        return false
      }
      const term = parseInt(newLoan.term)
      if (isNaN(term) || term <= 0 || term > 360) {
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
      const amount = parseFloat(editingLoan.amount)
      if (isNaN(amount) || amount <= 0 || amount < 1000) {
        showNotification('请输入有效的贷款金额（最少1000元）', 'warning')
        return false
      }
      const interestRate = parseFloat(editingLoan.interestRate)
      if (isNaN(interestRate) || interestRate <= 0 || interestRate > 36) {
        showNotification('请输入有效的年利率（0-36%）', 'warning')
        return false
      }
      if (!editingLoan.bank.trim()) {
        showNotification('请输入贷款银行', 'warning')
        return false
      }
      const term = parseInt(editingLoan.term)
      if (isNaN(term) || term <= 0 || term > 360) {
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
        const principal = Number(selectedLoan.value.amount)
        const annualRate = Number(selectedLoan.value.interestRate) / 100
        const months = Number(selectedLoan.value.term)
        
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
          repaymentService.getRepaymentSchedule(selectedLoan.value.id, 1, 50),
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
      paymentForm.paid_amount = schedule.total_amount
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
          const adjustmentRatio = parseFloat(batchModifyValue.value) / 100
          
          schedules = selectedSchedules.value.map(schedule => ({
            period_number: schedule.period_number,
            total_amount: Math.round(schedule.total_amount * (1 + adjustmentRatio) * 100) / 100,
            principal_amount: Math.round(schedule.principal_amount * (1 + adjustmentRatio) * 100) / 100,
            interest_amount: Math.round(schedule.interest_amount * (1 + adjustmentRatio) * 100) / 100,
            notes: `批量调整金额 ${adjustmentRatio > 0 ? '+' : ''}${(adjustmentRatio * 100).toFixed(2)}%`
          }))
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
        fetchUsers()
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
      isLoading,
      error,
      loans,
      users,
      logs,
      statistics,
      newLoan,
      selectedLoan,
      editingLoan,
      paymentForm,
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
      
      // 计算属性
      currentUser,
      
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
      formatDate,
      formatPreviewDate,
      getPaymentStatusText,
      getRepaymentMethodText,
      getLoanStatusText,
      logout,
      fetchLoans,
      fetchUsers,
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
  background: #f5f7fa;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  gap: 15px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dashboard-content {
  display: flex;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e1e8ed;
  padding: 20px 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: #e3f2fd;
  border-left-color: #667eea;
  color: #667eea;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.overview-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #333;
  font-size: 24px;
}

.add-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.loans-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  min-width: 1200px; /* 设置表格最小宽度 */
  border-collapse: collapse;
  white-space: nowrap; /* 防止文字换行 */
}

.loans-table th,
.loans-table td {
  padding: 15px 12px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.loans-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
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
  font-weight: 600;
  color: #2d3748;
}

.rate {
  font-weight: 600;
  color: #ff9800;
}

.term {
  color: #666;
}

.repayment-method {
  color: #666;
}

.loan-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.loan-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.loan-status.approved {
  background: #d4edda;
  color: #155724;
}

.loan-status.completed {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
}

.action-btn.view {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.approve {
  background: #d4edda;
  color: #155724;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
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

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
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
</style> 