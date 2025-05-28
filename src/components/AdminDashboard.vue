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
                    <button @click="approveLoan(loan)" class="action-btn approve" v-if="loan.status === 'pending'">审批</button>
                    <button @click="editLoan(loan)" class="action-btn edit">编辑</button>
                    <button @click="deleteLoan(loan)" class="action-btn delete">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
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
            <input v-model.number="newLoan.amount" type="number" required />
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model.number="newLoan.interestRate" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="newLoan.bank" type="text" required />
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model.number="newLoan.term" type="number" required />
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
      <div class="modal-content" @click.stop>
        <h3>贷款详情</h3>
        <div class="loan-details" v-if="selectedLoan">
          <div class="detail-item">
            <label>贷款ID:</label>
            <span>{{ selectedLoan.id }}</span>
          </div>
          <div class="detail-item">
            <label>贷款名称:</label>
            <span>{{ selectedLoan.loanName }}</span>
          </div>
          <div class="detail-item">
            <label>申请人:</label>
            <span>{{ selectedLoan.applicantName }}</span>
          </div>
          <div class="detail-item">
            <label>贷款金额:</label>
            <span>￥{{ selectedLoan.amount?.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <label>年利率:</label>
            <span>{{ selectedLoan.interestRate }}%</span>
          </div>
          <div class="detail-item">
            <label>贷款银行:</label>
            <span>{{ selectedLoan.bank }}</span>
          </div>
          <div class="detail-item">
            <label>还款期限:</label>
            <span>{{ selectedLoan.term }}个月</span>
          </div>
          <div class="detail-item">
            <label>还款方式:</label>
            <span>{{ selectedLoan.repaymentMethod }}</span>
          </div>
          <div class="detail-item">
            <label>申请状态:</label>
            <span :class="['loan-status', selectedLoan.status]">
              {{ getLoanStatusText(selectedLoan.status) }}
            </span>
          </div>
          <div class="detail-item">
            <label>申请时间:</label>
            <span>{{ selectedLoan.applicationDate }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showViewLoanModal = false" class="confirm-btn">关闭</button>
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
            <input v-model.number="editingLoan.amount" type="number" required />
          </div>
          <div class="form-group">
            <label>年利率(%)</label>
            <input v-model.number="editingLoan.interestRate" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>贷款银行</label>
            <input v-model="editingLoan.bank" type="text" required />
          </div>
          <div class="form-group">
            <label>还款期限(月)</label>
            <input v-model.number="editingLoan.term" type="number" required />
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
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/authStore.js'
import { loanService, userService } from '../services/index.js'

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
    const isLoading = ref(false)
    const error = ref(null)
    
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
          // 检查数据结构
          if (result.data && Array.isArray(result.data)) {
            loans.value = result.data
            console.log('直接使用 result.data 数组:', result.data)
          } else if (result.data && result.data.loans && Array.isArray(result.data.loans)) {
            loans.value = result.data.loans
            console.log('使用 result.data.loans 数组:', result.data.loans)
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
          amount: Number(newLoan.amount),
          interest_rate: Number(newLoan.interestRate),
          bank: newLoan.bank,
          term: Number(newLoan.term),
          repayment_method: repaymentMethodMap[newLoan.repaymentMethod] || newLoan.repaymentMethod,
          applicant_id: currentUser.value?.id || currentUser.value?._id || 1,
          status: 'pending'
        }
        
        console.log('发送贷款数据（下划线格式）:', loanData)
        console.log('还款方式映射:', newLoan.repaymentMethod, '->', loanData.repayment_method)
        console.log('当前用户:', currentUser.value)
        
        const result = await loanService.createLoan(loanData)
        
        if (result.success) {
          // 重新获取贷款列表
          await fetchLoans()
          
          // 重置表单
          resetLoanForm()
          showAddLoanModal.value = false
          
          alert('贷款添加成功！')
        } else {
          console.error('添加失败详情:', result)
          console.error('错误信息:', result.message)
          console.error('详细错误:', result.errors)
          alert(`添加失败: ${result.message}\n详细信息: ${JSON.stringify(result.errors || {})}`)
        }
      } catch (err) {
        console.error('添加贷款完整错误:', err)
        console.error('错误响应:', err.response?.data)
        alert(`添加贷款失败: ${err.message}\n详细信息: ${JSON.stringify(err.response?.data || {})}`)
      } finally {
        isLoading.value = false
      }
    }
    
    // 审批贷款
    const approveLoan = async (loan) => {
      const action = confirm(`确定要审批贷款 "${loan.loanName}" 吗？`)
      if (!action) return
      
      isLoading.value = true
      
      try {
        const result = await loanService.approveLoan(loan.id)
        
        if (result.success) {
          // 重新获取贷款列表
          await fetchLoans()
          alert('贷款审批成功！')
        } else {
          alert(`审批失败: ${result.message}`)
        }
      } catch (err) {
        alert('审批失败，请稍后重试')
        console.error('审批贷款错误:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // 删除贷款
    const deleteLoan = async (loan) => {
      const confirmed = confirm(`确定要删除贷款 "${loan.loanName}" 吗？此操作不可撤销。`)
      if (!confirmed) return
      
      isLoading.value = true
      
      try {
        const result = await loanService.deleteLoan(loan.id)
        
        if (result.success) {
          // 重新获取贷款列表
          await fetchLoans()
          alert('贷款删除成功！')
        } else {
          alert(`删除失败: ${result.message}`)
        }
      } catch (err) {
        alert('删除失败，请稍后重试')
        console.error('删除贷款错误:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // 查看贷款详情
    const viewLoan = (loan) => {
      selectedLoan.value = loan
      showViewLoanModal.value = true
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
          alert('贷款更新成功！')
        } else {
          alert(`更新失败: ${result.message}`)
        }
      } catch (err) {
        alert('更新贷款失败，请稍后重试')
        console.error('更新贷款错误:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    // 验证贷款表单
    const validateLoanForm = () => {
      if (!newLoan.loanName.trim()) {
        alert('请输入贷款名称')
        return false
      }
      if (!newLoan.applicantName.trim()) {
        alert('请输入申请人姓名')
        return false
      }
      if (newLoan.amount <= 0) {
        alert('请输入有效的贷款金额')
        return false
      }
      if (newLoan.interestRate <= 0) {
        alert('请输入有效的年利率')
        return false
      }
      if (!newLoan.bank.trim()) {
        alert('请输入贷款银行')
        return false
      }
      if (newLoan.term <= 0) {
        alert('请输入有效的还款期限')
        return false
      }
      if (!newLoan.repaymentMethod) {
        alert('请选择还款方式')
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
        alert('请输入贷款名称')
        return false
      }
      if (!editingLoan.applicantName.trim()) {
        alert('请输入申请人姓名')
        return false
      }
      if (editingLoan.amount <= 0) {
        alert('请输入有效的贷款金额')
        return false
      }
      if (editingLoan.interestRate <= 0) {
        alert('请输入有效的年利率')
        return false
      }
      if (!editingLoan.bank.trim()) {
        alert('请输入贷款银行')
        return false
      }
      if (editingLoan.term <= 0) {
        alert('请输入有效的还款期限')
        return false
      }
      if (!editingLoan.repaymentMethod) {
        alert('请选择还款方式')
        return false
      }
      return true
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
    
    // 登出
    const logout = async () => {
      const confirmed = confirm('确定要退出登录吗？')
      if (!confirmed) return
      
      await authStore.logout()
      emit('go-to-login')
    }
    
    // 组件挂载时初始化数据
    onMounted(async () => {
      // 检查用户权限
      if (!authStore.isAdmin.value) {
        alert('权限不足，请使用管理员账户登录')
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
    
    return {
      // 响应式数据
      activeTab,
      showAddLoanModal,
      showViewLoanModal,
      showEditLoanModal,
      isLoading,
      error,
      loans,
      users,
      logs,
      statistics,
      newLoan,
      selectedLoan,
      editingLoan,
      menuItems,
      
      // 计算属性
      currentUser,
      
      // 方法
      addLoan,
      approveLoan,
      deleteLoan,
      viewLoan,
      editLoan,
      getLoanStatusText,
      logout,
      fetchLoans,
      fetchUsers,
      updateLoan
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

.loans-table table {
  width: 100%;
  border-collapse: collapse;
}

.loans-table th,
.loans-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.loans-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.amount {
  text-align: right;
}

.loan-name {
  font-weight: 500;
  color: #333;
}

.rate {
  text-align: center;
  font-weight: 600;
  color: #ff9800;
}

.term {
  text-align: center;
  color: #666;
}

.repayment-method {
  text-align: center;
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
</style> 