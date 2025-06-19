// API配置
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://zlyoszudwbcc.sealoshzh.site/api/v1'),
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