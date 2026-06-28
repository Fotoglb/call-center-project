<script setup>
  import { useUiStore } from '@/stores/ui.store'

  const uiStore = useUiStore()

  const typeMap = {
    success: { classes: 'bg-green-50 border-green-200 text-green-800', icon: '✓' },
    error: { classes: 'bg-red-50 border-red-200 text-red-800', icon: '✕' },
    warning: { classes: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠' },
    info: { classes: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ' },
  }
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4">
      <TransitionGroup name="notification">
        <div
          v-for="n in uiStore.notifications"
          :key="n.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
            (typeMap[n.type] || typeMap.info).classes,
          ]"
        >
          <span class="font-bold flex-shrink-0 mt-0.5">
            {{ (typeMap[n.type] || typeMap.info).icon }}
          </span>
          <p class="text-sm flex-1 leading-relaxed">{{ n.message }}</p>
          <button
            class="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 text-current"
            @click="uiStore.removeNotification(n.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  .notification-enter-active,
  .notification-leave-active {
    transition: all 0.3s ease;
  }
  .notification-enter-from,
  .notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
