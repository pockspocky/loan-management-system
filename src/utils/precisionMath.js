import Decimal from 'decimal.js'

// 配置Decimal.js的精度和舍入模式
Decimal.set({
  precision: 28,  // 28位精度
  rounding: Decimal.ROUND_HALF_UP,  // 四舍五入
  toExpNeg: -7,   // 指数表示法的负数阈值
  toExpPos: 21,   // 指数表示法的正数阈值
  maxE: 9e15,     // 最大指数
  minE: -9e15,    // 最小指数
  modulo: Decimal.ROUND_DOWN,
  crypto: false   // 不使用加密安全的随机数
})

/**
 * 高精度数学计算工具类
 * 用于替换所有的浮点数运算，避免精度丢失
 */
class PrecisionMath {
  /**
   * 创建Decimal实例
   * @param {number|string|Decimal} value - 数值
   * @returns {Decimal} Decimal实例
   */
  static decimal(value) {
    return new Decimal(value || 0)
  }

  /**
   * 加法运算
   * @param {number|string|Decimal} a - 被加数
   * @param {number|string|Decimal} b - 加数
   * @returns {Decimal} 计算结果
   */
  static add(a, b) {
    return new Decimal(a).plus(new Decimal(b))
  }

  /**
   * 减法运算
   * @param {number|string|Decimal} a - 被减数
   * @param {number|string|Decimal} b - 减数
   * @returns {Decimal} 计算结果
   */
  static subtract(a, b) {
    return new Decimal(a).minus(new Decimal(b))
  }

  /**
   * 乘法运算
   * @param {number|string|Decimal} a - 被乘数
   * @param {number|string|Decimal} b - 乘数
   * @returns {Decimal} 计算结果
   */
  static multiply(a, b) {
    return new Decimal(a).times(new Decimal(b))
  }

  /**
   * 除法运算
   * @param {number|string|Decimal} a - 被除数
   * @param {number|string|Decimal} b - 除数
   * @returns {Decimal} 计算结果
   */
  static divide(a, b) {
    return new Decimal(a).dividedBy(new Decimal(b))
  }

  /**
   * 幂运算
   * @param {number|string|Decimal} base - 底数
   * @param {number|string|Decimal} exponent - 指数
   * @returns {Decimal} 计算结果
   */
  static power(base, exponent) {
    return new Decimal(base).pow(new Decimal(exponent))
  }

  /**
   * 开方运算
   * @param {number|string|Decimal} value - 被开方数
   * @param {number} n - 开方次数，默认为2（平方根）
   * @returns {Decimal} 计算结果
   */
  static sqrt(value, n = 2) {
    if (n === 2) {
      return new Decimal(value).sqrt()
    }
    return new Decimal(value).pow(new Decimal(1).dividedBy(new Decimal(n)))
  }

  /**
   * 绝对值
   * @param {number|string|Decimal} value - 数值
   * @returns {Decimal} 绝对值
   */
  static abs(value) {
    return new Decimal(value).abs()
  }

  /**
   * 向上取整
   * @param {number|string|Decimal} value - 数值
   * @returns {Decimal} 向上取整结果
   */
  static ceil(value) {
    return new Decimal(value).ceil()
  }

  /**
   * 向下取整
   * @param {number|string|Decimal} value - 数值
   * @returns {Decimal} 向下取整结果
   */
  static floor(value) {
    return new Decimal(value).floor()
  }

  /**
   * 四舍五入
   * @param {number|string|Decimal} value - 数值
   * @param {number} decimalPlaces - 保留小数位数，默认为2
   * @returns {Decimal} 四舍五入结果
   */
  static round(value, decimalPlaces = 2) {
    return new Decimal(value).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
  }

  /**
   * 比较两个数的大小
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @returns {number} -1: a < b, 0: a = b, 1: a > b
   */
  static compare(a, b) {
    return new Decimal(a).comparedTo(new Decimal(b))
  }

  /**
   * 判断是否相等
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @param {number} tolerance - 容差，默认为0.01
   * @returns {boolean} 是否相等
   */
  static equals(a, b, tolerance = 0.01) {
    const diff = this.abs(this.subtract(a, b))
    return diff.lessThanOrEqualTo(new Decimal(tolerance))
  }

  /**
   * 判断是否大于
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @returns {boolean} a > b
   */
  static greaterThan(a, b) {
    return new Decimal(a).greaterThan(new Decimal(b))
  }

  /**
   * 判断是否大于等于
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @returns {boolean} a >= b
   */
  static greaterThanOrEqual(a, b) {
    return new Decimal(a).greaterThanOrEqualTo(new Decimal(b))
  }

  /**
   * 判断是否小于
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @returns {boolean} a < b
   */
  static lessThan(a, b) {
    return new Decimal(a).lessThan(new Decimal(b))
  }

