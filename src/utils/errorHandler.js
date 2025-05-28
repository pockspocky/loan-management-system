/**
 * 统一API错误处理
 */
export function handleApiError(error) {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    const errorMessages = {
      400: '请求参数错误',
      401: '登录已过期，请重新登录',
      403: '权限不足，无法执行此操作',
      404: '请求的资源不存在',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误，请稍后再试'
    };
    
    return {
      success: false,
      message: data.message || errorMessages[status] || `请求失败 (${status})`,
      errors: data.errors || {},
      needLogin: status === 401
    };
  } else if (error.request) {
    return {
      success: false,
      message: '网络连接失败，请检查网络设置'
    };
  } else {
    return {
      success: false,
      message: error.message || '未知错误'
    };
  }
}

/**
 * 带重试的API请求
 * @param {Function} apiCall - API调用函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟(毫秒)
 */
export async function retryApiCall(apiCall, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次重试或者是不可重试的错误，直接抛出
      if (i === maxRetries || isNonRetryableError(error)) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}

// 判断是否为不可重试的错误
function isNonRetryableError(error) {
  if (!error.response) return false;
  
  const nonRetryableStatuses = [400, 401, 403, 404, 422];
  return nonRetryableStatuses.includes(error.response.status);
} 