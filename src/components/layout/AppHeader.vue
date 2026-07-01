<template>
  <header class="flex items-center h-16 px-6 bg-white border-b border-gray-100 flex-shrink-0">

    <!-- User dropdown + Bell (rightmost in RTL = first in DOM) -->
    <div class="flex items-center gap-1 shrink-0">

      <!-- Avatar + Name + Chevron as one clickable button -->
      <button class="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer group">
        <!-- Avatar (first in DOM = rightmost visual in RTL) -->
        <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden">
          <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" alt="" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <!-- Name + Role -->
        <div class="text-end leading-tight">
          <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-400">{{ userRole }}</p>
        </div>
        <!-- Chevron (last = leftmost visual in RTL) -->
        <ChevronDown :size="14" class="text-gray-400 group-hover:text-gray-600 shrink-0" />
      </button>

      <!-- Bell -->
      <button class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ms-1">
        <Bell :size="18" />
        <span class="absolute top-1.5 inset-e-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

  </header>
</template>

<script setup>
import { computed } from 'vue'
import { Bell, ChevronDown } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const userName    = computed(() => authStore.user?.name    || 'محمد العتيبي')
const userRole    = computed(() => authStore.user?.role    || 'موظف كول سنتر')
const userAvatar  = computed(() => authStore.user?.avatar  || null)
const userInitial = computed(() => (authStore.user?.name   || 'م').charAt(0))
</script>