  /**
   * 判断是否小于等于
   * @param {number|string|Decimal} a - 第一个数
   * @param {number|string|Decimal} b - 第二个数
   * @returns {boolean} a <= b
   */
  static lessThanOrEqual(a, b) {
    return new Decimal(a).lessThanOrEqualTo(new Decimal(b))
  }

  /**
   * 转换为数字（谨慎使用，可能丢失精度）
   * @param {Decimal} decimal - Decimal实例
   * @returns {number} 数字
   */
  static toNumber(decimal) {
    return decimal.toNumber()
  }

  /**
   * 转换为字符串
   * @param {Decimal} decimal - Decimal实例
   * @param {number} decimalPlaces - 小数位数，默认为2
   * @returns {string} 字符串
   */
  static toString(decimal, decimalPlaces = 2) {
    return decimal.toFixed(decimalPlaces)
  }

  /**
   * 转换为格式化的字符串（带千分位分隔符）
   * @param {Decimal} decimal - Decimal实例
   * @param {number} decimalPlaces - 小数位数，默认为2
   * @returns {string} 格式化字符串
   */
  static toFormattedString(decimal, decimalPlaces = 2) {
    const str = decimal.toFixed(decimalPlaces)
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  /**
   * 等额本息还款计算
   * @param {number|string|Decimal} principal - 本金
   * @param {number|string|Decimal} annualRate - 年利率（小数形式，如0.05表示5%）
   * @param {number} months - 还款月数
   * @returns {Decimal} 月还款额
   */
  static calculateEqualInstallment(principal, annualRate, months) {
    const P = new Decimal(principal)
    const r = new Decimal(annualRate).dividedBy(12) // 月利率
    const n = new Decimal(months)
    
    if (r.equals(0)) {
      // 无利息情况
      return P.dividedBy(n)
    }
    
    // 计算 (1 + r)^n
    const onePlusR = r.plus(1)
    const onePlusRPowN = onePlusR.pow(n)
    
    // 月还款额 = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const numerator = P.times(r).times(onePlusRPowN)
    const denominator = onePlusRPowN.minus(1)
    
    return numerator.dividedBy(denominator)
  }

  /**
   * 等额本金还款计算
   * @param {number|string|Decimal} principal - 本金
   * @param {number|string|Decimal} annualRate - 年利率（小数形式）
   * @param {number} months - 还款月数
   * @returns {object} 包含每月本金和首月还款额的对象
   */
  static calculateEqualPrincipal(principal, annualRate, months) {
    const P = new Decimal(principal)
    const r = new Decimal(annualRate).dividedBy(12) // 月利率
    const n = new Decimal(months)
    
    // 每月应还本金
    const monthlyPrincipal = P.dividedBy(n)
    
    // 首月利息
    const firstMonthInterest = P.times(r)
    
    // 首月还款额
    const firstMonthPayment = monthlyPrincipal.plus(firstMonthInterest)
    
    return {
      monthlyPrincipal,
      firstMonthPayment,
      firstMonthInterest
    }
  }

  /**
   * 计算复利
   * @param {number|string|Decimal} principal - 本金
   * @param {number|string|Decimal} rate - 利率
   * @param {number} periods - 期数
   * @returns {Decimal} 复利结果
   */
  static compoundInterest(principal, rate, periods) {
    const P = new Decimal(principal)
    const r = new Decimal(rate)
    const n = new Decimal(periods)
    
    return P.times(r.plus(1).pow(n))
  }

  /**
   * 百分比转换
   * @param {number|string|Decimal} percentage - 百分比（如5表示5%）
   * @returns {Decimal} 小数形式（如0.05）
   */
  static percentageToDecimal(percentage) {
    return new Decimal(percentage).dividedBy(100)
  }

  /**
   * 小数转百分比
   * @param {number|string|Decimal} decimal - 小数形式
   * @returns {Decimal} 百分比形式
   */
  static decimalToPercentage(decimal) {
    return new Decimal(decimal).times(100)
  }

  /**
   * 验证数值是否有效
   * @param {any} value - 待验证的值
   * @returns {boolean} 是否为有效数值
   */
  static isValidNumber(value) {
    try {
      const decimal = new Decimal(value)
      return decimal.isFinite() && !decimal.isNaN()
    } catch (error) {
      return false
    }
  }

  /**
   * 安全转换为Decimal（处理无效输入）
   * @param {any} value - 输入值
   * @param {number|string|Decimal} defaultValue - 默认值
   * @returns {Decimal} Decimal实例
   */
  static safeDecimal(value, defaultValue = 0) {
    try {
      if (this.isValidNumber(value)) {
        return new Decimal(value)
      }
      return new Decimal(defaultValue)
    } catch (error) {
      return new Decimal(defaultValue)
    }
  }
}

export default PrecisionMath 