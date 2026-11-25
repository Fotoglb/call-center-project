import api from './api'
import { ENDPOINTS } from './endpoints'

const outcomes = { new: 'عميل جديد', interested: 'مهتم', not_interested: 'غير مهتم', no_answer: 'لا يرد', reschedule: 'إعادة جدولة' }
function readItems(response) {
  if (response?.success === false) throw new Error(response.message || 'تعذّر جلب المكالمات')
  const body = response?.data ?? response
  const items = [body, body?.items, body?.calls].find(Array.isArray)
  if (!Array.isArray(items)) throw new Error('تعذّر قراءة قائمة المكالمات من استجابة السيرفر')
  return items
}
function mapCall(item, queue = false) {
  const lead = typeof item.leadId === 'object' && item.leadId ? item.leadId : item.lead ?? (queue ? item : {})
  const status = item.outcome ?? item.callStatus ?? lead.callStatus
  return {
    ...item,
    id: item.id ?? item._id,
    leadId: typeof item.leadId === 'string' ? item.leadId : lead.id ?? lead._id,
    name: item.name ?? item.fullName ?? lead.fullName ?? '—',
    phone: item.phone ?? lead.phone ?? '—',
    email: item.email ?? lead.email ?? '—',
    projectType: item.projectType ?? lead.projectType,
    workType: lead.businessType ?? '',
    projectCreatedAt: lead.projectCreatedAt ? String(lead.projectCreatedAt).slice(0, 10) : '',
    sourceId: typeof lead.sourceId === 'object' ? lead.sourceId?.id ?? lead.sourceId?._id ?? '' : lead.sourceId ?? '',
    source: lead.sourceId?.name ?? item.source ?? '',
    assignedTo: typeof lead.assignedTo === 'object' ? lead.assignedTo?.id ?? lead.assignedTo?._id ?? '' : lead.assignedTo ?? '',
    priority: ({ high: 'عالي الأهمية', medium: 'متوسط الأهمية', low: 'منخفض الأهمية' })[lead.priority ?? item.priority] ?? lead.priority ?? item.priority ?? '—',
    callAttempts: lead.callAttempts ?? item.callAttempts ?? null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    lastContactAt: lead.lastContactAt ?? item.lastContactAt ?? null,
    nextCallAt: lead.nextCallAt ?? item.nextCallAt ?? null,
    // Queue responses use lastCallDurationSec; keep the legacy alias for existing views.
    lastCallDurationSec: item.lastCallDurationSec ?? item.lastDurationSec ?? lead.lastCallDurationSec ?? lead.lastDurationSec ?? null,
    lastDurationSec: item.lastCallDurationSec ?? item.lastDurationSec ?? lead.lastCallDurationSec ?? lead.lastDurationSec ?? null,
    lastContact: Number.isFinite(Date.parse(lead.lastContactAt ?? item.lastContactAt))
      ? new Date(lead.lastContactAt ?? item.lastContactAt).toLocaleString('ar', { calendar: 'gregory', dateStyle: 'short', timeStyle: 'short' })
      : item.lastContact ?? '—',
    agent: item.agent ?? item.userId?.name ?? lead.assignedTo?.name ?? '—',
    type: ({ inbound: 'وارد', outbound: 'صادر' })[item.direction] ?? item.type ?? '—',
    status: queue && item.state === 'pending' ? 'في الانتظار'
      : queue && item.state === 'done' ? 'مكتمل' : outcomes[status] ?? item.status ?? item.state ?? status ?? '—',
    lastResult: outcomes[status] ?? item.lastResult ?? status ?? '',
    callStatus: lead.callStatus ?? item.callStatus ?? item.outcome ?? '',
    date: item.date ?? (item.startedAt || item.createdAt ? new Date(item.startedAt ?? item.createdAt).toLocaleString('ar', { calendar: 'gregory', dateStyle: 'short', timeStyle: 'short' }) : '—'),
    note: item.resultNotes ?? item.note ?? '',
  }
}

/*
 * يغطي هذا الملف نوعين من البيانات ضمن نفس نطاق "المكالمات":
 * - queue: قائمة مكالمات اليوم المخصصة للموظف الحالي (صفحة Calls).
 * - log: سجل/جدول كل المكالمات مع فلاتر وترقيم صفحات (صفحة Agents).
 */
