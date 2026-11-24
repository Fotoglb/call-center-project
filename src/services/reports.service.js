import api from './api'
import { ENDPOINTS } from './endpoints'

export const reportsService = {
  async getDaily(date = '') {
    const response = await api.get(ENDPOINTS.reports.daily, { params: date ? { date } : {} })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل التقرير اليومي')
    return response?.data ?? response
  },
  async getSummary(params = {}) {
    const data = await this.getDaily(params.dateTo)
    return [
      { label: 'إجمالي العملاء', value: data.totalLeads ?? null },
      { label: 'تم التحويل المشروع', value: data.converted ?? null },
      { label: 'معدل التحويل', value: data.conversionRate ?? null, unit: '%' },
      { label: 'إجمالي المكالمات', value: data.totalCalls ?? null },
      { label: 'الزيارة الميدانية', value: data.visits ?? null },
      { label: 'متوسط وقت التحويل', value: null },
    ]
  },

  async getConversionTrend(params = {}) {
    const query = {}
    if (params.dateFrom) query.from = params.dateFrom
    if (params.dateTo) query.to = params.dateTo
    const response = await api.get(ENDPOINTS.reports.conversionTrend, { params: query })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل تقرير التحويل')
    const data = response?.data ?? response
    if (!Array.isArray(data?.trend)) throw new Error('تعذّر قراءة تقرير التحويل')
    return {
      totalLeads: data.totalLeads,
      converted: data.converted,
      conversionRate: data.conversionRate,
      labels: data.trend.map(item => item.date),
      leads: data.trend.map(item => item.leads),
      conversions: data.trend.map(item => item.converted),
    }
  },

  async getCustomerSources(params = {}) {
    const query = {}
    if (params.dateFrom) query.from = params.dateFrom
    if (params.dateTo) query.to = params.dateTo
    const response = await api.get(ENDPOINTS.reports.customerSources, { params: query })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل مصادر العملاء')
    const data = response?.data ?? response
    if (!Array.isArray(data?.rows)) throw new Error('تعذّر قراءة مصادر العملاء')
    return {
      from: data.from,
      to: data.to,
      total: data.total ?? 0,
      items: data.rows.map(row => ({
        ...row,
        label: row.name,
        color: /^#[0-9a-f]{6}$/i.test(row.color ?? '') ? row.color : '#94a3b8',
      })),
    }
  },

  async getEmployeePerformance({ dateFrom = '', dateTo = '' } = {}) {
    const params = {}
    if (dateFrom) params.from = dateFrom
    if (dateTo) params.to = dateTo
    const endpoint = dateFrom || dateTo
      ? ENDPOINTS.reports.periodicEmployeePerformance
      : ENDPOINTS.reports.employeePerformance
    const response = await api.get(endpoint, { params })
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل أداء الموظفين')
    const data = response?.data ?? response
    if (!Array.isArray(data?.rows)) throw new Error('تعذّر قراءة بيانات أداء الموظفين')
    return data.rows.map(row => ({
      ...row,
      id: row.userId,
      calls: row.totalCalls,
      newCustomers: row.newLeads,
      conversions: row.converted,
    }))
  },

  async getVisitSuccess(params = {}) {
    const data = await api.get(ENDPOINTS.reports.visitSuccess, { params: { from: params.dateFrom, to: params.dateTo } })
    return {
      labels: data.labels ?? [],
      visits: data.visits ?? [],
      newCustomers: data.newCustomers ?? []
    }
  },

  async getEmployeeTrend(params = {}) {
    const data = await api.get(ENDPOINTS.reports.employeeTrend, { params: { from: params.dateFrom, to: params.dateTo } })
    return {
      labels: data.labels ?? [],
      calls: data.calls ?? [],
      newCustomers: data.newCustomers ?? []
    }
  }
}
