const statusLabels = { new: 'عميل جديد', interested: 'مهتم', not_interested: 'غير مهتم', no_answer: 'لا يرد', reschedule: 'إعادة جدولة' }
const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }

function entryView(record, category, index, at) {
  const date = new Date(at ?? record.startedAt ?? record.uploadedAt ?? record.createdAt)
  const validDate = Number.isFinite(date.getTime())
  const duration = Number(record.durationSec)
  let fileUrl = null
  if (typeof record.fileUrl === 'string') {
    const rawUrl = record.fileUrl.match(/^\[[^\]]*\]\((https?:\/\/[^\s]+)\)$/)?.[1] ?? record.fileUrl
    try {
      const url = new URL(rawUrl)
      if (['http:', 'https:'].includes(url.protocol)) fileUrl = url.href
    } catch { /* Invalid document URLs are displayed without a link. */ }
  }
  return {
    id: record.id ?? record._id ?? `${category}-${index}`,
    category,
    callData: category === 'calls' ? {
      leadId: typeof record.leadId === 'object' ? record.leadId?.id ?? record.leadId?._id : record.leadId,
      direction: record.direction, outcome: record.outcome, durationSec: record.durationSec,
      nextCallAt: record.nextCallAt, rescheduleReason: record.rescheduleReason,
    } : null,
    title: category === 'calls' ? ({ outbound: 'مكالمة صادرة', inbound: 'مكالمة واردة' })[record.direction] ?? 'مكالمة'
      : category === 'documents' ? record.fileName ?? 'وثيقة'
      : category === 'messages' ? 'رسالة'
      : category === 'notes' ? 'ملاحظة'
      : record.action === 'lead_added' ? 'إضافة العميل' : ({ system: 'نشاط', visits: 'زيارة' })[category] ?? 'نشاط',
    note: record.description ?? record.resultNotes ?? record.text ?? record.body ?? record.content ?? '',
    meta: record.userId?.name ?? record.uploadedBy?.name ?? '',
    fileUrl,
    duration: category === 'calls' && record.durationSec != null && Number.isInteger(duration) && duration >= 0
      ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : null,
    tag: category === 'calls' ? statusLabels[record.outcome] ?? record.outcome ?? '' : '',
    tagClass: ({ interested: 'bg-emerald-50 text-emerald-600', not_interested: 'bg-red-50 text-red-500', no_answer: 'bg-gray-100 text-gray-500', reschedule: 'bg-violet-50 text-violet-500' })[record.outcome] ?? 'bg-gray-100 text-gray-500',
    date: validDate ? date.toLocaleDateString('ar', { calendar: 'gregory' }) : '—',
    time: validDate ? date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
    answered: record.outcome === 'no_answer' ? false : null
  }
}

export function mapCustomerNote(note) {
  return entryView(note, 'notes', 0)
}

export function buildTimelineCallPayload(entry, leadId, note) {
  const call = entry?.callData
  if (!call) throw new Error('اختر مكالمة من الجدول الزمني أولًا')
  if (!note.trim()) throw new Error('اكتب الملاحظة أولًا')
  if (call.leadId && call.leadId !== leadId) throw new Error('المكالمة لا تخص هذا العميل')
  if (!['inbound', 'outbound'].includes(call.direction)
    || !['interested', 'not_interested', 'no_answer', 'reschedule'].includes(call.outcome)
    || call.durationSec == null || call.durationSec === ''
    || !Number.isInteger(Number(call.durationSec)) || Number(call.durationSec) < 0) {
    throw new Error('بيانات المكالمة المختارة غير مكتملة')
  }
  const payload = { leadId, direction: call.direction, outcome: call.outcome,
    durationSec: Number(call.durationSec), resultNotes: note.trim() }
  if (call.outcome === 'reschedule') {
    if (!call.nextCallAt || !Number.isFinite(Date.parse(call.nextCallAt)) || !call.rescheduleReason?.trim()) {
      throw new Error('المكالمة المختارة لا تحتوي على موعد وسبب إعادة الجدولة')
    }
    payload.nextCallAt = new Date(call.nextCallAt).toISOString()
    payload.rescheduleReason = call.rescheduleReason.trim()
  }
  return payload
}

export function mapCustomerProfile(response) {
  const profile = response?.data
  const lead = profile?.lead
  if (response?.success === false || !lead || typeof lead.fullName !== 'string') throw new Error('تعذر قراءة بيانات ملف العميل')
  const stats = profile.stats ?? {}
  const assignedRole = lead.assignedTo?.role
  const customer = {
    id: lead.id,
    name: lead.fullName,
    phone: lead.phone ?? '—',
    email: lead.email ?? '—',
    nationalId: lead.nationalId ?? '—',
    status: statusLabels[lead.callStatus] ?? lead.callStatus ?? '—',
    location: lead.city ?? '—',
    source: lead.sourceId?.name ?? '—',
    workType: lead.businessType ?? '—',
    projectType: lead.projectType ?? '—',
    budget: lead.budget ?? '—',
    createdAt: lead.createdAt && Number.isFinite(Date.parse(lead.createdAt)) ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '—',
    addedAt: lead.createdAt && Number.isFinite(Date.parse(lead.createdAt)) ? new Date(lead.createdAt).toLocaleDateString('en-GB') : '—',
    lastContact: lead.lastContactAt && Number.isFinite(Date.parse(lead.lastContactAt))
      ? new Date(lead.lastContactAt).toLocaleString('ar', { calendar: 'gregory', dateStyle: 'short', timeStyle: 'short' }) : '—',
    priority: priorityLabels[lead.priority] ?? lead.priority ?? '—',
    assignedAgent: { name: lead.assignedTo?.name ?? '—', role: ({ call_center: 'كول سنتر', data_entry: 'مدخل بيانات', admin: 'أدمن', super_admin: 'سوبر أدمن' })[assignedRole] ?? assignedRole ?? '—', phone: lead.assignedTo?.phone ?? null },
    stats: { fieldVisits: stats.totalVisits, totalCalls: stats.totalCalls, interestPoints: stats.interestScore, daysSinceAdded: stats.daysSinceAdded },
    interestScore: stats.interestScore ?? lead.interestScore ?? null
  }
  const activities = {
    timeline: (Array.isArray(profile.timeline) ? profile.timeline : []).map((entry, index) => entryView(entry.data ?? {}, ({ activity: 'system', call: 'calls', message: 'messages', note: 'notes', visit: 'visits', document: 'documents' })[entry.type] ?? entry.type, index, entry.at))
  }
  for (const category of ['calls', 'visits', 'documents']) {
    activities[category] = (Array.isArray(profile[category]) ? profile[category] : []).map((record, index) => entryView(record, category, index))
  }
  return { customer, activities }
}
