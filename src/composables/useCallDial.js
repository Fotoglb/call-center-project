import { onUnmounted, ref } from 'vue'
import { callsService } from '@/services/calls.service'
import { useAuthStore } from '@/stores/auth.store'
import { useNotification } from '@/composables/useNotification'

export function useCallDial(getLeadId) {
  const isDialing = ref(false)
  const auth = useAuthStore()
  const notification = useNotification()
  let disposed = false
  onUnmounted(() => { disposed = true })

  async function startCall() {
    if (isDialing.value || !auth.can('callCenter.logCall')) return
    const leadId = getLeadId()
    isDialing.value = true
    try {
      const call = await callsService.dial(leadId)
      if (disposed || getLeadId() !== leadId) return
      window.location.assign(call.dialUri)
      return call
    } catch (error) {
      if (!disposed && getLeadId() === leadId) notification.error(error.message || 'تعذّر بدء الاتصال')
    } finally {
      isDialing.value = false
    }
  }

  return { isDialing, startCall }
}
