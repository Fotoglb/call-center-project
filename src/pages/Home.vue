<template>
  <div
    v-if="false"
    class="flex flex-col items-center justify-center h-full text-center gap-6 py-20"
  >
    <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
      <LayoutDashboard :size="32" class="text-indigo-500" />
    </div>

    <div class="space-y-2">
      <h1 class="text-2xl font-bold text-gray-900">مرحباً بك في نظام CRM</h1>
      <p class="text-gray-400 text-sm max-w-xs">اختر أحد الأقسام من القائمة الجانبية للبدء</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 w-full max-w-lg">
      <RouterLink
        v-for="item in shortcuts"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group cursor-pointer"
      >
        <component
          :is="item.icon"
          :size="22"
          class="text-gray-400 group-hover:text-indigo-500 transition-colors"
        />
        <span
          class="text-xs font-medium text-gray-600 group-hover:text-indigo-600 transition-colors"
          >{{ item.label }}</span
        >
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { LayoutDashboard, Users, Phone, PhoneCall, BarChart2, Settings } from '@lucide/vue'

  const shortcuts = [
    { label: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
    { label: 'إدارة العملاء', path: '/customers', icon: Users },
    { label: 'فريق الاتصال', path: '/agents', icon: Phone },
    { label: 'سجل المكالمات', path: '/calls', icon: PhoneCall },
    { label: 'التقارير', path: '/reports', icon: BarChart2 },
    { label: 'الإعدادات', path: '/settings', icon: Settings }
  ]
</script>
