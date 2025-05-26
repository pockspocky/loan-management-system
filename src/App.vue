<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <LoginPage 
        v-if="currentPage === 'login'" 
        @switch-to-register="currentPage = 'register'"
        @go-to-admin="currentPage = 'admin-dashboard'"
        @go-to-user="currentPage = 'user-dashboard'"
      />
      <RegisterPage 
        v-else-if="currentPage === 'register'" 
        @switch-to-login="currentPage = 'login'" 
      />
      <AdminDashboard 
        v-else-if="currentPage === 'admin-dashboard'"
        @logout="currentPage = 'login'"
      />
      <UserDashboard 
        v-else-if="currentPage === 'user-dashboard'"
        @logout="currentPage = 'login'"
      />
    </transition>
  </div>
</template>

<script>
import { ref } from 'vue'
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
    const currentPage = ref('login')
    
    return {
      currentPage
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