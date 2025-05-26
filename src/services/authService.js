import apiClient from './api.js';
import { handleApiError } from '../utils/errorHandler.js';

/**
 * 认证服务
 */
export const authService = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @param {string} credentials.role - 用户角色 (可选)
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success) {
        // 保存认证信息
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 如果有refresh token也保存
        if (response.data.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.data.refresh_token);
        }
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 用户登出
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 无论API调用是否成功，都清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      
      if (response.data.success) {
        // 更新本地存储的用户信息
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 刷新Token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem('token', token);
      }

      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * 获取当前用户信息（从本地存储）
   */
  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * 获取当前用户角色
   */
  getCurrentUserRole() {
    const user = this.getCurrentUserFromStorage();
    return user?.role || null;
  }
}; 