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
                    <td class="repayment-method">{{ loan.repaymentMethod }}</td>
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
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { loanCalculatorService, repaymentService } from '../services/index.js'

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

    const addLoan = () => {
      const loan = {
        id: Date.now(),
        ...newLoan.value,
        amount: Number(newLoan.value.amount),
        interestRate: Number(newLoan.value.interestRate),
        term: Number(newLoan.value.term),
        status: 'pending',
        applicationDate: new Date().toLocaleDateString()
      }
      loans.value.push(loan)
      
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
    
    const updateLoan = () => {
      const index = loans.value.findIndex(loan => loan.id === editingLoan.value.id)
      if (index !== -1) {
        loans.value[index] = {
          ...editingLoan.value,
          amount: Number(editingLoan.value.amount),
          interestRate: Number(editingLoan.value.interestRate),
          term: Number(editingLoan.value.term)
        }
      }
      showEditLoanModal.value = false
    }
    
    // 贷款计算功能
    const calculateLoan = async (type) => {
      if (!selectedLoan.value) return
      
      isCalculating.value = true
      
      try {
        const principal = Number(selectedLoan.value.amount)
        const annualRate = Number(selectedLoan.value.interestRate) / 100
        const months = Number(selectedLoan.value.term)
        
        if (type === 'equal-installment') {
          try {
            const result = await loanCalculatorService.calculateEqualInstallment(principal, annualRate, months)
            calculationResult.value = result
          } catch (error) {
            console.warn('API计算失败，使用本地计算:', error)
            calculationResult.value = loanCalculatorService.calculateEqualInstallmentLocal(principal, annualRate, months)
          }
        } else if (type === 'equal-principal') {
          try {
            const result = await loanCalculatorService.calculateEqualPrincipal(principal, annualRate, months)
            calculationResult.value = result
          } catch (error) {
            console.warn('API计算失败，使用本地计算:', error)
            calculationResult.value = loanCalculatorService.calculateEqualPrincipalLocal(principal, annualRate, months)
          }
        } else if (type === 'compare') {
          try {
            const result = await loanCalculatorService.compareRepaymentMethods(principal, annualRate, months)
            calculationResult.value = result
          } catch (error) {
            console.warn('API比较失败，使用本地计算:', error)
            const equalInstallment = loanCalculatorService.calculateEqualInstallmentLocal(principal, annualRate, months)
            const equalPrincipal = loanCalculatorService.calculateEqualPrincipalLocal(principal, annualRate, months)
            
            calculationResult.value = {
              equalInstallment,
              equalPrincipal,
              comparison: {
                interestDifference: equalInstallment.totalInterest - equalPrincipal.totalInterest,
                paymentDifference: equalInstallment.totalPayment - equalPrincipal.totalPayment,
                recommendation: `等额本金比等额本息少支付利息 ${(equalInstallment.totalInterest - equalPrincipal.totalInterest).toLocaleString()} 元`
              }
            }
          }
        }
      } catch (error) {
        console.error('贷款计算失败:', error)
        alert('计算失败，请稍后重试')
      } finally {
        isCalculating.value = false
      }
    }
    
    // 加载还款计划
    const loadRepaymentSchedule = async () => {
      if (!selectedLoan.value || !selectedLoan.value.id) {
        console.warn('贷款ID缺失，无法获取还款计划')
        alert('贷款ID缺失，无法获取还款计划')
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
          alert('后端未返回还款计划数据，请检查后端实现')
        }
        
      } catch (error) {
        console.error('获取还款计划失败:', error)
        console.error('错误详情:', error.response?.data)
        
        // 显示具体错误信息
        const errorMessage = error.response?.data?.message || error.message || '获取还款计划失败'
        alert(`获取还款计划失败: ${errorMessage}`)
        
        // 清空数据
        repaymentSchedule.value = []
        repaymentStats.value = null
      } finally {
        isLoadingRepayment.value = false
      }
    }
    
    // 生成本地还款计划
    const generateLocalRepaymentSchedule = () => {
      if (!selectedLoan.value) return
      
      try {
        const schedule = repaymentService.generateLocalRepaymentSchedule(selectedLoan.value)
        repaymentSchedule.value = schedule
        repaymentStats.value = repaymentService.calculatePaymentStats(schedule)
      } catch (error) {
        console.error('生成本地还款计划失败:', error)
        alert('生成还款计划失败，请检查贷款信息')
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
    
    const logout = () => {
      emit('logout')
    }
    
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
      filteredTasks,
      toggleTaskStatus,
      addTask,
      addLoan,
      viewLoan,
      editLoan,
      updateLoan,
      calculateLoan,
      loadRepaymentSchedule,
      formatDate,
      getPaymentStatusText,
      getLoanStatusText,
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
</style> 