import apiClient from './api.js';
import { handleApiError } from '../utils/errorHandler.js';

/**
 * 用户服务
 */
export const userService = {
  /**
   * 获取用户列表 (仅管理员)
   * @param {Object} params - 查询参数
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取单个用户详情 (仅管理员)
   * @param {number} userId - 用户ID
   */
  async getUser(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 创建用户 (仅管理员)
   * @param {Object} userData - 用户数据
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 更新的用户数据
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 删除用户 (仅管理员)
   * @param {number} userId - 用户ID
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 更新用户密码
   * @param {Object} passwordData - 密码数据
   */
  async updatePassword(passwordData) {
    try {
      const response = await apiClient.patch('/users/password', passwordData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 更新用户个人资料
   * @param {Object} profileData - 个人资料数据
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取用户统计信息 (仅管理员)
   */
  async getUserStatistics() {
    try {
      const response = await apiClient.get('/users/statistics');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}; 