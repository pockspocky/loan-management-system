// API配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://zlyoszudwbcc.sealoshzh.site:8080/api/v1',
  TIMEOUT: 30000
};

// 生成请求ID
export function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 判断是否为不可重试的错误
export function isNonRetryableError(error) {
  if (!error.response) return false;
  const nonRetryableStatuses = [400, 401, 403, 404, 422];
  return nonRetryableStatuses.includes(error.response.status);
} 