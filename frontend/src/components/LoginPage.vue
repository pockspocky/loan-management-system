<template>
  <div class="login-container">
    <!-- 临时按钮组 - 左上角 -->
    <div class="temp-buttons">
      <button @click="goToAdminDashboard" class="temp-btn admin-btn">
        管理员仪表盘
      </button>
      <button @click="goToUserDashboard" class="temp-btn user-btn">
        用户仪表盘
      </button>
    </div>

    <div class="login-card">
      <div class="login-header">
        <h1>欢迎回来</h1>
        <p>请登录您的账户</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="authStore.state.error" class="error-message">
        {{ authStore.state.error }}
        <button @click="authStore.clearError" class="close-error">×</button>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="authStore.state.isLoading"
          />
        </div>
        
        <div class="input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            required
            :disabled="authStore.state.isLoading"
          />
        </div>
        
        <div class="input-group">
          <label for="role">用户类型</label>
          <select
            id="role"
            v-model="formData.role"
            :disabled="authStore.state.isLoading"
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        
        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">忘记密码？</a>
        </div>
        
        <button 
          type="submit" 
          class="login-btn" 
          :disabled="!isFormValid || authStore.state.isLoading"
        >
          <span v-if="authStore.state.isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="register-link">
        <p>还没有账户？ 
          <a href="#" @click.prevent="$emit('switch-to-register')">注册新用户</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'LoginPage',
  emits: ['switch-to-register', 'go-to-admin', 'go-to-user', 'login-success'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    const formData = ref({
      username: '',
      password: '',
      role: 'user'
    })
    
    const isFormValid = computed(() => {
      return formData.value.username.length > 0 && 
             formData.value.password.length > 0
    })
    
    const handleLogin = async () => {
      if (!isFormValid.value) return
      
      authStore.clearError()
      
      const result = await authStore.login({
        username: formData.value.username,
        password: formData.value.password,
        role: formData.value.role
      })
      
      if (result.success) {
        // 登录成功，根据用户角色跳转
        emit('login-success', result.data.user)
        
        if (result.data.user.role === 'admin') {
          emit('go-to-admin')
        } else {
          emit('go-to-user')
        }
        
        // 清空表单
        formData.value = {
          username: '',
          password: '',
          role: 'user'
        }
      }
    }
    
    const handleForgotPassword = () => {
      alert('忘记密码功能待实现')
    }
    
    const goToAdminDashboard = () => {
      emit('go-to-admin')
    }
    
    const goToUserDashboard = () => {
      emit('go-to-user')
    }
    
    // 组件挂载时初始化认证状态
    onMounted(() => {
      authStore.initAuth()
      
      // 如果已经登录，自动跳转
      if (authStore.state.isAuthenticated) {
        if (authStore.isAdmin.value) {
          emit('go-to-admin')
        } else {
          emit('go-to-user')
        }
      }
    })
    
    return {
      authStore,
      formData,
      isFormValid,
      handleLogin,
      handleForgotPassword,
      goToAdminDashboard,
      goToUserDashboard
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fff;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group input:disabled,
.input-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password {
  text-align: right;
  margin-bottom: 25px;
}

.forgot-password a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link p {
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 错误提示样式 */
.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  position: relative;
  font-size: 14px;
}

.close-error {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #c33;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .temp-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .temp-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 临时按钮样式 */
.temp-buttons {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  gap: 12px;
}

.temp-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.user-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.user-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}
</style> 