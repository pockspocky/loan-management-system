<template>
  <div class="user-dashboard">
    <!-- 顶部导航栏 -->
    <header class="user-header">
      <div class="header-left">
        <h1>用户仪表盘</h1>
        <span class="user-badge">USER</span>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="avatar">👤</div>
          <span>{{ currentUser?.username || '用户' }}</span>
          <button @click="logout" class="logout-btn" :disabled="isLoading">退出登录</button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
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
        <!-- 个人概览 -->
        <div v-if="activeTab === 'overview'" class="overview-section">
          <!-- 欢迎卡片 -->
          <div class="welcome-card">
            <div class="welcome-content">
              <h2>欢迎回来，{{ userInfo.username }}！</h2>
              <p>今天是美好的一天，继续保持活力吧！</p>
            </div>
            <div class="welcome-image">🌟</div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <h3>{{ userStats.totalTasks }}</h3>
                <p>总任务数</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h3>{{ userStats.completedTasks }}</h3>
                <p>已完成</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <h3>{{ userStats.activeProjects }}</h3>
                <p>活跃项目</p>
              </div>
            </div>
          </div>

          <!-- 贷款列表 -->
          <div class="loan-section">
            <div class="section-header">
              <h2>我的贷款</h2>
              <button @click="showAddLoanModal = true" class="add-btn">申请贷款</button>
            </div>
            
            <div v-if="loans.length > 0" class="loans-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>贷款名称</th>
                    <th>申请人</th>
                    <th>贷款金额</th>
                    <th>年利率</th>
                    <th>贷款银行</th>
                    <th>还款期限</th>
                    <th>还款方式</th>
                    <th>申请状态</th>
                    <th>申请时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in loans" :key="loan.id">
                    <td>{{ loan.id }}</td>
                    <td class="loan-name">{{ loan.loanName }}</td>
                    <td>{{ loan.applicantName }}</td>
                    <td class="amount">￥{{ loan.amount.toLocaleString() }}</td>
                    <td class="rate">{{ loan.interestRate }}%</td>
                    <td>{{ loan.bank }}</td>
                    <td class="term">{{ loan.term }}个月</td>
                    <td class="repayment-method">{{ getRepaymentMethodText(loan.repaymentMethod) }}</td>
                    <td>
                      <span :class="['loan-status', loan.status]">
                        {{ getLoanStatusText(loan.status) }}
                      </span>
                    </td>
                    <td>{{ loan.applicationDate }}</td>
                    <td>
                      <button @click="viewLoan(loan)" class="action-btn view">查看</button>
                      <button @click="editLoan(loan)" class="action-btn edit">编辑</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else class="empty-loans-state">
              <div class="empty-icon">💰</div>
              <h3>暂无贷款申请</h3>
              <p>您还没有贷款申请记录，点击右上角申请贷款...</p>
            </div>
          </div>
        </div>

        <!-- 个人资料 -->
        <div v-if="activeTab === 'profile'" class="profile-section">
          <div class="profile-header">
            <h2>个人资料</h2>
            <button @click="saveProfile" class="edit-btn" :disabled="isLoading">
              {{ editMode ? '保存' : '编辑' }}
            </button>
          </div>
          
          <div class="profile-form">
            <div class="avatar-section">
              <div class="large-avatar">👤</div>
              <button class="change-avatar-btn">更换头像</button>
            </div>
            
            <div class="form-fields">
              <div class="form-group">
                <label>用户名</label>
                <input 
                  v-model="userInfo.username" 
                  type="text" 
                  :disabled="!editMode"
                  :class="{ disabled: !editMode }"
                />
              </div>
              
              <div class="form-group">
                <label>邮箱</label>
                <input 
                  v-model="userInfo.email" 
                  type="email" 
                  :disabled="!editMode"
                  :class="{ disabled: !editMode }"
                />
              </div>
              
              <div class="form-group">
                <label>手机号</label>
                <input 
                  v-model="userInfo.phone" 
                  type="tel" 
                  :disabled="!editMode"
                  :class="{ disabled: !editMode }"
                />
              </div>
              
              <div class="form-group">
                <label>个人简介</label>
                <textarea 
                  v-model="userInfo.bio" 
                  :disabled="!editMode"
                  :class="{ disabled: !editMode }"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务管理 -->
        <div v-if="activeTab === 'tasks'" class="tasks-section">
          <div class="section-header">
            <h2>我的任务</h2>
            <button @click="showAddTaskModal = true" class="add-btn">添加任务</button>
          </div>
          
          <div class="tasks-filter">
            <button 
              v-for="filter in taskFilters" 
              :key="filter.value"
              @click="currentFilter = filter.value"
              :class="['filter-btn', { active: currentFilter === filter.value }]"
            >
              {{ filter.label }}
            </button>
          </div>
          
          <div class="tasks-list">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id" 
              :class="['task-item', task.status]"
            >
              <div class="task-status" @click="toggleTaskStatus(task)">
                <span v-if="task.status === 'completed'">✅</span>
                <span v-else class="checkbox">⭕</span>
              </div>
              <div class="task-content">
                <h4>{{ task.title }}</h4>
                <p>{{ task.description }}</p>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">
                    {{ getTaskPriorityText(task.priority) }}
                  </span>
                  <span class="task-due">截止：{{ task.dueDate }}</span>
                </div>
              </div>
              <div class="task-actions">
                <button class="action-btn edit">编辑</button>
                <button class="action-btn delete">删除</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 添加任务模态框 -->
    <div v-if="showAddTaskModal" class="modal-overlay" @click="showAddTaskModal = false">
      <div class="modal-content" @click.stop>
        <h3>添加新任务</h3>
        <form @submit.prevent="addTask">
          <div class="form-group">
            <label>任务标题</label>
            <input v-model="newTask.title" type="text" required />
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea v-model="newTask.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="newTask.priority">
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
          </div>
          <div class="form-group">
            <label>截止日期</label>
            <input v-model="newTask.dueDate" type="date" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddTaskModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">添加</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 申请贷款模态框 -->
    <div v-if="showAddLoanModal" class="modal-overlay" @click="showAddLoanModal = false">
      <div class="modal-content" @click.stop>
        <h3>申请贷款</h3>
        <form @submit.prevent="addLoan">
          <div class="form-group">
            <label>贷款名称</label>
            <input v-model="newLoan.loanName" type="text" required>
          </div>
          <div class="form-group">
            <label>申请人姓名</label>
            <input v-model="newLoan.applicantName" type="text" required>
          </div>
          <div class="form-group">
            <label>贷款金额</label>
            <input v-model="newLoan.amount" type="number" required>
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model="newLoan.interestRate" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="newLoan.bank" type="text" required>
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model="newLoan.term" type="number" required>
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
            <button type="submit" class="confirm-btn">提交申请</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看贷款详情模态框 -->
    <div v-if="showViewLoanModal" class="modal-overlay" @click="showViewLoanModal = false">
      <div class="modal-content loan-detail-modal" @click.stop>
        <div class="modal-header">
        <h3>贷款详情</h3>
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
              还款计划
            </button>
          </div>

          <!-- 基本信息标签页 -->
          <div v-if="activeDetailTab === 'basic'" class="tab-content">
        <div class="detail-grid">
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
            <span>{{ selectedLoan.repaymentMethod }}</span>
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

          <!-- 还款计划标签页 -->
          <div v-if="activeDetailTab === 'repayment'" class="tab-content">
            <div class="repayment-section">
              <div class="repayment-controls">
                <button @click="loadRepaymentSchedule" class="calc-btn" :disabled="isLoadingRepayment">
                  {{ isLoadingRepayment ? '加载中...' : '获取还款计划' }}
                </button>
                <button v-if="repaymentSchedule.length > 0" @click="showBatchPaymentModal = true" class="calc-btn batch-payment-btn">
                  批量还款
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
                    <label>还款进度</label>
                    <span>{{ (repaymentStats.payment_stats?.payment_progress || repaymentStats.payment_progress || 0).toFixed(1) }}%</span>
                  </div>
                  <div class="stat-item">
                    <label>总应还金额</label>
                    <span>￥{{ (repaymentStats.payment_stats?.total_amount || repaymentStats.total_amount || 0).toLocaleString() }}</span>
                  </div>
                  <div class="stat-item">
                    <label>已还金额</label>
                    <span>￥{{ (repaymentStats.payment_stats?.paid_amount || repaymentStats.paid_amount || 0).toLocaleString() }}</span>
                  </div>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (repaymentStats.payment_stats?.payment_progress || repaymentStats.payment_progress || 0) + '%' }"></div>
                </div>
              </div>

              <!-- 还款计划列表 -->
              <div v-if="repaymentSchedule && repaymentSchedule.length > 0" class="repayment-schedule">
                <h4>还款计划（共{{ repaymentSchedule.length }}期）</h4>
                <div class="schedule-table">
                  <table>
                    <thead>
                      <tr>
                        <th>期数</th>
                        <th>到期日期</th>
                        <th>应还总额</th>
                        <th>本金</th>
                        <th>利息</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in repaymentSchedule" :key="item.period_number">
                        <td>第{{ item.period_number }}期</td>
                        <td>{{ formatDate(item.due_date) }}</td>
                        <td>￥{{ item.total_amount?.toLocaleString() }}</td>
                        <td>￥{{ item.principal_amount?.toLocaleString() }}</td>
                        <td>￥{{ item.interest_amount?.toLocaleString() }}</td>
                        <td>
                          <span :class="['payment-status', item.status]">
                            {{ getPaymentStatusText(item.status) }}
                          </span>
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

    <!-- 编辑贷款模态框 -->
    <div v-if="showEditLoanModal" class="modal-overlay" @click="showEditLoanModal = false">
      <div class="modal-content" @click.stop>
        <h3>编辑贷款</h3>
        <form @submit.prevent="updateLoan">
          <div class="form-group">
            <label>贷款名称</label>
            <input v-model="editingLoan.loanName" type="text" required>
          </div>
          <div class="form-group">
            <label>申请人姓名</label>
            <input v-model="editingLoan.applicantName" type="text" required>
          </div>
          <div class="form-group">
            <label>贷款金额</label>
            <input v-model="editingLoan.amount" type="number" required>
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model="editingLoan.interestRate" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="editingLoan.bank" type="text" required>
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model="editingLoan.term" type="number" required>
          </div>
          <div class="form-group">
            <label>还款方式</label>
            <select v-model="editingLoan.repaymentMethod" required>
              <option value="">请选择还款方式</option>
              <option value="等额本息">等额本息</option>
              <option value="等额本金">等额本金</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showEditLoanModal = false" class="cancel-btn">取消</button>
            <button type="submit" class="confirm-btn">保存修改</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 批量还款模态框 -->
    <div v-if="showBatchPaymentModal" class="modal-overlay" @click="showBatchPaymentModal = false">
      <div class="modal-content batch-payment-modal" @click.stop>
        <h3>批量还款</h3>
        
        <div class="batch-payment-steps">
          <p class="steps-hint">
            <strong>操作步骤：</strong>
            ① 输入还款金额 → ② 选择支付方式 → ③ 点击"计算分配" → ④ 确认还款
          </p>
        </div>
        
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
          
          <!-- 状态提示 -->
          <div class="form-status-hints">
            <div v-if="!selectedLoan || !selectedLoan.id" class="status-warning">
              ⚠️ 请先选择一个贷款并获取还款计划
            </div>
            <div v-else-if="!repaymentSchedule || repaymentSchedule.length === 0" class="status-warning">
              ⚠️ 请先点击"获取还款计划"按钮
            </div>
            <div v-else-if="!batchPaymentForm.total_amount" class="status-info">
              💡 请输入还款总金额
            </div>
            <div v-else-if="!batchPaymentForm.payment_method" class="status-info">
              💡 请选择支付方式
            </div>
            <div v-else-if="batchPaymentPreview.length === 0" class="status-info">
              💡 请点击"计算分配"生成还款预览
            </div>
            <div v-else class="status-success">
              ✅ 准备就绪，可以执行批量还款
            </div>
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
              {{ !batchPaymentForm.total_amount ? '请先输入金额' : '计算分配' }}
            </button>
            <button 
              type="button" 
              @click="executeBatchPayment" 
              class="confirm-btn" 
              :disabled="isBatchPaymentProcessing || batchPaymentPreview.length === 0"
            >
              {{ isBatchPaymentProcessing ? '处理中...' : (batchPaymentPreview.length === 0 ? '请先计算分配' : '确认批量还款') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { loanCalculatorService, repaymentService } from '../services/index.js'
import { showAlert, showSuccess, showError, showWarning, showConfirm } from '../utils/dialogService.js'
import PrecisionMath from '../utils/precisionMath.js'

export default {
  name: 'UserDashboard',
  emits: ['logout'],
  setup(props, { emit }) {
    const activeTab = ref('overview')
    const editMode = ref(false)
    const showAddTaskModal = ref(false)
    const currentFilter = ref('all')
    const showAddLoanModal = ref(false)
    const showViewLoanModal = ref(false)
    const showEditLoanModal = ref(false)
    const activeDetailTab = ref('basic')
    
    // 计算相关状态
    const isCalculating = ref(false)
    const calculationResult = ref(null)
    
    // 还款计划相关状态
    const isLoadingRepayment = ref(false)
    const repaymentSchedule = ref([])
    const repaymentStats = ref(null)
    
    // 批量还款相关状态
    const showBatchPaymentModal = ref(false)
    const isBatchPaymentProcessing = ref(false)
    const batchPaymentPreview = ref([])
    const batchPaymentRemaining = ref(0)
    const batchPaymentProgress = ref(0)
    const batchPaymentCurrentPeriod = ref(0)
    const batchPaymentTotalPeriods = ref(0)
    const batchPaymentForm = reactive({
      total_amount: 0,
      payment_method: '',
      transaction_id: '',
      paid_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    
    // 加载和错误状态
    const isLoading = ref(false)
    const error = ref(null)
    
    // 当前用户信息
    const currentUser = ref(null)
    
    const menuItems = [
      { id: 'overview', text: '概览', icon: '🏠' },
      { id: 'profile', text: '个人资料', icon: '👤' },
      { id: 'tasks', text: '任务管理', icon: '📝' }
    ]
    
    const userInfo = ref({
      username: '用户001',
      email: 'user001@example.com',
      phone: '138****8888',
      bio: '这是一个热爱学习和工作的用户'
    })
    
    const userStats = ref({
      totalTasks: 0,
      completedTasks: 0,
      activeProjects: 0
    })
    
    const recentActivities = ref([])

    const tasks = ref([])

    const loans = ref([])
    
    const taskFilters = [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '进行中' },
      { value: 'completed', label: '已完成' }
    ]
    
    const newTask = ref({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    })
    
    const newLoan = ref({
      loanName: '',
      applicantName: '',
      amount: '',
      interestRate: '',
      bank: '',
      term: '',
      repaymentMethod: ''
    })
    
    const editingLoan = ref({
      loanName: '',
      applicantName: '',
      amount: '',
      interestRate: '',
      bank: '',
      term: '',
      repaymentMethod: ''
    })
    
    const selectedLoan = ref(null)
    
    const filteredTasks = computed(() => {
      if (currentFilter.value === 'all') {
        return tasks.value
      }
      return tasks.value.filter(task => task.status === currentFilter.value)
    })
    
    const toggleTaskStatus = (task) => {
      task.status = task.status === 'completed' ? 'pending' : 'completed'
    }
    
    const addTask = () => {
      const task = {
        id: Date.now(),
        ...newTask.value,
        status: 'pending'
      }
      tasks.value.push(task)
      newTask.value = { title: '', description: '', priority: 'medium', dueDate: '' }
      showAddTaskModal.value = false
    }
    
    const getLoanStatusText = (status) => {
      const statusMap = {
        'pending': '待审批',
        'approved': '已批准',
        'completed': '已完成'
      }
      return statusMap[status] || status
    }

    // 获取还款方式中文文本
    const getRepaymentMethodText = (method) => {
      const methodMap = {
        'equal_payment': '等额本息',
        'equal_principal': '等额本金'
      }
      return methodMap[method] || method
    }

    // 从后端获取贷款列表
    const fetchLoans = async () => {
      isLoading.value = true
      error.value = null
      
      try {
        const { loanService } = await import('../services/index.js')
        const result = await loanService.getLoans()
        
        console.log('获取贷款列表响应:', result)
        
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
            console.log('转换后的贷款列表:', loans.value)
          } else {
            console.warn('未预期的数据结构:', result.data)
            loans.value = []
          }
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

    const addLoan = async () => {
      // 验证表单
      if (!newLoan.value.loanName.trim()) {
        await showWarning('请输入贷款名称', { title: '表单验证' })
        return
      }
      if (!newLoan.value.applicantName.trim()) {
        await showWarning('请输入申请人姓名', { title: '表单验证' })
        return
      }
      if (!newLoan.value.amount || newLoan.value.amount <= 0) {
        await showWarning('请输入有效的贷款金额', { title: '表单验证' })
        return
      }
      if (!newLoan.value.interestRate || newLoan.value.interestRate <= 0) {
        await showWarning('请输入有效的年利率', { title: '表单验证' })
        return
      }
      if (!newLoan.value.bank.trim()) {
        await showWarning('请输入贷款银行', { title: '表单验证' })
        return
      }
      if (!newLoan.value.term || newLoan.value.term <= 0) {
        await showWarning('请输入有效的还款期限', { title: '表单验证' })
        return
      }
      if (!newLoan.value.repaymentMethod) {
        await showWarning('请选择还款方式', { title: '表单验证' })
        return
      }

      isLoading.value = true
      
      try {
        // 导入贷款服务
        const { loanService } = await import('../services/index.js')
        
        // 还款方式映射：中文转英文
        const repaymentMethodMap = {
          '等额本息': 'equal_payment',
          '等额本金': 'equal_principal'
        }
        
        // 准备发送给后端的数据
        const loanData = {
          loan_name: newLoan.value.loanName,
          applicant_name: newLoan.value.applicantName,
          amount: Number(newLoan.value.amount),
          interest_rate: Number(newLoan.value.interestRate),
          bank: newLoan.value.bank,
          term: Number(newLoan.value.term),
          repayment_method: repaymentMethodMap[newLoan.value.repaymentMethod] || newLoan.value.repaymentMethod,
          status: 'pending'
        }
        
        console.log('发送贷款申请数据:', loanData)
        
        // 调用后端API
        const result = await loanService.createLoan(loanData)
        
        console.log('贷款申请API响应:', result)
        
        if (result.success) {
          // 申请成功，重新获取贷款列表
          await fetchLoans()
          
          // 重置表单
          newLoan.value = {
            loanName: '',
            applicantName: '',
            amount: '',
            interestRate: '',
            bank: '',
            term: '',
            repaymentMethod: ''
          }
          showAddLoanModal.value = false
          
          await showSuccess('贷款申请成功！')
        } else {
          console.error('贷款申请失败:', result.message)
          await showError(`申请失败: ${result.message}`)
        }
      } catch (error) {
        console.error('贷款申请错误:', error)
        const errorMessage = error.response?.data?.message || error.message || '申请失败，请稍后重试'
        await showError(`申请失败: ${errorMessage}`)
      } finally {
        isLoading.value = false
      }
    }
    
    const viewLoan = (loan) => {
      selectedLoan.value = loan
      showViewLoanModal.value = true
      activeDetailTab.value = 'basic'
      // 重置计算结果
      calculationResult.value = null
      repaymentSchedule.value = []
      repaymentStats.value = null
    }
    
    const editLoan = (loan) => {
      editingLoan.value = { ...loan }
      showEditLoanModal.value = true
    }
    
    const updateLoan = async () => {
      if (!editingLoan.value.id) {
        await showError('贷款ID缺失，无法更新', { title: '更新失败' })
        return
      }

      isLoading.value = true
      
      try {
        const { loanService } = await import('../services/index.js')
        
        // 还款方式映射：中文转英文
        const repaymentMethodMap = {
          '等额本息': 'equal_payment',
          '等额本金': 'equal_principal'
        }
        
        const loanData = {
          loan_name: editingLoan.value.loanName,
          applicant_name: editingLoan.value.applicantName,
          amount: Number(editingLoan.value.amount),
          interest_rate: Number(editingLoan.value.interestRate),
          bank: editingLoan.value.bank,
          term: Number(editingLoan.value.term),
          repayment_method: repaymentMethodMap[editingLoan.value.repaymentMethod] || editingLoan.value.repaymentMethod
        }
        
        console.log('更新贷款数据:', loanData)
        
        const result = await loanService.updateLoan(editingLoan.value.id, loanData)
        
        console.log('更新贷款API响应:', result)
        
        if (result.success) {
          // 更新成功，重新获取贷款列表
          await fetchLoans()
          showEditLoanModal.value = false
          await showSuccess('贷款更新成功！')
        } else {
          console.error('更新贷款失败:', result.message)
          await showError(`更新失败: ${result.message}`)
        }
      } catch (error) {
        console.error('更新贷款错误:', error)
        const errorMessage = error.response?.data?.message || error.message || '更新失败，请稍后重试'
        await showError(`更新失败: ${errorMessage}`)
      } finally {
        isLoading.value = false
      }
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
        await showError('计算失败，请稍后重试', { title: '计算错误' })
      } finally {
        isCalculating.value = false
        console.log('计算完成，最终结果:', calculationResult.value)
      }
    }
    
    // 加载还款计划
    const loadRepaymentSchedule = async () => {
      if (!selectedLoan.value || !selectedLoan.value.id) {
        console.warn('贷款ID缺失，无法获取还款计划')
        await showWarning('贷款ID缺失，无法获取还款计划', { title: '数据错误' })
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
          await showWarning('后端未返回还款计划数据，请检查后端实现', { title: '数据异常' })
        }
        
      } catch (error) {
        console.error('获取还款计划失败:', error)
        console.error('错误详情:', error.response?.data)
        
        // 显示具体错误信息
        const errorMessage = error.response?.data?.message || error.message || '获取还款计划失败'
        await showError(`获取还款计划失败: ${errorMessage}`, { title: '加载失败' })
        
        // 清空数据
        repaymentSchedule.value = []
        repaymentStats.value = null
      } finally {
        isLoadingRepayment.value = false
      }
    }
    
    // 生成本地还款计划
    const generateLocalRepaymentSchedule = async () => {
      if (!selectedLoan.value) return
      
      try {
        const schedule = repaymentService.generateLocalRepaymentSchedule(selectedLoan.value)
        repaymentSchedule.value = schedule
        repaymentStats.value = repaymentService.calculatePaymentStats(schedule)
      } catch (error) {
        console.error('生成本地还款计划失败:', error)
        await showError('生成还款计划失败，请检查贷款信息', { title: '生成失败' })
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      return repaymentService.formatDate(dateString)
    }
    
    // 获取还款状态文本
    const getPaymentStatusText = (status) => {
      return repaymentService.getPaymentStatusText(status)
    }
    
    // 计算批量还款分配
    const calculateBatchPayment = () => {
      console.log('🔢 calculateBatchPayment 被触发')
      console.log('输入金额:', batchPaymentForm.total_amount)
      console.log('还款计划数据:', repaymentSchedule.value)
      
      if (!PrecisionMath.isValidNumber(batchPaymentForm.total_amount)) {
        console.error('❌ 金额无效')
        showWarning('请输入有效的还款金额', { title: '输入错误' })
        return
      }
      
      const totalAmount = PrecisionMath.safeDecimal(batchPaymentForm.total_amount)
      if (PrecisionMath.lessThanOrEqual(totalAmount, 0)) {
        showWarning('请输入有效的还款金额', { title: '输入错误' })
        return
      }
      
      if (!repaymentSchedule.value || repaymentSchedule.value.length === 0) {
        showWarning('请先获取还款计划', { title: '数据缺失' })
        return
      }
      
      // 获取所有未还清的期数，按期数排序
      const unpaidSchedules = repaymentSchedule.value
        .filter(schedule => schedule.status !== 'paid')
        .sort((a, b) => a.period_number - b.period_number)
      
      if (unpaidSchedules.length === 0) {
        showAlert('所有期数都已还清', { title: '提示' })
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
      
      console.log('✅ 批量还款分配计算完成')
      console.log('预览数据长度:', preview.length)
      console.log('预览数据:', preview)
      console.log('剩余金额:', PrecisionMath.toNumber(remainingAmount))
      
      showSuccess(`计算完成，可分配${preview.length}期还款`, { title: '计算成功', duration: 3000 })
      
      console.log('批量还款分配预览:', preview)
      console.log('剩余金额:', PrecisionMath.toString(remainingAmount))
    }
    
    // 执行批量还款
    const executeBatchPayment = async () => {
      console.log('🚀 executeBatchPayment 被触发')
      console.log('selectedLoan:', selectedLoan.value)
      console.log('batchPaymentPreview.length:', batchPaymentPreview.value.length)
      console.log('batchPaymentForm:', batchPaymentForm)
      
      if (!selectedLoan.value || !selectedLoan.value.id) {
        console.error('❌ 贷款信息无效')
        showError('贷款信息无效', { title: '数据错误' })
        return
      }
      
      if (batchPaymentPreview.value.length === 0) {
        showWarning('请先计算还款分配', { title: '操作提示' })
        return
      }
      
      if (!batchPaymentForm.payment_method) {
        showWarning('请选择支付方式', { title: '输入错误' })
        return
      }
      
      // 确认批量还款
      console.log('💬 准备显示确认对话框')
      const confirmMessage = `确定要执行批量还款吗？\n总金额: ￥${batchPaymentForm.total_amount?.toLocaleString()}\n分配期数: ${batchPaymentPreview.value.length}期`
      
      try {
        const confirmed = await showConfirm(confirmMessage, { 
          title: '确认批量还款',
          confirmText: '确认还款',
          cancelText: '取消'
        })
        
        console.log('💬 用户确认结果:', confirmed)
        
        if (confirmed) {
          console.log('✅ 用户确认还款，开始处理...')
          await processBatchPayment()
        } else {
          console.log('❌ 用户取消还款')
        }
      } catch (error) {
        console.error('❌ 确认对话框出错:', error)
        showError('确认对话框出错，请刷新页面重试', { title: '系统错误' })
      }
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
        
        showAlert('开始处理批量还款...', { title: '处理中', duration: 2000 })
        
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
          showSuccess(`批量还款完成！成功处理${successCount}期`, { title: '还款成功', duration: 5000 })
        } else if (successCount > 0 && failureCount > 0) {
          showWarning(`批量还款部分完成：成功${successCount}期，失败${failureCount}期`, { title: '部分成功', duration: 8000 })
          console.warn('批量还款错误详情:', errors)
        } else {
          showError(`批量还款失败：${failureCount}期处理失败`, { title: '还款失败', duration: 5000 })
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
        showError('批量还款处理失败，请稍后重试', { title: '系统错误' })
      } finally {
        isBatchPaymentProcessing.value = false
      }
    }
    
    const logout = () => {
      emit('logout')
    }

    // 组件初始化时获取贷款列表
    const initializeComponent = async () => {
      // 获取当前用户信息
      const user = localStorage.getItem('user')
      if (user) {
        currentUser.value = JSON.parse(user)
      }
      
      // 获取贷款列表
      await fetchLoans()
    }

    // 立即初始化
    initializeComponent()
    
    return {
      activeTab,
      userInfo,
      userStats,
      recentActivities,
      tasks,
      loans,
      taskFilters,
      newTask,
      showAddTaskModal,
      currentFilter,
      showAddLoanModal,
      showViewLoanModal,
      showEditLoanModal,
      newLoan,
      editingLoan,
      selectedLoan,
      activeDetailTab,
      isCalculating,
      calculationResult,
      isLoadingRepayment,
      repaymentSchedule,
      repaymentStats,
      showBatchPaymentModal,
      isBatchPaymentProcessing,
      batchPaymentPreview,
      batchPaymentRemaining,
      batchPaymentProgress,
      batchPaymentCurrentPeriod,
      batchPaymentTotalPeriods,
      batchPaymentForm,
      isLoading,
      error,
      currentUser,
      filteredTasks,
      toggleTaskStatus,
      addTask,
      addLoan,
      viewLoan,
      editLoan,
      updateLoan,
      calculateLoan,
      loadRepaymentSchedule,
      calculateBatchPayment,
      executeBatchPayment,
      fetchLoans,
      formatDate,
      getPaymentStatusText,
      getLoanStatusText,
      getRepaymentMethodText,
      logout
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.user-header {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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

.user-badge {
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

.avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  background: #e8f5f4;
  border-left-color: #4ecdc4;
  color: #4ecdc4;
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

.welcome-card {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.welcome-content p {
  opacity: 0.9;
}

.welcome-image {
  font-size: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 35px;
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #333;
}

.stat-info p {
  color: #666;
  font-size: 14px;
}

.activity-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.activity-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
}

.activity-icon {
  font-size: 20px;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #666;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-header h2 {
  color: #333;
  font-size: 24px;
}

.edit-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.profile-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 40px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.large-avatar {
  width: 120px;
  height: 120px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  color: #666;
}

.change-avatar-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.form-fields {
  flex: 1;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
}

.form-group input.disabled,
.form-group textarea.disabled {
  background: #f8f9fa;
  color: #666;
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

.tasks-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: #4ecdc4;
  border-color: #4ecdc4;
  color: white;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
}

.task-item.completed {
  opacity: 0.7;
}

.task-status {
  cursor: pointer;
  font-size: 20px;
}

.checkbox {
  color: #ddd;
}

.task-content {
  flex: 1;
}

.task-content h4 {
  margin-bottom: 8px;
  color: #333;
}

.task-content p {
  color: #666;
  margin-bottom: 10px;
}

.task-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

.task-priority {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.task-priority.high {
  background: #ffebee;
  color: #d32f2f;
}

.task-priority.medium {
  background: #fff3e0;
  color: #ff9800;
}

.task-priority.low {
  background: #e8f5e8;
  color: #4caf50;
}

.task-due {
  font-size: 12px;
  color: #666;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

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
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.confirm-btn {
  padding: 10px 20px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background: #0056b3;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-item span {
  color: #666;
}

/* 贷款相关样式 */
.loan-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background: #0056b3;
}

.loans-table {
  overflow-x: auto;
}

.loans-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.loans-table th,
.loans-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.loans-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.loan-name {
  font-weight: 500;
  color: #007bff;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.rate {
  color: #dc3545;
  font-weight: 500;
}

.term {
  color: #6c757d;
}

.repayment-method {
  text-align: center;
  color: #495057;
}

.loan-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.loan-status.pending {
  background: #fff3cd;
  color: #856404;
}

.loan-status.approved {
  background: #d4edda;
  color: #155724;
}

.loan-status.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.action-btn {
  padding: 6px 12px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn.view {
  background: #17a2b8;
  color: white;
}

.action-btn.view:hover {
  background: #138496;
}

.action-btn.edit {
  background: #ffc107;
  color: #212529;
}

.action-btn.edit:hover {
  background: #e0a800;
}

.empty-loans-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-loans-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-loans-state h3 {
  margin: 0 0 8px 0;
  color: #495057;
}

.empty-loans-state p {
  margin: 0;
  font-size: 14px;
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .profile-form {
    flex-direction: column;
    gap: 20px;
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
  background: #4ecdc4;
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
  color: #4ecdc4;
}

.tab-btn.active {
  color: #4ecdc4;
  border-bottom-color: #4ecdc4;
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
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.calc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  border-top: 2px solid #4ecdc4;
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
  border-left: 4px solid #4ecdc4;
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
  background: #e8f5f4;
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

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
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

/* 批量还款相关样式 */
.batch-payment-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-left: 10px;
}

.batch-payment-steps {
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.steps-hint {
  margin: 0;
  font-size: 14px;
  color: #0066cc;
  line-height: 1.4;
}

.steps-hint strong {
  color: #004499;
}

.form-status-hints {
  margin: 15px 0;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #b8daff;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.batch-payment-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.batch-payment-modal {
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.batch-payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
}

.payment-preview h4 {
  margin-top: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.preview-summary p {
  margin: 0;
  padding: 8px 0;
  font-size: 14px;
}

.preview-summary strong {
  color: #495057;
  font-weight: 600;
}

.preview-table {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 13px;
  border-bottom: 2px solid #dee2e6;
}

.preview-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
}

.preview-table tr:hover {
  background: #f8f9fa;
}

.preview-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  background: #e2e3e5;
  color: #6c757d;
}

.preview-more {
  padding: 15px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.batch-payment-progress {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
}

.batch-payment-progress h4 {
  margin-top: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
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
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-status {
  text-align: center;
}

.progress-status small {
  color: #6c757d;
  font-style: italic;
}

.repayment-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.repayment-controls .calc-btn {
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .batch-payment-modal {
    max-width: 95vw;
    margin: 20px auto;
  }
  
  .preview-summary {
    grid-template-columns: 1fr;
  }
  
  .preview-table {
    overflow-x: auto;
  }
  
  .preview-table table {
    min-width: 600px;
  }
  
  .repayment-controls {
    flex-direction: column;
  }
  
  .repayment-controls .calc-btn {
    width: 100%;
  }
}
</style> 