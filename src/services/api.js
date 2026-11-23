import axios from 'axios'
import { readSession, clearSession, SESSION_EXPIRED_EVENT } from './auth-session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://call-center-backend-kvok.onrender.com/api',
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
})

// طلبات المصادقة نفسها (تسجيل الدخول، إنشاء حساب...) قد ترجّع 401/422
// لبيانات خاطئة، وهذا لا يعني انتهاء صلاحية جلسة مستخدم مسجّل بالفعل.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password']

api.interceptors.request.use(config => {
  const session = readSession()
  const { token } = session
  if (token && !AUTH_ENDPOINTS.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response.data,
  error => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return Promise.reject(error)
    if (error.permissionDenied) return Promise.reject(error)
    const isAuthEndpoint = AUTH_ENDPOINTS.includes(error.config?.url)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      clearSession()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    const status = error.response?.status
    const body = error.response?.data
    const fieldErrors = body?.errors && typeof body.errors === 'object'
      ? Object.values(body.errors).flat().filter(value => typeof value === 'string').join('، ') : ''
    const serverMessage = body?.message || fieldErrors || body?.error
    const message = typeof serverMessage === 'string' ? serverMessage
      : error.code === 'ECONNABORTED' ? 'انتهت مهلة الاتصال بالخادم، يرجى المحاولة مرة أخرى'
        : !error.response ? 'تعذّر الاتصال بالخادم. تحقق من اتصال الإنترنت أو إعدادات CORS للخادم'
          : status === 401 ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو انتهت صلاحية الجلسة'
            : status === 403 ? 'ليس لديك صلاحية لتنفيذ هذه العملية'
              : status === 429 ? 'محاولات كثيرة، يرجى الانتظار ثم المحاولة مرة أخرى'
                : 'تعذّر تنفيذ الطلب، يرجى المحاولة مرة أخرى'
    return Promise.reject(Object.assign(new Error(message), {
      status, code: error.code, details: error.response?.data,
    }))
  }
)

export default api
