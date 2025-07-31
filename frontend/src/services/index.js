import axios from 'axios';
import { API_CONFIG, generateRequestId } from '../config/api.js';
import { handleApiError } from '../utils/errorHandler.js';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-ID'] = generateRequestId();
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', {}, {
            headers: { 'Authorization': `Bearer ${refreshToken}` }
          });
          localStorage.setItem('token', response.data.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 清除存储并重定向
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// 认证服务
export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, user, refresh_token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (refresh_token) localStorage.setItem('refreshToken', refresh_token);
      }
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  isAuthenticated() {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getCurrentUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
};

// 用户服务
export const userService = {
  async getProfile() {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateProfile(userData) {
    try {
      const response = await apiClient.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAllUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },



  async changePassword(userId, passwordData) {
    try {
      const response = await apiClient.patch(`/users/${userId}/password`, passwordData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// 系统日志服务
export const logService = {
  async getLogs(params = {}) {
    try {
      const response = await apiClient.get('/logs', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getLogById(logId) {
    try {
      const response = await apiClient.get(`/logs/${logId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getLogStatistics(days = 7) {
    try {
      const response = await apiClient.get('/logs/statistics', { 
        params: { days } 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async cleanupLogs(daysToKeep = 30) {
    try {
      const response = await apiClient.post('/logs/cleanup', { 
        days_to_keep: daysToKeep 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// 导入新的服务
export { loanCalculatorService } from './loanCalculatorService.js';
export { repaymentService } from './repaymentService.js';

// 贷款服务
export const loanService = {
  async getLoans() {
    try {
      const response = await apiClient.get('/loans');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getLoan(loanId) {
    try {
      const response = await apiClient.get(`/loans/${loanId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createLoan(loanData) {
    try {
      const response = await apiClient.post('/loans', loanData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateLoan(loanId, loanData) {
    try {
      const response = await apiClient.put(`/loans/${loanId}`, loanData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteLoan(loanId) {
    try {
      const response = await apiClient.delete(`/loans/${loanId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async approveLoan(loanId, approvalData = {}) {
    try {
      const response = await apiClient.patch(`/loans/${loanId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async rejectLoan(loanId, rejectionData) {
    try {
      const response = await apiClient.patch(`/loans/${loanId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getLoanStatistics() {
    try {
      const response = await apiClient.get('/loans/statistics');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}; 