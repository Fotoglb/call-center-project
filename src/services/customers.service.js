import api from './api'
import { ENDPOINTS } from './endpoints'
import { normalizeCustomerSearch } from '../utils/customerSearch'

export const customersService = {
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(ENDPOINTS.customers.bulk, formData, {
      headers: { 'Content-Type': undefined },
    })
    if (response?.success === false) {
      throw new Error(response.message || 'تعذّر رفع ملف العملاء')
    }
    return response
  },
  getSources() {
    return api.get(ENDPOINTS.customers.sources)
  },
  async getMeta() {
    const data = await customersService.getSources()
    const rows = [data, data?.data, data?.data?.sources, data?.sources, data?.data?.items, data?.items].find(Array.isArray)
    if (!rows) {
      throw new Error('يلزم تأكيد تنسيق استجابة مصادر العملاء لربط أسماء المصادر ومعرّفاتها')
    }
    const sources = rows.map(source => {
      if (typeof source === 'string' && source.trim()) return { value: source, label: source }
      const value = source?.id ?? source?._id ?? source?.value
      const label = source?.name ?? source?.label
      if (typeof value !== 'string' || !value || typeof label !== 'string' || !label) {
        throw new Error('استجابة المصادر لا تحتوي على اسم ومعرّف صالحين لكل مصدر')
      }
      return { value, label }
    })
    return {
      sources,
      cities: [],
      agents: [],
      statuses: [],
      projectTypes: [],
      dateRanges: []
    }
  },

  async getList(params = {}, { signal } = {}) {
    const { page = 1, limit = 10 } = params
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح؛ الحد الأقصى 100')
    }
    const query = { page, limit }
    for (const key of ['q', 'sourceId', 'assignedTo', 'city', 'callStatus', 'projectType', 'priority', 'from', 'to']) {
      const value = params[key]
      if (value == null || value === '') continue
      if (typeof value !== 'string') throw new Error('قيم فلاتر العملاء يجب أن تكون نصية')
      if (value.trim()) query[key] = key === 'q' ? normalizeCustomerSearch(value) : value.trim()
    }
    if (params.isDraft !== undefined && params.isDraft !== null && params.isDraft !== '') {
      if (typeof params.isDraft !== 'boolean') throw new Error('قيمة فلتر المسودة غير صحيحة')
      query.isDraft = params.isDraft
    }
    const data = await api.get(ENDPOINTS.customers.list, { params: query, signal })
    if (data?.success === false) throw new Error(data.message || 'تعذّر جلب العملاء')
    const body = data?.data ?? data
    const rows = [body, body?.items, body?.leads, body?.data, data?.items].find(Array.isArray)
    const rawTotal = data?.meta?.total ?? body?.meta?.total ?? body?.total ?? body?.pagination?.total ?? data?.pagination?.total ?? data?.total
    const numericTotal = typeof rawTotal === 'string' && /^\d+$/.test(rawTotal) ? Number(rawTotal) : rawTotal
    const total = Number.isSafeInteger(numericTotal) && numericTotal >= 0 ? numericTotal : null
    if (!rows || rows.some(lead => !lead || typeof lead !== 'object' || Array.isArray(lead))) {
      throw new Error('تعذّر تحديد قائمة العملاء داخل الاستجابة؛ يلزم مراجعة بيانات الرد')
    }
    if (query.isDraft !== undefined && rows.some(lead => {
      const value = lead.isDraft === true || lead.isDraft === 'true' || lead.isDraft === 1 ? true
        : lead.isDraft === false || lead.isDraft === 'false' || lead.isDraft === 0 ? false : null
      return value !== query.isDraft
    })) throw new Error('السيرفر لم يطبق فلتر المسودة؛ يلزم دعم isDraft في طلب العملاء مع إجمالي النتائج المفلترة')
    return {
      items: rows.map(lead => ({
        ...lead,
        isDraft: lead.isDraft === true || lead.isDraft === 'true' || lead.isDraft === 1 ? true
          : lead.isDraft === false || lead.isDraft === 'false' || lead.isDraft === 0 ? false : null,
        id: lead.id ?? lead._id,
        name: String(lead.fullName ?? lead.name ?? ''),
        type: lead.projectType ?? '',
        sourceId: typeof lead.sourceId === 'object' ? lead.sourceId?.id ?? lead.sourceId?._id : lead.sourceId,
        sourceColor: typeof lead.sourceId === 'object' ? lead.sourceId?.color : null,
        source: typeof lead.sourceId === 'object' ? lead.sourceId?.name ?? '' : typeof lead.source === 'string' ? lead.source : '',
        agent: typeof lead.assignedTo === 'object' ? lead.assignedTo?.name ?? '' : '',
        date: lead.createdAt ? String(lead.createdAt).slice(0, 10) : (lead.projectCreatedAt ? String(lead.projectCreatedAt).slice(0, 10) : '—'),
      })),
      total,
    }
  },

  async getById(id) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    return api.get(ENDPOINTS.customers.detail(id.trim()))
  },

  async getProfile(id) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    return api.get(ENDPOINTS.customers.profile(id.trim()))
  },

  async create(payload) {
    return api.post(ENDPOINTS.customers.create, payload)
  },

  async update(id, payload) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    const response = await api.patch(ENDPOINTS.customers.update(id.trim()), payload)
    if (response?.success === false) throw new Error(response.message || response.error || 'رفض السيرفر حفظ التعديلات')
    return response
  },

  async addDocument(id, payload) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    // The caller supplies the documented body; no document fields are inferred here.
    return api.post(ENDPOINTS.customers.documents(id.trim()), payload)
  },

  async addNote(id, content) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    if (typeof content !== 'string' || !content.trim()) throw new Error('اكتب الملاحظة أولًا')
    const response = await api.post(ENDPOINTS.customers.notes(id.trim()), { content: content.trim() })
    if (response?.success === false) throw new Error(response.message || 'تعذّر إضافة الملاحظة')
    return response
  },

  async remove(id) {
    if (typeof id !== 'string' || !id.trim()) throw new Error('معرّف العميل مطلوب')
    return api.delete(ENDPOINTS.customers.remove(id.trim()))
  },

  async checkDuplicates(phone) {
    if (typeof phone !== 'string' || !/^\+[1-9]\d{1,14}$/.test(phone)) {
      throw new Error('رقم الهاتف يجب أن يكون بالصيغة الدولية E.164')
    }
    const data = await api.get(ENDPOINTS.customers.duplicates, { params: { phone } })
    if (data?.success === false) throw new Error(data.message || data.error || 'تعذّر فحص تكرار رقم الجوال')
    const body = data?.data ?? data
    const matches = [body, body?.items, body?.leads, body?.duplicates, data?.items].find(Array.isArray)
    if (matches) return matches
    // Some duplicate-check responses return a boolean result instead of rows.
    const duplicate = typeof body === 'boolean' ? body : body?.exists ?? body?.isDuplicate ?? body?.duplicate
    if (duplicate === false) return []
    if (duplicate === true) {
      const lead = body?.lead ?? body?.customer
      if (lead && typeof lead === 'object' && !Array.isArray(lead)) return [lead]
      throw new Error('رقم الجوال مسجل بالفعل؛ لم يتم إرسال طلب الحفظ')
    }
    throw new Error('استجابة فحص التكرار غير معروفة؛ أرسل محتوى Response لطلب check-duplicate لتأكيد الربط')
  },

  async search(query, { limit = 10 } = {}) {
    if (typeof query !== 'string' || !query.trim()) return []
    const safeLimit = Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10
    const response = await api.get(ENDPOINTS.search, { params: { q: query.trim(), limit: safeLimit } })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تنفيذ البحث')
    const body = response?.data ?? response
    const rows = Array.isArray(body) ? body : body?.items ?? body?.results ?? body?.leads ?? body?.customers
    if (!Array.isArray(rows)) return []
    return rows.map(item => ({
      ...item,
      id: item.id ?? item._id ?? item.leadId,
      name: item.name ?? item.fullName ?? item.lead?.fullName ?? '',
      phone: item.phone ?? item.lead?.phone ?? '',
    })).filter(item => item.id && item.name)
  }
}
