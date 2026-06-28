import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isSidebarOpen = ref(true)
  const notifications = ref([])

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function addNotification({ type = 'info', message, duration = 4000 }) {
    const id = Date.now() + Math.random()
    notifications.value.push({ id, type, message })
    setTimeout(() => removeNotification(id), duration)
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return { isSidebarOpen, notifications, toggleSidebar, addNotification, removeNotification }
})
