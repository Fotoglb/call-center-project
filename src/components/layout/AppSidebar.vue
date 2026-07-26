<template>
  <aside
    class="hidden md:flex flex-col w-56 bg-primary border-s border-accent/20 h-screen flex-shrink-0 shadow-sm"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 py-5 border-b border-accent/20 flex-shrink-0">
      <img
        src="@/assets/logo-fotodev.jpg"
        alt="Fotodev"
        class="w-[58px] h-[35px] rounded-[4px] object-contain bg-white shrink-0"
      />
      <div class="leading-tight min-w-0">
        <p class="text-sm font-black text-white whitespace-nowrap">CRM - Fotodev</p>
        <p class="text-xs text-accent/70 mt-0.5 whitespace-nowrap">منصة خدمة العملاء</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-3 overflow-y-auto space-y-0.5 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-accent/70 hover:text-white hover:bg-white/5 transition-colors"
        :class="{ 'exact-active': item.exact }"
        active-class="!text-white !bg-secondary font-semibold"
        :exact-active-class="item.exact ? '!text-white !bg-secondary font-semibold' : ''"
      >
        <component :is="item.icon" :size="16" class="shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="border-t border-accent/20 p-3 flex-shrink-0">
      <button
        class="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-accent/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
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
    { label: 'لوحة التحكم', path: '/', icon: Home, exact: true },
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
