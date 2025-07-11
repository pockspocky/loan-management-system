<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>创建账户</h1>
        <p>欢迎加入我们</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            required
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
          />
        </div>
        
        <div class="input-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
            :class="{ 'error': passwordMismatch }"
          />
          <div v-if="passwordMismatch" class="error-message">
            密码不匹配
          </div>
        </div>
        
        <!-- 显示API错误信息 -->
        <div v-if="errorMessage" class="error-message api-error">
          {{ errorMessage }}
          <div v-if="validationErrors && Object.keys(validationErrors).length > 0" class="validation-errors">
            <ul>
              <li v-for="(errors, field) in validationErrors" :key="field">
                <strong>{{ getFieldName(field) }}:</strong> {{ errors.join(', ') }}
              </li>
            </ul>
          </div>
        </div>
        
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.agreeTerm"
              required
            />
            <span class="checkmark"></span>
            我同意
            <a href="#" @click.prevent="showTerms">用户协议</a>
            和
            <a href="#" @click.prevent="showPrivacy">隐私政策</a>
          </label>
        </div>
        
        <button type="submit" class="register-btn" :disabled="!isFormValid || isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="login-link">
        <p>已有账户？ 
          <a href="#" @click.prevent="$emit('switch-to-login')">返回登录</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { authService } from '../services/index.js'

export default {
  name: 'RegisterPage',
  emits: ['switch-to-login'],
  setup(props, { emit }) {
    const formData = ref({
      username: '',
      password: '',
      confirmPassword: '',
      agreeTerm: false
    })
    
    const isLoading = ref(false)
    const errorMessage = ref('')
    const validationErrors = ref({})
    
    const passwordMismatch = computed(() => {
      return formData.value.confirmPassword && 
             formData.value.password !== formData.value.confirmPassword
    })
    
    const isFormValid = computed(() => {
      return formData.value.username.length > 0 &&
             formData.value.password.length > 0 &&
             formData.value.confirmPassword.length > 0 &&
             formData.value.password === formData.value.confirmPassword &&
             formData.value.agreeTerm
    })
    
    const getFieldName = (field) => {
      const fieldNames = {
        username: '用户名',
        password: '密码'
      }
      return fieldNames[field] || field
    }
    
    const handleRegister = async () => {
      if (!isFormValid.value || isLoading.value) return
      
      // 清除之前的错误信息
      errorMessage.value = ''
      validationErrors.value = {}
      isLoading.value = true
      
      try {
        const registerData = {
          username: formData.value.username,
          password: formData.value.password
        }
        
        const result = await authService.register(registerData)
        
        if (result.success) {
          alert(`注册成功！欢迎 ${formData.value.username}！请登录使用。`)
          emit('switch-to-login')
        } else {
          errorMessage.value = result.message || '注册失败，请重试'
          if (result.errors) {
            validationErrors.value = result.errors
          }
        }
      } catch (error) {
        console.error('注册错误:', error)
        errorMessage.value = '注册失败，请检查网络连接后重试'
      } finally {
        isLoading.value = false
      }
    }
    
    const showTerms = () => {
      alert('用户协议内容待添加')
    }
    
    const showPrivacy = () => {
      alert('隐私政策内容待添加')
    }
    
    return {
      formData,
      isLoading,
      errorMessage,
      validationErrors,
      passwordMismatch,
      isFormValid,
      getFieldName,
      handleRegister,
      showTerms,
      showPrivacy
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  padding: 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.register-header p {
  color: #666;
  font-size: 16px;
}

.register-form {
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

.input-group input[type="text"],
.input-group input[type="tel"],
.input-group input[type="password"] {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fff;
}

.input-group input:focus {
  outline: none;
  border-color: #ff9a9e;
  box-shadow: 0 0 0 3px rgba(255, 154, 158, 0.1);
}

.input-group input.error {
  border-color: #ff4757;
}

.error-message {
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
}

.api-error {
  background: rgba(255, 71, 87, 0.1);
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #ff4757;
  margin-bottom: 20px;
  font-size: 14px;
}

.validation-errors {
  margin-top: 8px;
}

.validation-errors ul {
  margin: 0;
  padding-left: 16px;
}

.validation-errors li {
  margin-bottom: 4px;
}

.checkbox-group {
  margin-bottom: 25px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  margin-right: 10px;
  margin-top: 2px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #ff9a9e;
  border-color: #ff9a9e;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label a {
  color: #ff9a9e;
  text-decoration: none;
  transition: color 0.3s ease;
}

.checkbox-label a:hover {
  color: #ff6b70;
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 154, 158, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #ff9a9e;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #ff6b70;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }
  
  .register-card {
    padding: 30px 20px;
  }
  
  .register-header h1 {
    font-size: 24px;
  }
}
</style> 