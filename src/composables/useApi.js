import { ref } from 'vue'
import { useUiStore } from '@/stores/ui.store'

export function useApi(apiCall) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)

  async function execute(...args) {
    isLoading.value = true
    error.value = null
    try {
      data.value = await apiCall(...args)
      return data.value
    } catch (err) {
      error.value = err
      const uiStore = useUiStore()
      uiStore.addNotification({ type: 'error', message: err.message || 'An error occurred' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
