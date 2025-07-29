<template>
  <div v-if="isVisible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="dialog-container" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
        <button 
          v-if="showCloseButton" 
          @click="handleCancel" 
          class="dialog-close-btn"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
      
      <div class="dialog-content">
        <div v-if="icon" class="dialog-icon" :class="`icon-${type}`">
          {{ getIcon() }}
        </div>
        <div class="dialog-message" v-html="message"></div>
      </div>
      
      <div class="dialog-actions">
        <button 
          v-if="showCancelButton" 
          @click="handleCancel" 
          class="dialog-btn dialog-btn-cancel"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          class="dialog-btn dialog-btn-confirm"
          :class="{ 'dialog-btn-danger': type === 'warning' || type === 'error' }"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'GlobalDialog',
  setup() {
    const isVisible = ref(false)
    const title = ref('')
    const message = ref('')
    const type = ref('info') // 'info', 'success', 'warning', 'error'
    const confirmText = ref('确定')
    const cancelText = ref('取消')
    const showCancelButton = ref(false)
    const showCloseButton = ref(true)
    const icon = ref(true)
    const onConfirm = ref(null)
    const onCancel = ref(null)
    const closeOnOverlay = ref(true)

    const getIcon = () => {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      }
      return icons[type.value] || icons.info
    }

    const show = (options) => {
      title.value = options.title || '提示'
      message.value = options.message || ''
      type.value = options.type || 'info'
      confirmText.value = options.confirmText || '确定'
      cancelText.value = options.cancelText || '取消'
      showCancelButton.value = options.showCancelButton || false
      showCloseButton.value = options.showCloseButton !== false
      icon.value = options.icon !== false
      onConfirm.value = options.onConfirm || null
      onCancel.value = options.onCancel || null
      closeOnOverlay.value = options.closeOnOverlay !== false
      isVisible.value = true
    }

    const hide = () => {
      isVisible.value = false
      // 清理回调函数
      setTimeout(() => {
        onConfirm.value = null
        onCancel.value = null
      }, 300)
    }

    const handleConfirm = () => {
      if (onConfirm.value) {
        onConfirm.value()
      }
      hide()
    }

    const handleCancel = () => {
      if (onCancel.value) {
        onCancel.value()
      }
      hide()
    }

    const handleOverlayClick = () => {
      if (closeOnOverlay.value) {
        handleCancel()
      }
    }

    return {
      isVisible,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancelButton,
      showCloseButton,
      icon,
      show,
      hide,
      handleConfirm,
      handleCancel,
      handleOverlayClick,
      getIcon
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.dialog-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.dialog-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.dialog-content {
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.dialog-icon {
  font-size: 32px;
  flex-shrink: 0;
  line-height: 1;
}

.dialog-message {
  flex: 1;
  font-size: 16px;
  line-height: 1.5;
  color: #555;
}

.dialog-actions {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

.dialog-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.dialog-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.dialog-btn-cancel:hover {
  background: #e9e9e9;
  color: #555;
}

.dialog-btn-confirm {
  background: #667eea;
  color: white;
}

.dialog-btn-confirm:hover {
  background: #5a6fd8;
}

.dialog-btn-danger {
  background: #f56565;
}

.dialog-btn-danger:hover {
  background: #e53e3e;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .dialog-container {
    width: 95%;
    margin: 20px;
  }
  
  .dialog-content {
    padding: 16px 20px;
    gap: 12px;
  }
  
  .dialog-icon {
    font-size: 24px;
  }
  
  .dialog-actions {
    padding: 12px 20px 20px;
    flex-direction: column-reverse;
  }
  
  .dialog-btn {
    width: 100%;
  }
}
</style> 