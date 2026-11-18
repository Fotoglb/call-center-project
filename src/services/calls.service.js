import api from './api'
import { ENDPOINTS } from './endpoints'

/*
 * يغطي هذا الملف نوعين من البيانات ضمن نفس نطاق "المكالمات":
 * - queue: قائمة مكالمات اليوم المخصصة للموظف الحالي (صفحة Calls).
 * - log: سجل/جدول كل المكالمات مع فلاتر وترقيم صفحات (صفحة Agents).
 */
export const callsService = {
  async getMeta() {
    const data = await api.get(ENDPOINTS.calls.meta)
    return {
      agents: data.agents ?? [],
      types: data.types ?? [],
      statuses: data.statuses ?? []
    }
  },

  async getQueue() {
    // Confirmed Apidog request: GET /api/calls/queue, without query parameters.
    const data = await api.get(ENDPOINTS.calls.queue)
    return data.items ?? data
  },

  async getRescheduled() {
    // Confirmed route; successful response mapping still needs API documentation.
    return api.get(ENDPOINTS.calls.reschedule)
  },

  async saveOutcome(payload) {
    return api.post(ENDPOINTS.calls.create, payload)
  },

  async addNote(id, note) {
    return api.post(ENDPOINTS.calls.notes(id), { note })
  },

  async getList({ page = 1, limit = 20, leadId = '' } = {}) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح؛ الحد الأقصى 100')
    }
    if (typeof leadId !== 'string') throw new Error('معرّف العميل يجب أن يكون نصيًا')
    const params = { page, limit }
    if (leadId.trim()) params.leadId = leadId.trim()
    const data = await api.get(ENDPOINTS.calls.list, { params })
    const body = data?.data ?? data
    const items = Array.isArray(body) ? body : body?.items
    if (!Array.isArray(items)) throw new Error('تعذّر قراءة قائمة المكالمات؛ يلزم تأكيد تنسيق استجابة السيرفر')
    return {
      items,
      total: body.total ?? items.length,
      stats: body.stats ?? null
    }
  },

  async getCustomerHistory({ leadId, page = 1, limit = 20 }) {
    if (typeof leadId !== 'string' || !leadId.trim()) {
      throw new Error('يلزم معرّف العميل لعرض سجل المكالمات')
    }
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح')
    }
    return api.get(ENDPOINTS.calls.list, { params: { leadId: leadId.trim(), page, limit } })
  },

  async exportExcel(params = {}) {
    return api.get(ENDPOINTS.calls.exportExcel, { params, responseType: 'blob' })
  },

  async exportPdf(params = {}) {
    return api.get(ENDPOINTS.calls.exportPdf, { params, responseType: 'blob' })
  }
}