export const callsService = {
  async dial(leadId) {
    if (typeof leadId !== 'string' || !leadId.trim()) throw new Error('معرّف العميل مطلوب لبدء الاتصال')
    const response = await api.post(ENDPOINTS.calls.dial, { leadId: leadId.trim() })
    if (response?.success === false) throw new Error(response.message || 'تعذّر بدء الاتصال')
    const data = response?.data
    if (data?.leadId !== leadId.trim() || typeof data?.dialUri !== 'string' || !/^tel:\+?[0-9]{3,15}$/.test(data.dialUri)) {
      throw new Error('رابط الاتصال الذي أعاده السيرفر غير صالح')
    }
    return data
  },
  mapNextLead(lead, queueItem = {}) {
    // Queue metadata may be reused, but customer fields must come from nextLead.
    return mapCall({
      ...lead,
      id: queueItem.id ?? lead.id ?? lead._id,
      leadId: lead,
      position: queueItem.position,
      queueDate: queueItem.queueDate,
      state: queueItem.state,
    }, true)
  },
  mapCustomer(customer, position = 0) {
    const id = customer?.id ?? customer?._id
    return mapCall({
      ...customer,
      id,
      leadId: id,
      position,
      state: 'pending',
    }, true)
  },
  async getQueue({ signal, q = '', status = 'all', page = 1, limit = 10 } = {}) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح')
    }
    const params = {}
    if (q?.trim()) params.q = q.trim()
    if (status && status !== 'all') params.status = status
    params.page = page
    params.limit = limit
    const data = await api.get(ENDPOINTS.calls.queue, { signal, params })
    return {
      items: readItems(data).map(item => mapCall(item, true)),
      date: data?.meta?.date ?? data?.data?.meta?.date ?? null,
      counts: data?.meta?.counts ?? data?.data?.meta?.counts ?? {},
      meta: data?.meta ?? data?.data?.meta ?? {},
    }
  },


  async saveOutcome(payload) {
    const response = await api.post(ENDPOINTS.calls.create, payload)
    if (response?.success === false) {
      throw new Error(response.message || response.error || 'تعذّر حفظ نتيجة المكالمة')
    }
    return response
  },

  async getList({ page = 1, limit = 20, leadId = '', q = '', status = '', type = '', userId = '', signal } = {}) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح؛ الحد الأقصى 100')
    }
    if (typeof leadId !== 'string') throw new Error('معرّف العميل يجب أن يكون نصيًا')
    const params = { page, limit }
    for (const [key, value] of Object.entries({ leadId, q, status, type, userId })) {
      if (typeof value !== 'string') throw new Error('قيم فلاتر المكالمات يجب أن تكون نصية')
      if (value.trim()) params[key] = value.trim()
    }
    const data = await api.get(ENDPOINTS.calls.list, { params, signal })
    const body = data?.data ?? data
    const items = readItems(data).map(item => mapCall(item))
    const rawTotal = data?.meta?.total ?? body?.meta?.total ?? body?.pagination?.total ?? body?.total
    const total = rawTotal == null ? items.length : Number(rawTotal)
    return {
      items,
      total: Number.isSafeInteger(total) && total >= 0 ? total : items.length,
      stats: body?.stats ?? data?.stats ?? null
    }
  },

  async getCustomerHistory({ leadId, page = 1, limit = 20, includeMeta = false }) {
    if (typeof leadId !== 'string' || !leadId.trim()) {
      throw new Error('يلزم معرّف العميل لعرض سجل المكالمات')
    }
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح')
    }
    const response = await api.get(ENDPOINTS.calls.history, { params: { leadId: leadId.trim(), page, limit } })
    const items = readItems(response).map(item => {
      const call = mapCall(item)
      const seconds = Number(item.durationSec)
      return {
        ...call,
        type: item.direction === 'outbound' ? 'مكالمة صادر' : item.direction === 'inbound' ? 'مكالمة وارد' : 'مكالمة',
        result: call.status,
        duration: item.durationSec != null && Number.isFinite(seconds) && seconds >= 0
          ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '—',
      }
    })
    return includeMeta ? { items, total: response?.meta?.total ?? items.length } : items
  },

}
