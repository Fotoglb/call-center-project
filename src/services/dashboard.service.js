import api from './api'
import { ENDPOINTS } from './endpoints'

export const dashboardService = {
  async getOverview() {
    const response = await api.get(ENDPOINTS.dashboard.overview)
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل لوحة التحكم')
    const data = response?.data ?? response
    const today = data?.today ?? {}
    const queue = data?.queue ?? {}
    const leads = data?.leads ?? {}
    return {
      stats: [
        { label: 'إجمالي العملاء', value: leads.total ?? '', sub: 'العملاء المسجلون' },
        { label: 'إجمالي المكالمات', value: today.totalCalls ?? '', sub: 'اليوم' },
        { label: 'معدل التحويل', value: today.byOutcome?.interested ?? '', sub: 'مهتم' },
        { label: 'العملاء الجدد', value: today.newLeads ?? '', sub: 'اليوم' },
        { label: 'الزيارات', value: today.visits ?? '', sub: 'اليوم' },
        { label: 'قائمة المكالمات', value: queue.total ?? '', sub: `${queue.pending ?? 0} معلقة` },
      ],
      recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
    }
  },
  async getStats() {
    const data = await api.get(ENDPOINTS.dashboard.stats)
    return data.stats ?? data
  },

  async getWeeklyPerformance() {
    const data = await api.get(ENDPOINTS.dashboard.weeklyPerformance)
    return {
      labels: data.labels ?? [],
      calls: data.calls ?? [],
      newCustomers: data.newCustomers ?? []
    }
  },

  async getCustomerSources() {
    const data = await api.get(ENDPOINTS.dashboard.customerSources)
    return data.sources ?? data
  },

  async getTeamPerformance() {
    const data = await api.get(ENDPOINTS.dashboard.teamPerformance)
    return {
      labels: data.labels ?? [],
      calls: data.calls ?? [],
      transfers: data.transfers ?? []
    }
  },

  async getActivities() {
    const data = await api.get(ENDPOINTS.dashboard.activities)
    return data.activities ?? data
  },

  async getUpcomingVisits() {
    const data = await api.get(ENDPOINTS.dashboard.upcomingVisits)
    return data.visits ?? data
  }
}
