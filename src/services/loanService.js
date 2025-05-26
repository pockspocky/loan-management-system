import apiClient from './api.js';
import { handleApiError } from '../utils/errorHandler.js';

/**
 * 贷款服务
 */
export const loanService = {
  /**
   * 获取贷款列表
   * @param {Object} params - 查询参数
   */
  async getLoans(params = {}) {
    try {
      const response = await apiClient.get('/loans', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取单个贷款详情
   * @param {number} loanId - 贷款ID
   */
  async getLoan(loanId) {
    try {
      const response = await apiClient.get(`/loans/${loanId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 创建贷款申请
   * @param {Object} loanData - 贷款数据
   */
  async createLoan(loanData) {
    try {
      const response = await apiClient.post('/loans', loanData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 更新贷款信息
   * @param {number} loanId - 贷款ID
   * @param {Object} loanData - 更新的贷款数据
   */
  async updateLoan(loanId, loanData) {
    try {
      const response = await apiClient.put(`/loans/${loanId}`, loanData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 删除贷款
   * @param {number} loanId - 贷款ID
   */
  async deleteLoan(loanId) {
    try {
      const response = await apiClient.delete(`/loans/${loanId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 审批贷款 (仅管理员)
   * @param {number} loanId - 贷款ID
   * @param {Object} approvalData - 审批数据
   */
  async approveLoan(loanId, approvalData) {
    try {
      const response = await apiClient.patch(`/loans/${loanId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取贷款统计信息 (仅管理员)
   */
  async getLoanStatistics() {
    try {
      const response = await apiClient.get('/loans/statistics');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取用户的贷款列表
   * @param {number} userId - 用户ID
   * @param {Object} params - 查询参数
   */
  async getUserLoans(userId, params = {}) {
    try {
      const queryParams = { ...params, applicant_id: userId };
      const response = await apiClient.get('/loans', { params: queryParams });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * 获取待审批的贷款列表 (仅管理员)
   * @param {Object} params - 查询参数
   */
  async getPendingLoans(params = {}) {
    try {
      const queryParams = { ...params, status: 'pending' };
      const response = await apiClient.get('/loans', { params: queryParams });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}; 