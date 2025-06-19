import axios from 'axios'
import { API_CONFIG, generateRequestId } from '../config/api.js'

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

export class LoanCalculatorService {
  constructor() {
    this.baseUrl = '/loans/calculate'
  }

  // 等额本息计算
  async calculateEqualInstallment(principal, annualRate, months) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/equal-installment`, {
        principal,
        annual_rate: annualRate,
        months
      })
      return response.data
    } catch (error) {
      console.error('等额本息计算失败:', error)
      throw error
    }
  }

  // 等额本金计算
  async calculateEqualPrincipal(principal, annualRate, months) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/equal-principal`, {
        principal,
        annual_rate: annualRate,
        months
      })
      return response.data
    } catch (error) {
      console.error('等额本金计算失败:', error)
      throw error
    }
  }

  // 比较两种还款方式
  async compareRepaymentMethods(principal, annualRate, months) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/compare`, {
        principal,
        annual_rate: annualRate,
        months
      })
      return response.data
    } catch (error) {
      console.error('还款方式比较失败:', error)
      throw error
    }
  }

  // 提前还款计算
  async calculatePrepayment(loanData) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/prepayment`, loanData)
      return response.data
    } catch (error) {
      console.error('提前还款计算失败:', error)
      throw error
    }
  }

  // 本地计算（作为备用）
  calculateEqualInstallmentLocal(principal, annualRate, months) {
    const monthlyRate = annualRate / 12
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1)
    
    const totalPayment = monthlyPayment * months
    const totalInterest = totalPayment - principal
    
    // 生成还款计划
    const schedule = []
    let remainingPrincipal = principal
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingPrincipal * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingPrincipal -= principalPayment
      
      schedule.push({
        period: i,
        monthlyPayment: Number(monthlyPayment.toFixed(2)),
        principalPayment: Number(principalPayment.toFixed(2)),
        interestPayment: Number(interestPayment.toFixed(2)),
        remainingPrincipal: Number(Math.max(0, remainingPrincipal).toFixed(2))
      })
    }
    
    return {
      type: 'equalInstallment',
      principal,
      annualRate,
      months,
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      schedule
    }
  }

  calculateEqualPrincipalLocal(principal, annualRate, months) {
    const monthlyRate = annualRate / 12
    const monthlyPrincipal = principal / months
    
    let totalPayment = 0
    let totalInterest = 0
    const schedule = []
    let remainingPrincipal = principal
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingPrincipal * monthlyRate
      const monthlyPayment = monthlyPrincipal + interestPayment
      remainingPrincipal -= monthlyPrincipal
      
      totalPayment += monthlyPayment
      totalInterest += interestPayment
      
      schedule.push({
        period: i,
        monthlyPayment: Number(monthlyPayment.toFixed(2)),
        principalPayment: Number(monthlyPrincipal.toFixed(2)),
        interestPayment: Number(interestPayment.toFixed(2)),
        remainingPrincipal: Number(Math.max(0, remainingPrincipal).toFixed(2))
      })
    }
    
    return {
      type: 'equalPrincipal',
      principal,
      annualRate,
      months,
      monthlyPrincipal: Number(monthlyPrincipal.toFixed(2)),
      firstMonthPayment: schedule[0].monthlyPayment,
      lastMonthPayment: schedule[schedule.length - 1].monthlyPayment,
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      schedule
    }
  }
}

export const loanCalculatorService = new LoanCalculatorService() 