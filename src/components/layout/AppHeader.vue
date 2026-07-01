<template>
  <header class="flex items-center gap-4 h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0">

    <!-- User info (right in RTL = start) -->
    <div class="flex items-center gap-3 shrink-0">
      <!-- Bell -->
      <button class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
        <Bell :size="18" />
        <span class="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- Divider -->
      <div class="w-px h-8 bg-gray-200"></div>

      <!-- Avatar + Name -->
      <div class="flex items-center gap-2.5">
        <div class="text-end">
          <p class="text-sm font-semibold text-gray-900 leading-none">{{ userName }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ userRole }}</p>
        </div>
        <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0 overflow-hidden">
          {{ userInitial }}
        </div>
      </div>
    </div>

    <!-- Search (center, fills remaining space) -->
    <div class="flex-1 relative">
      <input
        type="text"
        placeholder="ابحث عن عميل، رقم الهاتف، موظف..."
        class="w-full h-10 ps-4 pe-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-colors"
      />
      <span class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 pointer-events-none">
        <Search :size="16" />
      </span>
    </div>

    <!-- CRM Logo (left in RTL = end) -->
    <div class="shrink-0">
      <span class="text-base font-bold text-gray-900 tracking-widest">CRM</span>
    </div>

  </header>
</template>

<script setup>
import { computed } from 'vue'
import { Bell, Search } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || 'محمد الثالث')
const userRole = computed(() => authStore.user?.role || 'موظف كول سنتر')
const userInitial = computed(() => (authStore.user?.name || 'م').charAt(0))
</script>
