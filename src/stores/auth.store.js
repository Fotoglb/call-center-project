import { canAccess, canVisit } from '@/services/permissions'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import { readSession, saveSession, clearSession as clearStoredSession } from '@/services/auth-session'

export const useAuthStore = defineStore('auth', () => {
  const restoredSession = readSession()
  const user = ref(restoredSession.user)
  const token = ref(restoredSession.token)
  const screens = ref(restoredSession.screens ?? {})
  const access = ref(restoredSession.access ?? {})
  const permissionSession = () => ({ token: token.value, user: user.value, screens: screens.value, access: access.value })
  const can = permission => canAccess(permissionSession(), permission)
  const canOpen = path => canVisit(permissionSession(), path)
  const isReady = ref(false)
  const isLoggingOut = ref(false)
  const profileError = ref('')
  let logoutRequest = null

  const isAuthenticated = computed(() => !!token.value)

  function setSession({ token: newToken, user: newUser, screens: newScreens = {}, access: newAccess = {} }, remember) {
    saveSession({ token: newToken, user: newUser, screens: newScreens, access: newAccess }, remember)
    screens.value = newScreens
    access.value = newAccess
    token.value = newToken
    user.value = newUser ?? null
  }

  function clearSession() {
    profileError.value = ''
    screens.value = {}
    access.value = {}
    user.value = null
    token.value = null
    clearStoredSession()
  }

  async function login(credentials, remember = false) {
    const data = await authService.login(credentials)
    setSession(data, remember)
    try {
      await fetchMe()
    } catch (error) {
      if (error.status === 401) {
        clearSession()
        throw error
      }
      // Keep the confirmed login user when the profile service is unavailable.
    }
    return data
  }

  async function fetchMe() {
    profileError.value = ''
    try {
      const profile = await authService.me()
      const payload = profile?.data ?? profile ?? {}
      const nextUser = payload.user ?? (payload.id || payload.email ? payload : user.value)
      const hasScreens = payload && payload.screens && typeof payload.screens === 'object'
      const hasAccess = payload && payload.access && typeof payload.access === 'object'
      if (nextUser !== user.value || hasScreens || hasAccess) {
        const nextScreens = hasScreens ? payload.screens : screens.value
        const nextAccess = hasAccess ? payload.access : access.value
        const remember = !sessionStorage.getItem('auth_token') && !!localStorage.getItem('auth_token')
        saveSession({ token: token.value, user: nextUser, screens: nextScreens, access: nextAccess }, remember)
        user.value = nextUser
        screens.value = nextScreens
        access.value = nextAccess
      }
      return user.value
    } catch (error) {
      profileError.value = error.message || 'تعذّر جلب بيانات المستخدم الحالي'
      throw error
    }
  }

  function logout() {
    if (logoutRequest) return logoutRequest
    isLoggingOut.value = true
    logoutRequest = (async () => {
      try {
        await authService.logout()
      } catch {
        // Always allow local sign-out when the server is unavailable.
      } finally {
        clearSession()
        isLoggingOut.value = false
        logoutRequest = null
      }
    })()
    return logoutRequest
  }

  // Restore the login response locally until the current-user contract is documented.
  // Protected API requests remain responsible for server-side session validation.
  async function init() {
    if (token.value) {
      try {
        await fetchMe()
      } catch (error) {
        if (error.status === 401) clearSession()
      }
    }
    isReady.value = true
  }

  return {
    user,
    token,
    isReady,
    isLoggingOut,
    profileError,
    isAuthenticated,
    screens, access, can, canOpen,
    login,
    logout,
    fetchMe,
    clearSession,
    init
  }
})
