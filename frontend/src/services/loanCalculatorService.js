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
    const P = PrecisionMath.safeDecimal(principal)
    const r = PrecisionMath.divide(PrecisionMath.safeDecimal(annualRate), 12) // 月利率
    const n = PrecisionMath.safeDecimal(months)
    
    const monthlyPayment = PrecisionMath.calculateEqualInstallment(P, PrecisionMath.multiply(r, 12), PrecisionMath.toNumber(n))
    const totalPayment = PrecisionMath.multiply(monthlyPayment, n)
    const totalInterest = PrecisionMath.subtract(totalPayment, P)
    
    // 生成还款计划
    const schedule = []
    let remainingPrincipal = P
    
    for (let i = 1; i <= PrecisionMath.toNumber(n); i++) {
      const interestPayment = PrecisionMath.multiply(remainingPrincipal, r)
      const principalPayment = PrecisionMath.subtract(monthlyPayment, interestPayment)
      remainingPrincipal = PrecisionMath.subtract(remainingPrincipal, principalPayment)
      
      schedule.push({
        period: i,
        monthlyPayment: PrecisionMath.toNumber(PrecisionMath.round(monthlyPayment)),
        principalPayment: PrecisionMath.toNumber(PrecisionMath.round(principalPayment)),
        interestPayment: PrecisionMath.toNumber(PrecisionMath.round(interestPayment)),
        remainingPrincipal: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.greaterThan(remainingPrincipal, 0) ? remainingPrincipal : PrecisionMath.decimal(0)))
      })
    }
    
    return {
      type: 'equalInstallment',
      principal: PrecisionMath.toNumber(P),
      annualRate: PrecisionMath.toNumber(PrecisionMath.multiply(r, 12)),
      months: PrecisionMath.toNumber(n),
      monthlyPayment: PrecisionMath.toNumber(PrecisionMath.round(monthlyPayment)),
      totalPayment: PrecisionMath.toNumber(PrecisionMath.round(totalPayment)),
      totalInterest: PrecisionMath.toNumber(PrecisionMath.round(totalInterest)),
      schedule
    }
  }

  calculateEqualPrincipalLocal(principal, annualRate, months) {
    const P = PrecisionMath.safeDecimal(principal)
    const r = PrecisionMath.divide(PrecisionMath.safeDecimal(annualRate), 12) // 月利率
    const n = PrecisionMath.safeDecimal(months)
    const monthlyPrincipal = PrecisionMath.divide(P, n)
    
    let totalPayment = PrecisionMath.decimal(0)
    let totalInterest = PrecisionMath.decimal(0)
    const schedule = []
    let remainingPrincipal = P
    
    for (let i = 1; i <= PrecisionMath.toNumber(n); i++) {
      const interestPayment = PrecisionMath.multiply(remainingPrincipal, r)
      const monthlyPayment = PrecisionMath.add(monthlyPrincipal, interestPayment)
      remainingPrincipal = PrecisionMath.subtract(remainingPrincipal, monthlyPrincipal)
      
      totalPayment = PrecisionMath.add(totalPayment, monthlyPayment)
      totalInterest = PrecisionMath.add(totalInterest, interestPayment)
      
      schedule.push({
        period: i,
        monthlyPayment: PrecisionMath.toNumber(PrecisionMath.round(monthlyPayment)),
        principalPayment: PrecisionMath.toNumber(PrecisionMath.round(monthlyPrincipal)),
        interestPayment: PrecisionMath.toNumber(PrecisionMath.round(interestPayment)),
        remainingPrincipal: PrecisionMath.toNumber(PrecisionMath.round(PrecisionMath.greaterThan(remainingPrincipal, 0) ? remainingPrincipal : PrecisionMath.decimal(0)))
      })
    }
    
    return {
      type: 'equalPrincipal',
      principal: PrecisionMath.toNumber(P),
      annualRate: PrecisionMath.toNumber(PrecisionMath.multiply(r, 12)),
      months: PrecisionMath.toNumber(n),
      monthlyPrincipal: PrecisionMath.toNumber(PrecisionMath.round(monthlyPrincipal)),
      firstMonthPayment: schedule[0].monthlyPayment,
      lastMonthPayment: schedule[schedule.length - 1].monthlyPayment,
      totalPayment: PrecisionMath.toNumber(PrecisionMath.round(totalPayment)),
      totalInterest: PrecisionMath.toNumber(PrecisionMath.round(totalInterest)),
      schedule
    }
  }
}

export const loanCalculatorService = new LoanCalculatorService() 