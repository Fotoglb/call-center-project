<template>
  <header
    class="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shrink-0"
  >
    <!-- Search bar -->
    <div class="flex-1 max-w-md relative">
      <input
        type="text"
        placeholder="ابحث عن عميل بالرقم هاتفه..."
        class="w-full h-10 ps-4 pe-10 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors"
      />
      <span
        class="absolute inset-y-0 inset-e-3.5 flex items-center text-gray-400 pointer-events-none"
      >
        <Search :size="15" />
      </span>
    </div>

    <!-- User info + Bell -->
    <div class="flex items-center gap-2 shrink-0">
      <button
        class="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer group"
      >
        <div
          class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden"
        >
          <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" alt="" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <div class="text-end leading-tight">
          <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-400">{{ userRole }}</p>
        </div>
        <ChevronDown :size="14" class="text-gray-400 group-hover:text-gray-600 shrink-0" />
      </button>

      <button
        class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        <Bell :size="18" />
        <span class="absolute top-1.5 inset-e-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
  import { computed } from 'vue'
  import { Bell, ChevronDown, Search } from '@lucide/vue'
  import { useAuthStore } from '@/stores/auth.store'

  const authStore = useAuthStore()

  const userName = computed(() => authStore.user?.name || 'محمد العتيبي')
  const userRole = computed(() => authStore.user?.role || 'موظف كول سنتر')
  const userAvatar = computed(() => authStore.user?.avatar || null)
  const userInitial = computed(() => (authStore.user?.name || 'م').charAt(0))
</script>
