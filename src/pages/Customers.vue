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
          <input
            ref="uploadInput"
            type="file"
            accept=".xlsx,.xls"
            class="hidden"
            @change="uploadCustomerFile"
          />
          <button
            v-if="permissions.can('customers.create')"
            type="button"
            :disabled="isUploadingFile"
            :aria-busy="isUploadingFile"
            @click="uploadInput?.click()"
            class="flex items-center gap-1.5 text-xs font-medium text-blue border border-blue bg-white rounded-lg sm:px-3 px-1 py-2 hover:bg-blue-light cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            {{ isUploadingFile ? 'جارٍ رفع الملف...' : 'تحميل الملف' }}
          </button>
          <button
            type="button"
            :disabled="isDownloadingTemplate || isLoading || !!loadError || !paginatedCustomers.length"
            :aria-busy="isDownloadingTemplate"
            @click="openCustomerExportDialog"
            class="flex items-center gap-1.5 text-xs font-medium text-blue bg-blue-light rounded-lg sm:px-3 px-1 py-2 hover:opacity-90 cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            {{ isDownloadingTemplate ? 'جارٍ التنزيل...' : 'تنزيل الملف' }}
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
          <input v-if="filter.key === 'city'" v-model.lazy.trim="activeFilters.city" list="customer-city-suggestions"
            @keydown.enter.prevent="activeFilters.city = $event.target.value.trim()"
            :aria-label="filter.label" placeholder="المدينة : الكل"
            title="اكتب اسم المدينة كاملًا ثم اضغط Enter أو انتقل إلى حقل آخر"
            class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400"
          />
          <select
            v-else
            v-model="activeFilters[filter.key]"
            :aria-label="filter.label"
            :aria-busy="filterLoading[filterGroup(filter.key)] || false"
            @focus="prepareFilter(filter.key)"
            @pointerdown="prepareFilter(filter.key)"
            class="appearance-none text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">{{ filter.label }} : الكل</option>
            <option v-if="filterLoading[filterGroup(filter.key)]" disabled>جارٍ تحميل الخيارات...</option>
            <option v-for="opt in filter.options" :key="opt.value ?? opt" :value="opt.value ?? opt">
              {{ opt.label ?? opt }}
            </option>
          </select>
          <datalist v-if="filter.key === 'city'" id="customer-city-suggestions">
            <option v-for="city in meta.cities" :key="city" :value="city" />
          </datalist>
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
                مسودة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="isLoading">
              <td colspan="10" class="text-center text-gray-400 py-8">...جارٍ التحميل</td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="10" class="text-center py-8">
                <p class="text-red-500 mb-2">
                  {{ loadError.message || 'تعذر تحميل بيانات العملاء' }}
                </p>
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
                    <span
                      class="block w-[104px] shrink-0 truncate font-medium text-gray-800 hover:text-indigo-600 hover:underline transition-colors"
                      :title="customer.name"
                      >{{ customer.name }}</span
                    >
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.phone }}</td>
                <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.email }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block w-32 truncate align-middle text-center px-2 py-0.5 rounded text-xs font-medium"
                    :style="sourceStyle(customer.sourceColor)"
                    :title="
                      meta.sources.find(source => source.value === customer.sourceId)?.label ||
                      customer.source ||
                      '—'
                    "
                  >
                    {{
                      meta.sources.find(source => source.value === customer.sourceId)?.label ||
                      customer.source ||
                      '—'
                    }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ customer.type }}</td>
                <td class="px-4 py-3 text-gray-500">{{ customer.city }}</td>
                <td class="px-4 py-3 text-gray-600">{{ customer.agent }}</td>
                <td class="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                  {{ customer.date }}
                </td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {{
                    customer.isDraft === true ? 'مسودة' : customer.isDraft === false ? 'مكتمل' : '—'
                  }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
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
                <td colspan="10" class="text-center text-gray-400 py-8">لا توجد نتائج</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        dir="rtl"
        class="flex items-center justify-between flex-wrap gap-4 px-5 py-5 border-t border-gray-100"
      >
        <p class="text-xs text-gray-400" aria-live="polite">
          عرض {{ paginatedCustomers.length ? startIndex + 1 : 0 }}-{{ endIndex }}
          <template v-if="totalCustomers !== null">من أصل {{ totalCustomers }}</template> سجل
        </p>
        <div class="flex items-center gap-4">
          <label for="customers-page-size" class="text-sm text-gray-400">عرض</label>
          <div class="relative">
          <select
            id="customers-page-size"
            v-model="pageSize"
            dir="ltr"
            class="appearance-none w-20 h-11 border border-gray-200 rounded-xl ps-3 pe-8 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue cursor-pointer"
            @change="currentPage = 1"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <ChevronDown :size="16" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-900" />
          </div>
        </div>
        <nav aria-label="صفحات العملاء" class="flex items-center gap-1">
          <button
            type="button"
            aria-label="الصفحة السابقة"
            class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="isLoading || currentPage === 1"
            @click="currentPage--"
          >
            <ChevronRight :size="18" />
          </button>
          <template v-for="p in visiblePages" :key="p">
          <span v-if="typeof p === 'string'" class="w-6 text-center text-gray-400" aria-hidden="true">…</span>
          <button v-else
            type="button"
            :aria-label="`الصفحة ${p}`"
            :aria-current="p === currentPage ? 'page' : undefined"
            :disabled="isLoading"
            class="w-9 h-9 flex items-center justify-center rounded-lg border text-sm cursor-pointer transition-colors disabled:cursor-not-allowed"
            :class="p === currentPage ? 'border-blue text-blue bg-white font-semibold' : 'border-transparent text-gray-900 hover:bg-gray-50'"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          </template>
          <button
            type="button"
            aria-label="الصفحة التالية"
            class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="
              isLoading ||
              !!loadError ||
              (totalCustomers === null
                ? paginatedCustomers.length < pageSize
                : currentPage >= totalPages)
            "
            @click="currentPage++"
          >
            <ChevronLeft :size="18" />
          </button>
        </nav>
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
      <div v-if="customerExportDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" @click.self="customerExportDialogOpen = false">
        <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
          <h2 class="mb-4 text-base font-bold text-gray-900">نطاق تصدير العملاء</h2>
          <div class="space-y-3 text-sm text-gray-700">
            <label class="flex items-center gap-2"><input v-model="customerExportScope" type="radio" value="all" /> تصدير جميع الصفحات ({{ totalPages }})</label>
            <label class="flex items-center gap-2"><input v-model="customerExportScope" type="radio" value="current" /> تصدير الصفحة الحالية ({{ currentPage }})</label>
            <label class="flex items-center gap-2"><input v-model="customerExportScope" type="radio" value="range" /> تصدير نطاق صفحات</label>
            <div v-if="customerExportScope === 'range'" class="grid grid-cols-2 gap-2">
              <input v-model.number="customerExportFrom" type="number" min="1" :max="totalPages" placeholder="من صفحة" class="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <input v-model.number="customerExportTo" type="number" min="1" :max="totalPages" placeholder="إلى صفحة" class="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <p v-if="customerExportError" class="text-xs text-red-500">{{ customerExportError }}</p>
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600" @click="customerExportDialogOpen = false">إلغاء</button>
            <button type="button" class="rounded-lg bg-gray-900 px-4 py-2 text-xs text-white" :disabled="isDownloadingTemplate" @click="confirmCustomerExport">تصدير</button>
          </div>
        </div>
      </div>
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
  import { normalizeCustomerSearch } from '@/utils/customerSearch'
  import { useNotification } from '@/composables/useNotification'
  import { downloadBlob } from '@/utils/downloadFile'

  const router = useRouter()
  const notification = useNotification()
  const uploadInput = ref(null)
  const isUploadingFile = ref(false)
  async function uploadCustomerFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isUploadingFile.value || !permissions.can('customers.create')) return
    if (!/\.(xlsx|xls)$/i.test(file.name) || !file.size) {
      notification.error('اختر ملف Excel غير فارغ')
      return
    }
    isUploadingFile.value = true
    try {
      const response = await customersService.uploadFile(file)
      notification.success(response?.message || 'تم رفع ملف العملاء بنجاح')
      await loadCustomers()
    } catch (error) {
      notification.error(error.message || 'تعذّر رفع ملف العملاء')
    } finally {
      isUploadingFile.value = false
    }
  }
  const isDownloadingTemplate = ref(false)
  const customerExportDialogOpen = ref(false)
  const customerExportScope = ref('all')
  const customerExportFrom = ref(1)
  const customerExportTo = ref(1)
  const customerExportError = ref('')
  function openCustomerExportDialog() {
    if (isDownloadingTemplate.value || isLoading.value || loadError.value || !paginatedCustomers.value.length) return
    customerExportScope.value = 'all'; customerExportFrom.value = currentPage.value; customerExportTo.value = currentPage.value; customerExportError.value = ''; customerExportDialogOpen.value = true
  }
  function confirmCustomerExport() {
    let from = 1; let to = totalPages.value
    if (customerExportScope.value === 'current') from = to = currentPage.value
    if (customerExportScope.value === 'range') {
      from = Number(customerExportFrom.value); to = Number(customerExportTo.value)
      if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > totalPages.value) { customerExportError.value = `النطاق يجب أن يكون بين 1 و${totalPages.value}`; return }
    }
    customerExportError.value = ''; customerExportDialogOpen.value = false; downloadTemplate(from, to)
  }
  async function downloadTemplate(fromPage = 1, toPage = totalPages.value) {
    if (isDownloadingTemplate.value) return
    isDownloadingTemplate.value = true
    try {
      const params = queryParams()
      const rows = []
      const seen = new Set()
      let fetched = 0
      for (let page = fromPage; page <= toPage; page++) {
        const result = page === currentPage.value
          ? { items: paginatedCustomers.value, total: totalCustomers.value }
          : await customersService.getList({ ...params, page, limit: pageSize.value })
        let added = 0
        for (const row of result.items) {
          if (row.id && seen.has(row.id)) continue
          if (row.id) seen.add(row.id)
          added++
          rows.push(row)
        }
        fetched += result.items.length
        if (!result.items.length || page >= toPage || (result.total !== null && fetched >= result.total)) break
        if (!added) throw new Error('تعذّر جلب جميع العملاء للتصدير')
        if (result.total === null && result.items.length < pageSize.value) break
      }
      if (!rows.length) {
        notification.error('لا توجد بيانات للتصدير')
        return
      }
      const { exportCustomers } = await import('@/utils/exportCustomers')
      const blob = await exportCustomers(rows)
      downloadBlob(blob, 'العملاء.xlsx')
    } catch (error) {
      notification.error(error.message || 'تعذّر تصدير العملاء')
    } finally {
      isDownloadingTemplate.value = false
    }
  }

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')

  const defaultFilters = { date: '', status: '', city: '', agent: '', source: '', isDraft: '' }
  const activeFilters = ref({ ...defaultFilters })

  const meta = ref({
    sources: [],
    cities: [],
    agents: [],
    statuses: [
      { value: 'new', label: 'عميل جديد' },
      { value: 'interested', label: 'مهتم' },
      { value: 'not_interested', label: 'غير مهتم' },
      { value: 'no_answer', label: 'لا يرد' },
      { value: 'reschedule', label: 'إعادة جدولة' }
    ],
    dateRanges: [
      { value: 'today', label: 'اليوم' },
      { value: 'yesterday', label: 'أمس' },
      { value: 'week', label: 'آخر 7 أيام' },
      { value: 'month', label: 'هذا الشهر' }
    ]
  })

  const filters = computed(() => [
    { key: 'source', label: 'المصدر', options: meta.value.sources },
    { key: 'agent', label: 'الموظف', options: meta.value.agents },
    { key: 'city', label: 'المدينة', options: meta.value.cities },
    { key: 'status', label: 'الحالة', options: meta.value.statuses },
    { key: 'date', label: 'التاريخ', options: meta.value.dateRanges },
    {
      key: 'isDraft',
      label: 'مسودة',
      options: [
        { value: 'true', label: 'مسودة' },
        { value: 'false', label: 'مكتمل' }
      ]
    }
  ])

  const isLoading = ref(true)
  const loadError = ref(null)
  const paginatedCustomers = ref([])
  const totalCustomers = ref(0)

  function queryParams() {
    return {
      q: normalizeCustomerSearch(searchQuery.value) || undefined,
      sourceId: activeFilters.value.source || undefined,
      assignedTo: activeFilters.value.agent || undefined,
      city: activeFilters.value.city || undefined,
      callStatus: activeFilters.value.status || undefined,
      isDraft:
        activeFilters.value.isDraft === '' ? undefined : activeFilters.value.isDraft === 'true',
      ...customerDateRange(activeFilters.value.date),
      page: currentPage.value,
      limit: pageSize.value
    }
  }

  let requestVersion = 0
  let listController = null
  let activeRequestKey = null
  let activeRequest = null
  function cancelCustomerRequest() {
    ++requestVersion
    listController?.abort()
    activeRequestKey = null
    activeRequest = null
  }
  async function loadCustomers() {
    clearTimeout(searchDebounce)
    const params = queryParams()
    const key = JSON.stringify(params)
    if (activeRequest && activeRequestKey === key) return activeRequest
    cancelCustomerRequest()
    const version = ++requestVersion
    const controller = new AbortController()
    listController = controller
    activeRequestKey = key
    isLoading.value = true
    loadError.value = null
    const task = (async () => {
    try {
      const { items, total } = await customersService.getList(params, { signal: controller.signal })
      if (version !== requestVersion) return
      if (total === null) throw new Error('استجابة العملاء لا تحتوي على إجمالي النتائج؛ يلزم meta.total لحساب الصفحات بدقة')
      const lastPage = Math.max(1, Math.ceil(total / params.limit))
      if (params.page > lastPage) { currentPage.value = lastPage; return }
      paginatedCustomers.value = items
      totalCustomers.value = total
      meta.value.cities = [...new Set(items.map(item => item.city).filter(Boolean))]
      if (!permissions.can('employees.manage')) {
        const agents = new Map(meta.value.agents.map(item => [item.value, item.label]))
        for (const item of items) {
          const assigned = item.assignedTo
          const id = typeof assigned === 'string' ? assigned : assigned?.id ?? assigned?._id
          if (id) agents.set(id, assigned?.name || item.agent || id)
        }
        meta.value.agents = [...agents].map(([value, label]) => ({ value, label }))
      }
    } catch (err) {
      if (version !== requestVersion || controller.signal.aborted || err.code === 'ERR_CANCELED') return
      loadError.value = err
      paginatedCustomers.value = []
      totalCustomers.value = null
    } finally {
      if (version === requestVersion) {
        isLoading.value = false
        activeRequest = null
        activeRequestKey = null
      }
    }
    })()
    activeRequest = task
    return task
  }

  async function loadMeta() {
    try {
      const result = await customersService.getMeta()
      meta.value.sources = result.sources
      return true
    } catch (error) {
      notification.error(error.message || 'تعذّر تحميل مصادر العملاء')
    }
  }
  let disposed = false
  const filterLoading = ref({})
  const loadedFilters = new Set()
  const pendingFilters = new Map()
  function filterGroup(key) {
    if (key === 'source') return 'sources'
    if (key === 'agent' && permissions.can('employees.manage')) return 'employees'
    return ''
  }
  function prepareFilter(key) {
    const group = filterGroup(key)
    if (!group || loadedFilters.has(group) || disposed) return
    if (pendingFilters.has(group)) return pendingFilters.get(group)
    filterLoading.value[group] = true
    const loader = { sources: loadMeta, employees: loadEmployeeOptions }[group]
    const task = loader().then(success => {
      if (success && !disposed) loadedFilters.add(group)
    }).finally(() => {
      filterLoading.value[group] = false
      pendingFilters.delete(group)
    })
    pendingFilters.set(group, task)
    return task
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
      return !disposed
    } catch (error) {
      if (!disposed) notification.error(error.message || 'تعذّر تحميل الموظفين')
    }
  }

  let searchDebounce = null
  watch(
    [searchQuery, activeFilters, pageSize],
    () => {
      currentPage.value = 1
    },
    { deep: true, flush: 'sync' }
  )
  watch(
    () => JSON.stringify(queryParams()),
    (key, previousKey) => {
      const params = JSON.parse(key)
      const previous = JSON.parse(previousKey)
      clearTimeout(searchDebounce)
      cancelCustomerRequest()
      isLoading.value = true
      loadError.value = null
      searchDebounce = setTimeout(loadCustomers, params.q !== previous.q ? 400 : 0)
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(searchDebounce)
    cancelCustomerRequest()
  })

  onMounted(() => {
    loadCustomers()
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

  function sourceStyle(value) {
    const color =
      typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : '#6b7280'
    const hex =
      color.length === 4 ? `#${[...color.slice(1)].map(char => char + char).join('')}` : color
    return { color: hex, backgroundColor: `${hex}14` }
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

  const totalPages = computed(() =>
    totalCustomers.value === null
      ? currentPage.value
      : Math.max(1, Math.ceil(totalCustomers.value / pageSize.value))
  )
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const visiblePages = computed(() => {
    const total = totalPages.value
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
    const start = Math.max(2, Math.min(currentPage.value - 1, total - 4))
    const end = Math.min(total - 1, Math.max(currentPage.value + 1, 5))
    const pages = [1]
    if (start > 2) pages.push('start-gap')
    for (let page = start; page <= end; page++) pages.push(page)
    if (end < total - 1) pages.push('end-gap')
    pages.push(total)
    return pages
  })
  const endIndex = computed(() =>
    paginatedCustomers.value.length ? startIndex.value + paginatedCustomers.value.length : 0
  )
</script>
