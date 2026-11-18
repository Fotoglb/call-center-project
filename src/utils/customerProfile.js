const statusLabels = { new: 'عميل جديد', interested: 'مهتم', not_interested: 'غير مهتم', no_answer: 'لا يرد', reschedule: 'إعادة جدولة' }
const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' }

function entryView(record, category, index, at) {
  const date = new Date(at ?? record.createdAt)
  const validDate = Number.isFinite(date.getTime())
  return {
    id: record.id ?? `${category}-${index}`,
    category,
    title: record.action === 'lead_added' ? 'إضافة العميل' : ({ system: 'نشاط', calls: 'مكالمة', visits: 'زيارة', documents: 'وثيقة' })[category] ?? 'نشاط',
    note: record.description ?? record.resultNotes ?? '',
    meta: record.userId?.name ?? '',
    date: validDate ? date.toLocaleDateString('ar', { calendar: 'gregory' }) : '—',
    time: validDate ? date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
    answered: record.outcome === 'no_answer' ? false : null
  }
}

export function mapCustomerProfile(response) {
  const profile = response?.data
  const lead = profile?.lead
  if (response?.success === false || !lead || typeof lead.fullName !== 'string') throw new Error('تعذر قراءة بيانات ملف العميل')
  const stats = profile.stats ?? {}
  const customer = {
    id: lead.id,
    name: lead.fullName,
    phone: lead.phone ?? '—',
    email: lead.email ?? '—',
    nationalId: lead.nationalId ?? '—',
    status: statusLabels[lead.callStatus] ?? lead.callStatus ?? '—',
    location: lead.city ?? '—',
    workType: lead.businessType ?? '—',
    projectType: lead.projectType ?? '—',
    budget: lead.budget ?? '—',
    createdAt: lead.projectCreatedAt ? String(lead.projectCreatedAt).slice(0, 10) : '—',
    priority: priorityLabels[lead.priority] ?? lead.priority ?? '—',
    assignedAgent: { name: lead.assignedTo?.name ?? '—', role: lead.assignedTo?.role ?? '—' },
    stats: { fieldVisits: stats.totalVisits, totalCalls: stats.totalCalls, interestPoints: stats.interestScore, daysSinceAdded: stats.daysSinceAdded },
    interestScore: stats.interestScore ?? lead.interestScore ?? null
  }
  const activities = {
    timeline: (Array.isArray(profile.timeline) ? profile.timeline : []).map((entry, index) => entryView(entry.data ?? {}, ({ activity: 'system', call: 'calls', visit: 'visits', document: 'documents' })[entry.type] ?? entry.type, index, entry.at))
  }
  for (const category of ['calls', 'visits', 'documents']) {
    activities[category] = (Array.isArray(profile[category]) ? profile[category] : []).map((record, index) => entryView(record, category, index))
  }
  return { customer, activities }
}
