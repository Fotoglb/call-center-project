<template>
  <header
    class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-accent/30 shrink-0 lg:h-24 lg:flex-nowrap lg:px-6 lg:py-0"
  >
    <!-- Search bar -->
    <div ref="searchRef" class="order-3 w-full relative lg:order-1 lg:w-auto lg:flex-1 lg:max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="البحث عن عميل..."
        class="w-full h-10 ps-4 pe-10 bg-muted border border-accent/50 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
        @focus="showResults = true"
      />
      <span
        class="absolute inset-y-0 inset-e-3.5 flex items-center text-gray-400 pointer-events-none"
      >
        <Search :size="15" />
      </span>

      <!-- Search Results Dropdown -->
      <div
        v-if="showResults && searchQuery.trim()"
        class="absolute start-0 top-full z-30 mt-2 w-full min-w-64 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
      >
        <button
          v-for="customer in searchResults"
          :key="customer.id"
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start hover:bg-gray-50 cursor-pointer transition-colors"
          @click="goToCustomer(customer)"
        >
          <div
            class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary shrink-0"
          >
            {{ customer.name.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-gray-800 truncate">{{ customer.name }}</p>
            <p class="text-xs text-gray-400 tabular-nums" dir="ltr">{{ customer.phone }}</p>
          </div>
        </button>

        <p v-if="isSearching" class="px-2.5 py-2 text-xs text-gray-400">...جارٍ البحث</p>
        <p v-else-if="searchResults.length === 0" class="px-2.5 py-2 text-xs text-gray-400">
          لا توجد نتائج
        </p>
      </div>
    </div>

    <!-- Logo (mobile only, shown in sidebar on desktop) -->
    <div class="order-1 flex items-center gap-2 shrink-0 md:hidden">
      <img
        src="@/assets/logo-fotodev.jpg"
        alt="Fotodev"
        class="w-[46px] h-[28px] rounded-[4px] object-contain bg-white shrink-0"
      />
      <div class="leading-tight min-w-0">
        <p class="text-xs font-black text-gray-900 whitespace-nowrap">CRM - Fotodev</p>
        <p class="text-[11px] text-gray-400 whitespace-nowrap">منصة خدمة العملاء</p>
      </div>
    </div>

    <!-- User info + Bell -->
    <div class="order-2 flex items-center gap-2 shrink-0 lg:order-2">
      <div ref="notificationsRef" class="relative">
      <button
        class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        aria-label="الإشعارات"
        @click="toggleNotifications"
      >
        <Bell :size="18" />
        <span v-if="unreadCount > 0" class="absolute top-1.5 inset-e-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      <div v-if="notificationsOpen" class="absolute inset-e-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-lg" dir="rtl">
        <div class="flex items-center justify-between px-2 py-2 border-b border-gray-100"><span class="text-sm font-semibold">الإشعارات ({{ unreadCount }})</span><button type="button" class="text-xs text-blue" :disabled="markingAll || !unreadCount" @click="markAllRead">تحديد الكل كمقروء</button></div>
        <div class="max-h-80 overflow-y-auto">
          <button v-for="item in notifications" :key="item.id" type="button" class="w-full rounded-lg p-3 text-start hover:bg-gray-50" :class="{ 'bg-blue-50/50': !item.isRead }" @click="markRead(item)"><p class="text-xs font-semibold text-gray-800">{{ item.title }}</p><p class="mt-1 text-xs text-gray-500">{{ item.body }}</p><p class="mt-1 text-[10px] text-gray-400">{{ formatNotificationDate(item.createdAt) }}</p></button>
          <p v-if="!notifications.length" class="p-6 text-center text-xs text-gray-400">لا توجد إشعارات</p>
        </div>
      </div>
      </div>
      <div ref="userMenuRef" class="relative">
        <button
          class="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer group"
          @click="isUserMenuOpen = !isUserMenuOpen"
        >
          <div
            class="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm shrink-0 overflow-hidden"
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

        <!-- User Menu Dropdown -->
        <div
          v-if="isUserMenuOpen"
          class="absolute inset-e-0 top-full z-30 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          <button
            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
            @click="handleLogout"
            :disabled="authStore.isLoggingOut"
            :aria-busy="authStore.isLoggingOut"
          >
            <LogOut :size="16" class="shrink-0" />
            {{ authStore.isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Bell, ChevronDown, LogOut, Search } from '@lucide/vue'
  import { useAuthStore } from '@/stores/auth.store'
  import { customersService } from '@/services/customers.service'
  import { notificationsService } from '@/services/notifications.service'

  const authStore = useAuthStore()
  const router = useRouter()

  const userName = computed(() => authStore.user?.name || '—')
  const userRole = computed(() => authStore.user?.role || '—')
  const userAvatar = computed(() => authStore.user?.avatar || null)
  const userInitial = computed(() => (authStore.user?.name || '؟').charAt(0))

  const userMenuRef = ref(null)
  const isUserMenuOpen = ref(false)
  const notificationsRef = ref(null)
  const notificationsOpen = ref(false)
  const notifications = ref([])
  const unreadCount = ref(0)
  const markingAll = ref(false)
  async function loadNotifications() { try { const [list, count] = await Promise.all([notificationsService.list(), notificationsService.unreadCount()]); notifications.value = list.items; unreadCount.value = count } catch { /* optional UI */ } }
  async function toggleNotifications() { notificationsOpen.value = !notificationsOpen.value; if (notificationsOpen.value) await loadNotifications() }
  async function markRead(item) { if (item.isRead) return; try { await notificationsService.markRead(item.id); item.isRead = true; unreadCount.value = Math.max(0, unreadCount.value - 1) } catch { /* keep unread */ } }
  async function markAllRead() { if (markingAll.value || !unreadCount.value) return; markingAll.value = true; try { await notificationsService.markAllRead(); notifications.value.forEach(item => { item.isRead = true }); unreadCount.value = 0 } finally { markingAll.value = false } }
  function formatNotificationDate(value) { return Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('ar', { calendar: 'gregory', dateStyle: 'short', timeStyle: 'short' }) : '—' }

  async function handleLogout() {
    await authStore.logout()
    router.push({ name: 'Login' })
  }

  /* ----------------------------------------
   * Customer search
   * -------------------------------------- */

  const searchRef = ref(null)
  const searchQuery = ref('')
  const showResults = ref(false)
  const searchResults = ref([])
  const isSearching = ref(false)
  let searchDebounce = null

  watch(searchQuery, value => {
    clearTimeout(searchDebounce)
    const q = value.trim()
    if (!q) {
      searchResults.value = []
      isSearching.value = false
      return
    }

    searchDebounce = setTimeout(async () => {
      isSearching.value = true
      try {
        searchResults.value = await customersService.search(q)
      } catch {
        searchResults.value = []
      } finally {
        isSearching.value = false
      }
    }, 300)
  })

  function goToCustomer(customer) {
    router.push({ name: 'CustomerProfile', params: { id: customer.id } })
    searchQuery.value = ''
    showResults.value = false
  }

  function handleClickOutside(event) {
    if (searchRef.value && !searchRef.value.contains(event.target)) {
      showResults.value = false
    }
    if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
      isUserMenuOpen.value = false
    }
    if (notificationsRef.value && !notificationsRef.value.contains(event.target)) notificationsOpen.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>
