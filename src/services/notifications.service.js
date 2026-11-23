import api from './api'
import { ENDPOINTS } from './endpoints'

export const notificationsService = {
  async list({ page = 1, limit = 10 } = {}) {
    const response = await api.get(ENDPOINTS.notifications.list, { params: { page, limit } })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل الإشعارات')
    return { items: Array.isArray(response?.data) ? response.data : [], meta: response?.meta ?? {} }
  },
  async unreadCount() {
    const response = await api.get(ENDPOINTS.notifications.unreadCount)
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل عداد الإشعارات')
    return Number(response?.data?.unreadCount ?? 0)
  },
  async markRead(id) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف الإشعار مطلوب')
    return api.patch(ENDPOINTS.notifications.read(id.trim()))
  },
  async markAllRead() {
    return api.patch(ENDPOINTS.notifications.readAll)
  }
}
