import { useUiStore } from '@/stores/ui.store'

export function useNotification() {
  const uiStore = useUiStore()

  return {
    success: message => uiStore.addNotification({ type: 'success', message }),
    error: message => uiStore.addNotification({ type: 'error', message }),
    warning: message => uiStore.addNotification({ type: 'warning', message }),
    info: message => uiStore.addNotification({ type: 'info', message }),
  }
}
