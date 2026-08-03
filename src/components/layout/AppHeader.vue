<template>
  <header
    class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-accent/30 shrink-0 lg:h-24 lg:flex-nowrap lg:px-6 lg:py-0"
  >
    <!-- Search bar -->
    <div ref="searchRef" class="order-3 w-full relative lg:order-1 lg:w-auto lg:flex-1 lg:max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ابحث عن عميل بالرقم هاتفه..."
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

        <p v-if="searchResults.length === 0" class="px-2.5 py-2 text-xs text-gray-400">
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
      <button
        class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        <Bell :size="18" />
        <span class="absolute top-1.5 inset-e-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
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
          >
            <LogOut :size="16" class="shrink-0" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Bell, ChevronDown, LogOut, Search } from '@lucide/vue'
  import { useAuthStore } from '@/stores/auth.store'

  const authStore = useAuthStore()
  const router = useRouter()

  const userName = computed(() => authStore.user?.name || 'محمد العتيبي')
  const userRole = computed(() => authStore.user?.role || 'موظف كول سنتر')
  const userAvatar = computed(() => authStore.user?.avatar || null)
  const userInitial = computed(() => (authStore.user?.name || 'م').charAt(0))

  const userMenuRef = ref(null)
  const isUserMenuOpen = ref(false)

  function handleLogout() {
    authStore.logout()
    router.push({ name: 'Login' })
  }

  /* ----------------------------------------
   * Customer search
   * -------------------------------------- */

  const customers = [
    { id: 1, name: 'عبد الله المطيري', phone: '0551234567' },
    { id: 2, name: 'نورا المحمد', phone: '0569801234' },
    { id: 3, name: 'خالد الزهراني', phone: '0533456789' },
    { id: 4, name: 'سلمان العلي', phone: '0561022334' },
    { id: 5, name: 'منى الزرقاء', phone: '0564433667' },
    { id: 6, name: 'ليلى السيسي', phone: '0569876543' },
    { id: 7, name: 'فيصل المثنى', phone: '0367654321' },
    { id: 8, name: 'فاطمة الحربي', phone: '0559876543' },
    { id: 9, name: 'طارق العزيزي', phone: '0559898034' },
    { id: 10, name: 'فاطمة القامر', phone: '0952345699' },
    { id: 11, name: 'يوسف القاسم', phone: '0312345678' }
  ]

  const searchRef = ref(null)
  const searchQuery = ref('')
  const showResults = ref(false)

  const searchResults = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) {
      return []
    }

    return customers
      .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 6)
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
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>
