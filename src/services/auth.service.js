import api from './api'
import { ENDPOINTS } from './endpoints'

export const authService = {
  async changePassword({ currentPassword, password, confirmPassword }) {
    const response = await api.post(ENDPOINTS.auth.changePassword, { currentPassword, password, confirmPassword })
    if (response?.success === false) throw new Error(response.message || response.error || 'تعذّر تغيير كلمة المرور')
    return response
  },
  async login({ email, password }) {
    // api's response interceptor already unwraps Axios response.data.
    const response = await api.post(ENDPOINTS.auth.login, { email, password })
    const { loginToken, user } = response?.data || {}
    if (response?.success !== true || typeof loginToken !== 'string' || !loginToken.trim() || !user || typeof user !== 'object' || Array.isArray(user)) {
      throw new Error(response?.message || 'استجابة تسجيل الدخول غير مكتملة، يرجى المحاولة مرة أخرى')
    }
    return { token: loginToken, user, screens: response.data.screens ?? {}, access: response.data.access ?? {} }
  },
  logout: () => api.post(ENDPOINTS.auth.logout),
  me: () => api.get(ENDPOINTS.auth.me),
  refreshToken: () => api.post(ENDPOINTS.auth.refresh),
  async forgotPassword({ email }) {
    const response = await api.post(ENDPOINTS.auth.forgotPassword, { email })
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر إرسال رمز التحقق')
    }
    return response
  },
  async verifyOtp({ email, verificationCode }) {
    const response = await api.post(ENDPOINTS.auth.verifyOtp, { email, verificationCode })
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر التحقق من الرمز')
    }
    return response
  },
  resendOtp: payload => api.post(ENDPOINTS.auth.resendOtp, payload),
  async resetPassword({ password, confirmPassword }) {
    const response = await api.post(ENDPOINTS.auth.resetPassword, { password, confirmPassword })
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر إعادة تعيين كلمة المرور')
    }
    return response
  }
}
