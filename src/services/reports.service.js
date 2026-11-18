import api from './api'
import { ENDPOINTS } from './endpoints'

export const reportsService = {
  getCdr({ page = 1, limit = 20, direction = '', outcome = '', userId = '', leadId = '', from = '', to = '' } = {}) {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('رقم الصفحة أو عدد النتائج غير صحيح؛ الحد الأقصى 100')
    }
    const params = { page, limit }
    for (const [key, value] of Object.entries({ direction, outcome, userId, leadId, from, to })) {
      if (typeof value !== 'string') throw new Error('قيم فلاتر سجل المكالمات يجب أن تكون نصية')
      if (value.trim()) params[key] = value.trim()
    }
    return api.get(ENDPOINTS.reports.cdr, { params })
  },
  getDaily(date = '') {
    return api.get(ENDPOINTS.reports.daily, { params: date ? { date } : {} })
  },
  async getSummary(params = {}) {
    const data = await api.get(ENDPOINTS.reports.summary, { params: params.dateTo ? { date: params.dateTo } : {} })
    return data.stats ?? data
  },

  async getConversionTrend(params = {}) {
    const query = {}
    if (params.dateFrom) query.from = params.dateFrom
    if (params.dateTo) query.to = params.dateTo
    const data = await api.get(ENDPOINTS.reports.conversionTrend, { params: query })
    return {
      labels: data.labels ?? [],
      visits: data.visits ?? [],
      calls: data.calls ?? [],
      newCustomers: data.newCustomers ?? []
    }
  },

  async getCustomerSources(params = {}) {
    const query = {}
    if (params.dateFrom) query.from = params.dateFrom
    if (params.dateTo) query.to = params.dateTo
    const data = await api.get(ENDPOINTS.reports.customerSources, { params: query })
    return data.sources ?? data
  },

  async getEmployeePerformance() {
    const data = await api.get(ENDPOINTS.reports.employeePerformance)
    return data.items ?? data
  },

  async getVisitSuccess(params = {}) {
    const data = await api.get(ENDPOINTS.reports.visitSuccess, { params })
    return {
      labels: data.labels ?? [],
      visits: data.visits ?? [],
      newCustomers: data.newCustomers ?? []
    }
  },

  async getEmployeeTrend(params = {}) {
    const data = await api.get(ENDPOINTS.reports.employeeTrend, { params })
    return {
      labels: data.labels ?? [],
      calls: data.calls ?? [],
      newCustomers: data.newCustomers ?? []
    }
  }
}
