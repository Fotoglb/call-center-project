<template>
  <div class="space-y-5">
    <!-- Actions + Filters Card -->
    <div class="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      <div class="sm:flex sm:space-y-0 space-y-3 items-start justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">إدارة العملاء المحتملين</h1>
          <p class="text-xs text-gray-400 mt-1">جميع العملاء من حملات الإعلانات والإدخال اليدوي</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-blue border border-blue bg-white rounded-lg sm:px-3 px-1 py-2 hover:bg-blue-light cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            تحميل الملف
          </button>
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-blue bg-blue-light rounded-lg sm:px-3 px-1 py-2 hover:opacity-90 cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            تنزيل الملف
          </button>
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-dark rounded-lg px-3 py-2 hover:opacity-90 cursor-pointer transition-colors"
            v-if="permissions.can('customers.create')"
            @click="router.push({ name: 'AddCustomer' })"
          >
            <Plus :size="14" />
            إضافة عميل
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap" dir="rtl">
        <div class="relative flex-1 min-w-48">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث بالاسم، رقم الجوال أو البريد الإلكتروني..."
            class="w-full h-9 ps-3 pe-8 bg-muted border border-accent/50 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-secondary"
          />
          <Search
            :size="13"
            class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div v-for="filter in filters" :key="filter.key" class="relative">
          <select
            v-model="activeFilters[filter.key]"
            :aria-label="filter.label"
            class="appearance-none text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">{{ filter.label }} : الكل</option>
            <option v-for="opt in filter.options" :key="opt.value ?? opt" :value="opt.value ?? opt">{{ opt.label ?? opt }}</option>
          </select>
          <ChevronDown
            :size="12"
            class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <button
          v-if="hasActiveFilter"
          class="text-xs text-red-500 hover:text-red-600 cursor-pointer px-2 py-2"
          @click="clearFilters"
        >
          مسح الكل
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-white border-b border-gray-200">
            <tr>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                اسم العميل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                رقم الهاتف
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                البريد الإلكتروني
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                المصدر
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                النوع
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                المدينة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الموظف المسؤول
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                التاريخ
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="isLoading">
              <td colspan="9" class="text-center text-gray-400 py-8">...جارٍ التحميل</td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="9" class="text-center py-8">
                <p class="text-red-500 mb-2">{{ loadError.message || 'تعذر تحميل بيانات العملاء' }}</p>
                <button
                  class="text-xs text-white bg-gray-900 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-700 transition-colors"
                  @click="loadCustomers"
                >
                  إعادة المحاولة
                </button>
              </td>
            </tr>
            <template v-else>
            <tr
              v-for="customer in paginatedCustomers"
              :key="customer.id"
              class="hover:bg-gray-100 transition-colors"
            >
              <td class="px-4 py-3">
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  @click="router.push({ name: 'CustomerProfile', params: { id: customer.id } })"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0"
                  >
                    {{ customer.name.charAt(0) }}
                  </div>
                  <span
                    class="font-medium text-gray-800 whitespace-nowrap hover:text-indigo-600 hover:underline transition-colors"
                    >{{ customer.name }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.phone }}</td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer"
                  :class="sourceClass(customer.source)"
                >
                  {{ meta.sources.find(source => source.value === customer.sourceId)?.label || customer.source || '—' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ customer.type }}</td>
              <td class="px-4 py-3 text-gray-500">{{ customer.city }}</td>
              <td class="px-4 py-3 text-gray-600">{{ customer.agent }}</td>
              <td class="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                {{ customer.date }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    class="text-blue hover:text-blue-dark cursor-pointer transition-colors"
                    title="تعديل"
                    v-if="permissions.can('customers.viewEdit')"
                    @click="handleEdit(customer)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    type="button"
                    class="text-red hover:text-red-dark cursor-pointer transition-colors"
                    title="حذف"
                    v-if="permissions.can('customers.delete')"
                    @click="handleDelete(customer)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedCustomers.length === 0">
              <td colspan="9" class="text-center text-gray-400 py-8">لا توجد نتائج</td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-t border-gray-200">
        <p class="text-xs text-gray-400">
          عرض {{ paginatedCustomers.length ? startIndex + 1 : 0 }}-{{ endIndex }} <template v-if="totalCustomers !== null">من أصل {{ totalCustomers }}</template> سجل
        </p>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">عدد السجلات:</span>
          <select
            v-model="pageSize"
            class="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none cursor-pointer"
            @change="currentPage = 1"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronRight :size="14" />
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors"
            :class="
              p === currentPage ? 'bg-blue text-white' : 'text-gray-500 hover:bg-gray-100'
            "
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="isLoading || !!loadError || (totalCustomers === null ? paginatedCustomers.length < pageSize : currentPage >= totalPages)"
            @click="currentPage++"
          >
            <ChevronLeft :size="14" />
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="isDeleteDialogOpen"
      title="حذف العميل"
      :message="`هل أنت متأكد من حذف “${customerToDelete?.name}”؟`"
      confirm-text="حذف"
      cancel-text="إلغاء"
      @confirm="confirmDelete"
      @cancel="customerToDelete = null"
    />
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from '@lucide/vue'
  import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
  import { customersService } from '@/services/customers.service'
  import { usersService } from '@/services/users.service'
  import { customerDateRange } from '@/utils/customerDateRange'
  import { useNotification } from '@/composables/useNotification'

  const router = useRouter()
  const notification = useNotification()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')

  const defaultFilters = { date: '', status: '', city: '', agent: '', source: '' }
  const activeFilters = ref({ ...defaultFilters })

  const meta = ref({ sources: [], cities: [], agents: [], statuses: [], dateRanges: [
    { value: 'today', label: 'اليوم' },
    { value: 'yesterday', label: 'أمس' },
    { value: 'week', label: 'آخر 7 أيام' },
    { value: 'month', label: 'هذا الشهر' }
  ] })

  const filters = computed(() => [
    { key: 'source', label: 'المصدر', options: meta.value.sources },
    { key: 'agent', label: 'الموظف', options: meta.value.agents },
    { key: 'city', label: 'المدينة', options: meta.value.cities },
    { key: 'status', label: 'الحالة', options: meta.value.statuses },
    { key: 'date', label: 'التاريخ', options: meta.value.dateRanges }
  ])

  const isLoading = ref(true)
  const loadError = ref(null)
  const paginatedCustomers = ref([])
  const totalCustomers = ref(0)

  function queryParams() {
    return {
      q: searchQuery.value.trim() || undefined,
      sourceId: activeFilters.value.source || undefined,
      assignedTo: activeFilters.value.agent || undefined,
      city: activeFilters.value.city || undefined,
      callStatus: activeFilters.value.status || undefined,
      ...customerDateRange(activeFilters.value.date),
      page: currentPage.value,
      limit: pageSize.value
    }
  }

  let requestVersion = 0
  async function loadCustomers() {
    const version = ++requestVersion
    isLoading.value = true
    loadError.value = null
    try {
      const { items, total } = await customersService.getList(queryParams())
      if (version !== requestVersion) return
      paginatedCustomers.value = items
      totalCustomers.value = total
    } catch (err) {
      if (version !== requestVersion) return
      loadError.value = err
    } finally {
      if (version === requestVersion) isLoading.value = false
    }
  }

  async function loadMeta() {
    try {
      const result = await customersService.getMeta()
      meta.value.sources = result.sources
    } catch (error) {
      notification.error(error.message || 'تعذّر تحميل مصادر العملاء')
    }
  }

  let disposed = false
  const statusLabels = { interested: 'مهتم', not_interested: 'غير مهتم', no_answer: 'لا يرد', reschedule: 'إعادة جدولة' }
  async function loadCustomerFilterOptions() {
    const cities = new Set()
    const statuses = new Set()
    const agents = new Map()
    try {
      // Collect options across pages, independently of the current table filters.
      let previousSignature = null
      for (let page = 1; !disposed; page++) {
        const { items, total } = await customersService.getList({ page, limit: 100 })
        if (disposed) return
        const signature = JSON.stringify(items.map(item => item.id))
        if (items.length && signature === previousSignature) break
        previousSignature = signature
        for (const item of items) {
          if (typeof item.city === 'string' && item.city.trim()) cities.add(item.city)
          if (typeof item.callStatus === 'string' && item.callStatus) statuses.add(item.callStatus)
          const assigned = item.assignedTo
          const id = typeof assigned === 'string' ? assigned : assigned?.id ?? assigned?._id
          if (id) agents.set(id, assigned?.name || item.agent || id)
        }
        meta.value.cities = [...cities].sort((a, b) => a.localeCompare(b, 'ar'))
        meta.value.statuses = [...statuses].map(value => ({ value, label: statusLabels[value] || value }))
        const merged = new Map(meta.value.agents.map(item => [item.value, item.label]))
        for (const [id, name] of agents) if (!merged.has(id)) merged.set(id, name)
        meta.value.agents = [...merged].map(([value, label]) => ({ value, label }))
        if (items.length < 100 || (total !== null && page * 100 >= total)) break
      }
    } catch (error) {
      if (!disposed) notification.error(error.message || 'تعذّر تحميل خيارات فلترة العملاء')
    }
  }

  async function loadEmployeeOptions() {
    if (!permissions.can('employees.manage')) return
    try {
      let previousSignature = null
      for (let page = 1; !disposed; page++) {
        const response = await usersService.list({ page, limit: 100 })
        if (disposed) return
        const rows = Array.isArray(response) ? response : response?.data
        if (!Array.isArray(rows)) throw new Error('تعذّر قراءة قائمة الموظفين من استجابة السيرفر')
        const signature = JSON.stringify(rows.map(user => user.id ?? user._id))
        if (rows.length && signature === previousSignature) break
        previousSignature = signature
        const agents = new Map(meta.value.agents.map(item => [item.value, item.label]))
        for (const user of rows) {
          const id = user.id ?? user._id
          if (id && user.name) agents.set(id, user.name)
        }
        meta.value.agents = [...agents].map(([value, label]) => ({ value, label }))
        if (rows.length < 100) break
      }
    } catch (error) {
      if (!disposed) notification.error(error.message || 'تعذّر تحميل الموظفين')
    }
  }

  let searchDebounce = null
  watch([searchQuery, activeFilters, pageSize], () => {
    currentPage.value = 1
  }, { deep: true, flush: 'sync' })
  watch([searchQuery, activeFilters, currentPage, pageSize], (values, previous) => {
    clearTimeout(searchDebounce)
    ++requestVersion
    isLoading.value = true
    loadError.value = null
    searchDebounce = setTimeout(loadCustomers, values[0] !== previous[0] ? 700 : 0)
  }, { deep: true })

  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(searchDebounce)
    ++requestVersion
  })

  onMounted(() => {
    loadMeta()
    loadCustomers()
    loadCustomerFilterOptions()
    loadEmployeeOptions()
  })

  function handleEdit(customer) {
    router.push({ name: 'AddCustomer', query: { editId: customer.id } })
  }

  const isDeleteDialogOpen = ref(false)
  const customerToDelete = ref(null)
  const isDeleting = ref(false)

  function handleDelete(customer) {
    if (isDeleting.value) return
    customerToDelete.value = customer
    isDeleteDialogOpen.value = true
  }

  async function confirmDelete() {
    if (!customerToDelete.value || isDeleting.value) return
    isDeleting.value = true
    try {
      await customersService.remove(customerToDelete.value.id)
      notification.success('تم حذف العميل بنجاح')
      loadCustomers()
    } catch (err) {
      notification.error(err?.message || 'تعذر حذف العميل')
    } finally {
      customerToDelete.value = null
      isDeleting.value = false
    }
  }

  function sourceClass(source) {
    const map = {
      'جوجل أدز': 'bg-blue-light text-blue',
      'إعلانات جوجل': 'bg-blue-light text-blue',
      'وسائل التواصل': 'bg-emerald-50 text-emerald-600',
      'الاتصال المباشر': 'bg-amber-50 text-amber-600',
      'إعلانات تويتر': 'bg-sky-light text-blue-dark',
      'التسويق الخارجي': 'bg-violet-light text-violet',
      'إعلانات ميتا': 'bg-indigo-50 text-indigo-600',
      'مجتمع ميتا': 'bg-indigo-50 text-indigo-600',
      'تسويق الشبكات': 'bg-pink-50 text-pink-600'
    }
    return map[source] ?? 'bg-gray-100 text-gray-600'
  }

  const hasActiveFilter = computed(
    () =>
      searchQuery.value.trim() !== '' ||
      Object.keys(activeFilters.value).some(k => activeFilters.value[k] !== defaultFilters[k])
  )

  function clearFilters() {
    activeFilters.value = { ...defaultFilters }
    searchQuery.value = ''
    currentPage.value = 1
  }

  const totalPages = computed(() => totalCustomers.value === null ? currentPage.value : Math.max(1, Math.ceil(totalCustomers.value / pageSize.value)))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() => paginatedCustomers.value.length ? startIndex.value + paginatedCustomers.value.length : 0)
</script>
