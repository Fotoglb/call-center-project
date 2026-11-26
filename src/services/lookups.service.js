import api from './api'
import { ENDPOINTS } from './endpoints'

export const lookupsService = {
  async get() {
    const response = await api.get(ENDPOINTS.lookups)
    if (response?.success === false) throw new Error(response.message || 'تعذّر تحميل القوائم')
    const data = response?.data ?? response
    const projectTypes = Array.isArray(data?.projectTypes) ? data.projectTypes : Array.isArray(data?.types) ? data.types : []
    const callOutcomes = Array.isArray(data?.callOutcomes) ? data.callOutcomes : Array.isArray(data?.outcomes) ? data.outcomes : []
    return {
      types: projectTypes,
      projectTypes,
      outcomes: callOutcomes.length ? callOutcomes : (Array.isArray(data?.statuses) ? data.statuses : []),
      callOutcomes,
      businessTypes: Array.isArray(data?.businessTypes) ? data.businessTypes : [],
      priorities: Array.isArray(data?.priorities) ? data.priorities : [],
      callStatuses: Array.isArray(data?.callStatuses) ? data.callStatuses : [],
      callDirections: Array.isArray(data?.callDirections) ? data.callDirections : [],
      messageChannels: Array.isArray(data?.messageChannels) ? data.messageChannels : [],
      visitStatuses: Array.isArray(data?.visitStatuses) ? data.visitStatuses : [],
      roles: Array.isArray(data?.roles) ? data.roles : [],
      sources: Array.isArray(data?.sources) ? data.sources : [],
      raw: data,
    }
  }
}
