<template>
  <aside
    class="flex flex-col w-56 bg-white border-s border-gray-100 h-screen flex-shrink-0 shadow-sm"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-gray-100 flex-shrink-0">
      <div
        class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0"
      >
        <span class="text-xs font-black text-white tracking-widest">CRM</span>
      </div>
      <div class="leading-tight">
        <p class="text-sm font-black text-gray-900 tracking-[0.15em]">CRM</p>
        <p class="text-xs text-gray-400">منصة خدمة العملاء</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-3 overflow-y-auto space-y-0.5 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
        :class="{ 'exact-active': item.exact }"
        active-class="!text-indigo-600 !bg-indigo-50 font-semibold"
        :exact-active-class="item.exact ? '!text-indigo-600 !bg-indigo-50 font-semibold' : ''"
      >
        <component :is="item.icon" :size="16" class="shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="border-t border-gray-100 p-3 flex-shrink-0">
      <button
        class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        @click="handleLogout"
      >
        <LogOut :size="16" class="shrink-0" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import {
    Home,
    LayoutDashboard,
    Users,
    PhoneIncoming,
    PhoneCall,
    BarChart2,
    Settings,
    HelpCircle,
    LogOut
  } from '@lucide/vue'
  import { useAuthStore } from '@/stores/auth.store'

  const router = useRouter()
  const authStore = useAuthStore()

  const navItems = [
    { label: 'الرئيسية', path: '/', icon: Home, exact: true },
    { label: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
    { label: 'إدارة العملاء', path: '/customers', icon: Users },
    { label: 'مركز الاتصال', path: '/agents', icon: PhoneIncoming },
    { label: 'سجل المكالمات', path: '/calls', icon: PhoneCall },
    { label: 'التقارير', path: '/reports', icon: BarChart2 },
    { label: 'الإعدادات', path: '/settings', icon: Settings },
    { label: 'المساعدة', path: '/help', icon: HelpCircle }
  ]

  function handleLogout() {
    authStore.logout()
    router.push({ name: 'Login' })
  }
</script>
