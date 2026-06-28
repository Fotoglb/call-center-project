import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    const data = await authService.login(credentials)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
    return data
  }

  async function fetchMe() {
    const data = await authService.me()
    user.value = data
    return data
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  return { user, token, isAuthenticated, login, fetchMe, logout }
})
