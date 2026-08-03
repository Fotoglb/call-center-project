<template>
  <div ref="rootRef" class="md:hidden">
    <!-- More sheet -->
    <div
      v-if="showMore"
      class="fixed sm:inset-x-2 inset-x-0 bottom-18 z-20 space-y-0.5 rounded-t-2xl border-x-0 sm:flex border-t border-b-0 border-accent/20 bg-primary p-2 shadow-lg"
    >
      <RouterLink
        v-for="item in overflowItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-accent/70"
        :class="{ '!text-white !bg-secondary font-semibold': isActive(item) }"
        @click="showMore = false"
      >
        <component :is="item.icon" :size="16" class="shrink-0" />
        <span>{{ item.label }}</span>
      </RouterLink>

      <div class="my-1 border-t border-accent/20"></div>

      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 cursor-pointer transition-colors"
        @click="handleLogout"
      >
        <LogOut :size="16" class="shrink-0" />
        <span>تسجيل الخروج</span>
      </button>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-accent/20 bg-primary"
    >
      <!-- أول عنصرين: ظاهرين دايمًا (من عرض ~300px)، مع زر المزيد = 3 أزرار بالإجمالي -->
      <RouterLink
        v-for="item in allItems.slice(0, 2)"
        :key="item.path"
        :to="item.path"
        class="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-accent/60"
        active-class="!text-white"
        :exact-active-class="item.exact ? '!text-white' : ''"
        @click="showMore = false"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl"
          :class="{ 'bg-secondary': isActive(item) }"
        >
          <component :is="item.icon" :size="18" />
        </span>
        <span class="font-medium">{{ item.label }}</span>
      </RouterLink>

      <!-- العنصر الثالث: من عرض ~600px، مع زر المزيد = 4 أزرار بالإجمالي -->
      <RouterLink
        v-for="item in allItems.slice(2, 3)"
        :key="item.path"
        :to="item.path"
        class="hidden flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-accent/60 min-[600px]:flex"
        active-class="!text-white"
        :exact-active-class="item.exact ? '!text-white' : ''"
        @click="showMore = false"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl"
          :class="{ 'bg-secondary': isActive(item) }"
        >
          <component :is="item.icon" :size="18" />
        </span>
        <span class="font-medium">{{ item.label }}</span>
      </RouterLink>

      <!-- العنصر الرابع والخامس: من عرض md (768px)، مع زر المزيد = 6 أزرار بالإجمالي (الأقصى) -->
      <RouterLink
        v-for="item in allItems.slice(3, 5)"
        :key="item.path"
        :to="item.path"
        class="hidden flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-accent/60 md:flex"
        active-class="!text-white"
        :exact-active-class="item.exact ? '!text-white' : ''"
        @click="showMore = false"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl"
          :class="{ 'bg-secondary': isActive(item) }"
        >
          <component :is="item.icon" :size="18" />
        </span>
        <span class="font-medium">{{ item.label }}</span>
      </RouterLink>

      <!-- المزيد: ظاهر دايمًا لأن الإجمالي 8 عناصر أكبر من أقصى عدد ظاهر (5 + زر المزيد نفسه = 6) -->
      <button
        type="button"
        class="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs text-accent/60 cursor-pointer"
        :class="{ '!text-white': showMore || overflowItems.some(isActive) }"
        @click="showMore = !showMore"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl"
          :class="{ 'bg-secondary': showMore || overflowItems.some(isActive) }"
        >
          <MoreHorizontal :size="18" />
        </span>
        <span class="font-medium">المزيد</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    Home,
    Users,
    PhoneIncoming,
    BarChart2,
    PhoneCall,
    Settings,
    HelpCircle,
    LogOut,
    MoreHorizontal
  } from '@lucide/vue'
  import { useAuthStore } from '@/stores/auth.store'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const rootRef = ref(null)
  const showMore = ref(false)

  function handleLogout() {
    authStore.logout()
    router.push({ name: 'Login' })
  }

  /*
   * مرتبة حسب الأولوية. زر "المزيد" بيتحسب كواحد من الأزرار الظاهرة:
   * <600px: عنصرين + المزيد = 3 أزرار.
   * >=600px: 3 عناصر + المزيد = 4 أزرار.
   * >=md(768px): 5 عناصر + المزيد = 6 أزرار (الأقصى). الباقي (6، 7، 8)
   * موجود بس جوه "المزيد" مهما كان عرض الشاشة.
   */
  const allItems = [
    { label: 'لوحة التحكم', path: '/', icon: Home, exact: true },
    { label: 'إدارة العملاء', path: '/customers', icon: Users },
    { label: 'مركز الاتصال', path: '/agents', icon: PhoneIncoming },
    { label: 'التقارير', path: '/reports', icon: BarChart2 },
    { label: 'سجل المكالمات', path: '/calls', icon: PhoneCall },
    { label: 'الإعدادات', path: '/settings', icon: Settings },
    { label: 'المساعدة', path: '/help', icon: HelpCircle }
  ]

  /*
   * "المزيد" لازم يحتوي كل عنصر مش ظاهر دايمًا على الشريط (يعني كل
   * حاجة بعد أول عنصرين)، مش بس اللي بيفضل بعد أقصى عدد على أوسع
   * مقاس — عشان في المقاسات الصغيرة محدش يضيع من غير ما يظهر في
   * الشريط ولا في المزيد.
   */
  const overflowItems = computed(() => allItems.slice(2))

  function isActive(item) {
    return item.exact ? route.path === item.path : route.path.startsWith(item.path)
  }

  function handleClickOutside(event) {
    if (rootRef.value && !rootRef.value.contains(event.target)) {
      showMore.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>
