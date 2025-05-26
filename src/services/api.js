import axios from 'axios';
import { API_CONFIG, generateRequestId } from '../config/api.js';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器 - 添加Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求ID用于调试
    config.headers['X-Request-ID'] = generateRequestId();
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理和Token刷新
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Token过期自动刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken);
          localStorage.setItem('token', response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，重定向到登录页
        logout();
        window.location.href = '/';
      }
    }
    
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    return Promise.reject(error);
  }
);

// 刷新Token
async function refreshAccessToken(refreshToken) {
  return await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {}, {
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  });
}

// 登出函数
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.clear();
}

export default apiClient; 