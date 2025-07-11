import axios from 'axios'
import { API_CONFIG, generateRequestId } from '../config/api.js'
import PrecisionMath from '../utils/precisionMath.js'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-ID'] = generateRequestId()
    return config
  },
  (error) => Promise.reject(error)
)

export class RepaymentService {
  constructor() {
    this.baseUrl = '/loans'
  }

  // 获取贷款还款计划
  async getRepaymentSchedule(loanId, page = 1, perPage = 50, status = null) {
    try {
      let url = `${this.baseUrl}/${loanId}/repayment-schedule?page=${page}&per_page=${perPage}`
      if (status) {
        url += `&status=${status}`
      }

      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('获取还款计划失败:', error)
      throw error
    }
  }

  // 获取还款统计
  async getPaymentStats(loanId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${loanId}/payment-stats`)
      return response.data
    } catch (error) {
      console.error('获取还款统计失败:', error)
      throw error
    }
  }

  // 记录还款（管理员功能）
  async recordPayment(loanId, periodNumber, paymentData) {
    try {
      console.log('记录还款，贷款ID:', loanId, '期数:', periodNumber)
      console.log('还款数据:', paymentData)
      
      const response = await apiClient.post(
        `${this.baseUrl}/${loanId}/payments`,
        {
          period_number: periodNumber,
          paid_amount: paymentData.paid_amount,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
          paid_date: paymentData.paid_date,
          notes: paymentData.notes
        }
      )
      return response.data
    } catch (error) {
      console.error('记录还款失败:', error)
      throw error
    }
  }

  // 修改单期还款计划
  async modifySchedulePeriod(loanId, periodNumber, updateData) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${loanId}/repayment-schedule/${periodNumber}`, updateData)
      return response.data
    } catch (error) {
      console.error('修改还款计划失败:', error)
      throw error
    }
  }

  // 批量修改还款计划
  async batchModifySchedule(loanId, schedules) {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${loanId}/repayment-schedule/batch`, { schedules })
      return response.data
    } catch (error) {
      console.error('批量修改还款计划失败:', error)
      throw error
    }
  }

  // 验证修改数据
  validateModificationData(data) {
    const errors = []
    
    // 验证日期格式
    if (data.due_date && !this.isValidDate(data.due_date)) {
      errors.push('还款日期格式不正确')
    }
    
    // 验证金额
    if (data.total_amount !== undefined && data.total_amount <= 0) {
      errors.push('应还总额必须大于0')
    }
    
    if (data.principal_amount !== undefined && data.principal_amount < 0) {
      errors.push('应还本金不能为负数')
    }
    
    if (data.interest_amount !== undefined && data.interest_amount < 0) {
      errors.push('应还利息不能为负数')
    }
    
    // 验证本金+利息=总额
    if (data.total_amount !== undefined && 
        data.principal_amount !== undefined && 
        data.interest_amount !== undefined) {
      const sum = PrecisionMath.add(
        PrecisionMath.add(
          PrecisionMath.safeDecimal(data.principal_amount),
          PrecisionMath.safeDecimal(data.interest_amount)
        ),
        PrecisionMath.safeDecimal(data.late_fee, 0)
      )
      const totalAmount = PrecisionMath.safeDecimal(data.total_amount)
      if (!PrecisionMath.equals(sum, totalAmount, 0.01)) {
        errors.push('本金、利息和滞纳金之和必须等于总还款额')
      }
    }
    
    return errors
  }

  // 验证日期格式
  isValidDate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  }

  // 生成本地还款计划（作为备用）
  generateLocalRepaymentSchedule(loanData) {
    const { amount, interestRate, term, repaymentMethod } = loanData
    const principal = PrecisionMath.toNumber(PrecisionMath.safeDecimal(amount))
    const annualRate = PrecisionMath.toNumber(PrecisionMath.divide(PrecisionMath.safeDecimal(interestRate), 100))
    const months = PrecisionMath.toNumber(PrecisionMath.safeDecimal(term))
    
    console.log('还款计划生成参数:', { principal, annualRate, months, repaymentMethod })
    
    // 兼容中英文还款方式
    if (repaymentMethod === '等额本息' || repaymentMethod === 'equal_payment' || repaymentMethod === 'equal_installment') {
      return this.generateEqualInstallmentSchedule(principal, annualRate, months)
    } else if (repaymentMethod === '等额本金' || repaymentMethod === 'equal_principal') {
      return this.generateEqualPrincipalSchedule(principal, annualRate, months)
    } else {
      console.warn('未识别的还款方式，默认使用等额本息:', repaymentMethod)
      // 默认使用等额本息
      return this.generateEqualInstallmentSchedule(principal, annualRate, months)
    }
  }

  // 生成等额本息还款计划
  generateEqualInstallmentSchedule(principal, annualRate, months) {
    console.log('开始生成等额本息计划:', { principal, annualRate, months })
    
    const P = PrecisionMath.safeDecimal(principal)
    const r = PrecisionMath.safeDecimal(annualRate)
    const n = PrecisionMath.safeDecimal(months)
    
    if (!PrecisionMath.isValidNumber(principal) || !PrecisionMath.isValidNumber(annualRate) || !PrecisionMath.isValidNumber(months) ||
        PrecisionMath.lessThanOrEqual(P, 0) || PrecisionMath.lessThan(r, 0) || PrecisionMath.lessThanOrEqual(n, 0)) {
      console.error('参数无效:', { principal, annualRate, months })
      return []
    }
    
    const monthlyRate = PrecisionMath.divide(r, 12)
    const monthlyPayment = PrecisionMath.calculateEqualInstallment(P, r, PrecisionMath.toNumber(n))
    
    console.log('计算结果:', { 
      monthlyRate: PrecisionMath.toString(monthlyRate, 6), 
      monthlyPayment: PrecisionMath.toString(monthlyPayment) 
    })
    
    const schedule = []
    let remainingPrincipal = P
    
    for (let i = 1; i <= PrecisionMath.toNumber(n); i++) {
      const interestPayment = PrecisionMath.multiply(remainingPrincipal, monthlyRate)
      const principalPayment = PrecisionMath.subtract(monthlyPayment, interestPayment)
      remainingPrincipal = PrecisionMath.subtract(remainingPrincipal, principalPayment)
      
      // 生成到期日期（假设从当前月份开始）
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + i)
      
      schedule.push({
        period_number: i,
        due_date: dueDate.toISOString(),
        total_amount: PrecisionMath.toNumber(PrecisionMath.round(monthlyPayment)),
        principal_amount: PrecisionMath.toNumber(PrecisionMath.round(principalPayment)),
        interest_amount: PrecisionMath.toNumber(PrecisionMath.round(interestPayment)),
        remaining_principal: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.greaterThan(remainingPrincipal, 0) ? remainingPrincipal : PrecisionMath.decimal(0))),
        status: 'pending',
        paid_amount: 0,
        paid_principal: 0,
        paid_interest: 0,
        paid_date: null,
        payment_method: null,
        transaction_id: null,
        late_fee: 0,
        notes: null
      })
    }
    
    console.log('生成的等额本息计划长度:', schedule.length)
    if (schedule.length > 0) {
      console.log('第一期示例:', schedule[0])
    }
    
    return schedule
  }

  // 生成等额本金还款计划
  generateEqualPrincipalSchedule(principal, annualRate, months) {
    const P = PrecisionMath.safeDecimal(principal)
    const r = PrecisionMath.safeDecimal(annualRate)
    const n = PrecisionMath.safeDecimal(months)
    
    const monthlyRate = PrecisionMath.divide(r, 12)
    const monthlyPrincipal = PrecisionMath.divide(P, n)
    
    const schedule = []
    let remainingPrincipal = P
    
    for (let i = 1; i <= PrecisionMath.toNumber(n); i++) {
      const interestPayment = PrecisionMath.multiply(remainingPrincipal, monthlyRate)
      const monthlyPayment = PrecisionMath.add(monthlyPrincipal, interestPayment)
      remainingPrincipal = PrecisionMath.subtract(remainingPrincipal, monthlyPrincipal)
      
      // 生成到期日期
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + i)
      
      schedule.push({
        period_number: i,
        due_date: dueDate.toISOString(),
        total_amount: PrecisionMath.toNumber(PrecisionMath.round(monthlyPayment)),
        principal_amount: PrecisionMath.toNumber(PrecisionMath.round(monthlyPrincipal)),
        interest_amount: PrecisionMath.toNumber(PrecisionMath.round(interestPayment)),
        remaining_principal: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.greaterThan(remainingPrincipal, 0) ? remainingPrincipal : PrecisionMath.decimal(0))),
        status: 'pending',
        paid_amount: 0,
        paid_principal: 0,
        paid_interest: 0,
        paid_date: null,
        payment_method: null,
        transaction_id: null,
        late_fee: 0,
        notes: null
      })
    }
    
    return schedule
  }

  // 获取还款状态文本
  getPaymentStatusText(status) {
    const statusMap = {
      'pending': '待还款',
      'paid': '已还款',
      'overdue': '已逾期',
      'partial': '部分还款'
    }
    return statusMap[status] || status
  }

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN')
  }

  // 计算还款统计
  calculatePaymentStats(schedule) {
    const stats = {
      total_periods: schedule.length,
      paid_periods: 0,
      pending_periods: 0,
      overdue_periods: 0,
      partial_periods: 0,
      total_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      payment_progress: 0
    }

    let totalAmount = PrecisionMath.decimal(0)
    let paidAmount = PrecisionMath.decimal(0)

    schedule.forEach(item => {
      totalAmount = PrecisionMath.add(totalAmount, PrecisionMath.safeDecimal(item.total_amount))
      paidAmount = PrecisionMath.add(paidAmount, PrecisionMath.safeDecimal(item.paid_amount))
      
      switch (item.status) {
        case 'paid':
          stats.paid_periods++
          break
        case 'pending':
          stats.pending_periods++
          break
        case 'overdue':
          stats.overdue_periods++
          break
        case 'partial':
          stats.partial_periods++
          break
      }
    })

    stats.total_amount = PrecisionMath.toNumber(PrecisionMath.round(totalAmount))
    stats.paid_amount = PrecisionMath.toNumber(PrecisionMath.round(paidAmount))
    stats.remaining_amount = PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.subtract(totalAmount, paidAmount)))
    
    stats.payment_progress = PrecisionMath.greaterThan(totalAmount, 0) ? 
      PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.multiply(PrecisionMath.divide(paidAmount, totalAmount), 100))) : 0

    return stats
  }
}

export const repaymentService = new RepaymentService() 