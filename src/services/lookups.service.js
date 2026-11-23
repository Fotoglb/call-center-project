import api from './api'
import { ENDPOINTS } from './endpoints'

export const lookupsService = {
  async get() {
    const response = await api.get(ENDPOINTS.lookups)
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل القوائم')
    const data = response?.data ?? response
    return {
      types: Array.isArray(data?.types) ? data.types : Array.isArray(data?.callTypes) ? data.callTypes : Array.isArray(data?.projectTypes) ? data.projectTypes : [],
      outcomes: Array.isArray(data?.outcomes) ? data.outcomes : Array.isArray(data?.statuses) ? data.statuses : [],
      raw: data,
    }
  }
}
