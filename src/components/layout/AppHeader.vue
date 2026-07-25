<template>
  <header
    class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0 lg:h-20 lg:flex-nowrap lg:px-6 lg:py-0"
  >
    <!-- Search bar -->
    <div class="order-3 w-full relative lg:order-1 lg:w-auto lg:flex-1 lg:max-w-md">
      <input
        type="text"
        placeholder="ابحث عن عميل بالرقم هاتفه..."
        class="w-full h-10 ps-4 pe-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
      />
      <span
        class="absolute inset-y-0 inset-e-3.5 flex items-center text-gray-400 pointer-events-none"
      >
        <Search :size="15" />
      </span>
    </div>

    <!-- Logo (mobile only, shown in sidebar on desktop) -->
    <div class="order-1 flex items-center gap-2 shrink-0 lg:hidden">
      <div class="w-9 h-9 rounded-xl bg-black flex items-center justify-center shrink-0">
        <span class="text-[10px] font-black text-white tracking-widest">CRM</span>
      </div>
      <div class="leading-tight">
        <p class="text-xs font-black text-gray-900 tracking-[0.15em]">CRM</p>
        <p class="text-[11px] text-gray-400">منصة خدمة العملاء</p>
      </div>
    </div>

    <!-- User info + Bell -->
    <div class="order-2 flex items-center gap-2 shrink-0 lg:order-2">
      <button
        class="flex items-center gap-2.5 hover:bg-white rounded-xl px-2 py-1.5 transition-colors cursor-pointer group"
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
