import api from './api'
import { ENDPOINTS } from './endpoints'

export const dashboardService = {
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
