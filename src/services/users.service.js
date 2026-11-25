import api from './api'
import { ENDPOINTS } from './endpoints'

export const usersService = {
  async resetPassword(userId) {
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new Error('معرّف الموظف غير متوفر')
    }
    const response = await api.post(ENDPOINTS.users.resetPassword(userId.trim()))
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر إعادة تعيين كلمة المرور')
    }
    return response
  },
  async deactivate(userId) {
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new Error('معرّف الموظف غير متوفر')
    }
    const response = await api.patch(ENDPOINTS.users.update(userId.trim()), { status: 'inactive' })
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر تعطيل الموظف')
    }
    return response
  },
  async list({ page = 1, limit = 20, role = '', status = '', q = '' } = {}) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح')
    }
    const params = { page, limit }
    for (const [key, value] of Object.entries({ role, status, q })) {
      if (value.trim()) params[key] = value.trim()
    }
    return api.get(ENDPOINTS.users.list, { params })
  },
  async options({ role = '' } = {}) {
    const params = role ? { role } : {}
    return api.get(ENDPOINTS.users.options, { params })
  },
  async create({ name, email, role }) {
    const response = await api.post(ENDPOINTS.users.create, { name, email, role })
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر إنشاء الموظف')
    }
    return response
  },
}
