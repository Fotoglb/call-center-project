<template>
  <aside class="flex flex-col w-52 bg-white border-s border-gray-200 h-screen flex-shrink-0">

    <!-- Logo -->
    <div class="flex items-center justify-center h-16 border-b border-gray-100 flex-shrink-0">
      <span class="text-lg font-bold text-gray-900 tracking-widest">CRM</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        active-class="text-gray-900 bg-gray-100 font-semibold"
        :exact="item.exact"
      >
        <component :is="item.icon" :size="17" class="shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="border-t border-gray-100 p-4 flex-shrink-0">
      <button
        class="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        @click="handleLogout"
      >
        <LogOut :size="17" class="shrink-0" />
        <span>تسجيل الخروج</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  Home, LayoutDashboard, Users, PhoneCall, BarChart2,
  Settings, HelpCircle, LogOut, Phone,
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { label: 'الرئيسية',       path: '/',          icon: Home,            exact: true },
  { label: 'لوحة التحكم',    path: '/dashboard', icon: LayoutDashboard },
  { label: 'إدارة العملاء',  path: '/customers', icon: Users },
  { label: 'فريق الاتصال',   path: '/agents',    icon: Phone },
  { label: 'سجل المكالمات',  path: '/calls',     icon: PhoneCall },
  { label: 'التقارير',        path: '/reports',   icon: BarChart2 },
  { label: 'الإعدادات',      path: '/settings',  icon: Settings },
  { label: 'المساعدة',        path: '/help',      icon: HelpCircle },
]

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
