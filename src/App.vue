<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <LoginPage 
        v-if="currentPage === 'login'" 
        @switch-to-register="currentPage = 'register'"
        @go-to-admin="currentPage = 'admin-dashboard'"
        @go-to-user="currentPage = 'user-dashboard'"
        @login-success="handleLoginSuccess"
      />
      <RegisterPage 
        v-else-if="currentPage === 'register'" 
        @switch-to-login="currentPage = 'login'" 
      />
      <AdminDashboard 
        v-else-if="currentPage === 'admin-dashboard'"
        @go-to-login="currentPage = 'login'"
      />
      <UserDashboard 
        v-else-if="currentPage === 'user-dashboard'"
        @go-to-login="currentPage = 'login'"
      />
    </transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore.js'
import LoginPage from './components/LoginPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import UserDashboard from './components/UserDashboard.vue'

export default {
  name: 'App',
  components: {
    LoginPage,
    RegisterPage,
    AdminDashboard,
    UserDashboard
  },
  setup() {
    const authStore = useAuthStore()
    const currentPage = ref('login')
    
    // 处理登录成功事件
    const handleLoginSuccess = (user) => {
      console.log('用户登录成功:', user)
      // 页面跳转已在LoginPage组件中处理
    }
    
    // 组件挂载时检查认证状态
    onMounted(() => {
      authStore.initAuth()
      
      // 如果已经登录，自动跳转到相应页面
      if (authStore.state.isAuthenticated) {
        if (authStore.isAdmin.value) {
          currentPage.value = 'admin-dashboard'
        } else {
          currentPage.value = 'user-dashboard'
        }
      }
    })
    
    return {
      currentPage,
      handleLoginSuccess
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 