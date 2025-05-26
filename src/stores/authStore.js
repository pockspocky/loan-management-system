import { reactive, computed } from 'vue';
import { authService } from '../services/authService.js';

// 全局认证状态
const authState = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
});

/**
 * 认证状态管理
 */
export const useAuthStore = () => {
  // 计算属性
  const isAdmin = computed(() => authState.user?.role === 'admin');
  const isUser = computed(() => authState.user?.role === 'user');

  // 初始化认证状态
  const initAuth = () => {
    const user = authService.getCurrentUserFromStorage();
    if (user && authService.isAuthenticated()) {
      authState.user = user;
      authState.isAuthenticated = true;
    }
  };

  // 登录
  const login = async (credentials) => {
    authState.isLoading = true;
    authState.error = null;

    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        authState.user = result.data.user;
        authState.isAuthenticated = true;
        return { success: true, data: result.data };
      } else {
        authState.error = result.message;
        return result;
      }
    } catch (error) {
      authState.error = '登录失败，请稍后重试';
      return { success: false, message: authState.error };
    } finally {
      authState.isLoading = false;
    }
  };

  // 注册
  const register = async (userData) => {
    authState.isLoading = true;
    authState.error = null;

    try {
      const result = await authService.register(userData);
      
      if (!result.success) {
        authState.error = result.message;
      }
      
      return result;
    } catch (error) {
      authState.error = '注册失败，请稍后重试';
      return { success: false, message: authState.error };
    } finally {
      authState.isLoading = false;
    }
  };

  // 登出
  const logout = async () => {
    authState.isLoading = true;

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authState.user = null;
      authState.isAuthenticated = false;
      authState.error = null;
      authState.isLoading = false;
    }
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    authState.isLoading = true;

    try {
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        authState.user = result.data;
        authState.isAuthenticated = true;
      } else if (result.needLogin) {
        // Token已过期，需要重新登录
        await logout();
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      authState.isLoading = false;
    }
  };

  // 清除错误
  const clearError = () => {
    authState.error = null;
  };

  return {
    // 状态
    state: authState,
    
    // 计算属性
    isAdmin,
    isUser,
    
    // 方法
    initAuth,
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError
  };
}; 