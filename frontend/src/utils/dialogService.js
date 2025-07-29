import { ref } from 'vue'

// 全局对话框引用
let dialogInstance = null

// 设置对话框实例
export const setDialogInstance = (instance) => {
  dialogInstance = instance
}

// 获取对话框实例
export const getDialogInstance = () => {
  return dialogInstance
}

// 显示警告对话框 (替代 alert)
export const showAlert = (message, options = {}) => {
  return new Promise((resolve) => {
    if (!dialogInstance) {
      console.error('Dialog instance not found. Make sure GlobalDialog is mounted.')
      // 降级到原生alert
      alert(message)
      resolve()
      return
    }

    const config = {
      title: '提示',
      message: message,
      type: 'info',
      showCancelButton: false,
      confirmText: '确定',
      onConfirm: () => resolve(),
      ...options
    }

    dialogInstance.show(config)
  })
}

// 显示确认对话框 (替代 confirm)
export const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    if (!dialogInstance) {
      console.error('Dialog instance not found. Make sure GlobalDialog is mounted.')
      // 降级到原生confirm
      resolve(confirm(message))
      return
    }

    const config = {
      title: '确认',
      message: message,
      type: 'warning',
      showCancelButton: true,
      confirmText: '确定',
      cancelText: '取消',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      ...options
    }

    dialogInstance.show(config)
  })
}

// 显示成功对话框
export const showSuccess = (message, options = {}) => {
  return showAlert(message, {
    title: '操作成功',
    type: 'success',
    ...options
  })
}

// 显示错误对话框
export const showError = (message, options = {}) => {
  return showAlert(message, {
    title: '错误',
    type: 'error',
    ...options
  })
}

// 显示警告对话框
export const showWarning = (message, options = {}) => {
  return showAlert(message, {
    title: '警告',
    type: 'warning',
    ...options
  })
}

// 显示信息对话框
export const showInfo = (message, options = {}) => {
  return showAlert(message, {
    title: '信息',
    type: 'info',
    ...options
  })
}

// 显示删除确认对话框 (常用场景)
export const showDeleteConfirm = (itemName = '该项目', options = {}) => {
  return showConfirm(`确定要删除${itemName}吗？此操作不可撤销。`, {
    title: '确认删除',
    type: 'error',
    confirmText: '删除',
    ...options
  })
}

// 显示自定义对话框
export const showDialog = (options) => {
  return new Promise((resolve, reject) => {
    if (!dialogInstance) {
      console.error('Dialog instance not found. Make sure GlobalDialog is mounted.')
      reject(new Error('Dialog instance not found'))
      return
    }

    const config = {
      onConfirm: () => resolve('confirm'),
      onCancel: () => resolve('cancel'),
      ...options
    }

    dialogInstance.show(config)
  })
}

// 隐藏对话框
export const hideDialog = () => {
  if (dialogInstance) {
    dialogInstance.hide()
  }
}

// 创建实用函数来替代原生的 window.alert 和 window.confirm
export const alert = showAlert
export const confirm = showConfirm

export default {
  setDialogInstance,
  getDialogInstance,
  showAlert,
  showConfirm,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showDeleteConfirm,
  showDialog,
  hideDialog,
  alert,
  confirm
} 