<template>
  <div class="call-history space-y-5" dir="rtl">
    <!-- Page Header -->
    <div class="md:flex md:space-y-0 space-y-3 items-start justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مركز الاتصالات</h1>
        <p class="text-xs text-gray-400 mt-1">
          قائمة مكالمات العملاء المخصصة لك اليوم – مرتبة تلقائياً حسب الأولوية
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 text-xs text-white bg-gray-900 rounded-lg px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
          @click="router.push({ name: 'Calls' })"
        >
          <ListChecks :size="14" />
          قائمة المكالمات
        </button>
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="router.push({ name: 'Customers' })"
        >
          <PhoneCall :size="14" />
          ملخص العملاء
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="history-panel bg-white rounded-2xl p-6 space-y-6">
    <div class="history-stats grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <button
        v-for="stat in stats"
        :key="stat.key"
        class="bg-gray-50 rounded-xl border p-4 text-start transition-colors cursor-pointer"
        :class="
          statusFilter === stat.key
            ? 'border-indigo-400 ring-2 ring-indigo-100'
            : 'border-transparent hover:border-gray-300'
        "
        @click="toggleStatusFilter(stat.key)"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2" :class="stat.iconBg">
          <component :is="stat.icon" :size="15" :class="stat.iconColor" />
        </div>
        <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-xs text-gray-400 mt-0.5 whitespace-nowrap truncate" :title="stat.label">{{ stat.label }}</p>
      </button>
    </div>

    <!-- Table Card -->
    <div class="history-table rounded-xl overflow-hidden">
      <!-- Toolbar: search + filters (rightmost in RTL) beside Excel/PDF export (leftmost) -->
      <div
        class="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 flex-wrap"
      >
        <div class="flex items-center gap-2 flex-wrap">
          <div class="relative flex-1 min-w-48">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث في الصفحة عن عميل، رقم هاتف، موظف..."
              class="w-full h-9 ps-3 pe-8 bg-muted border border-accent/50 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-secondary"
            />
            <Search
              :size="13"
              class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative shrink-0">
            <select
              v-model="typeFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">نوع المشروع : الكل</option>
              <option v-for="t in callTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative shrink-0">
            <select
              v-model="agentFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">الموظف : الكل</option>
              <option v-for="a in agentsList" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative shrink-0">
            <select
              v-model="statusFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">النتيجة : الكل</option>
              <option v-for="s in stats" :key="s.key" :value="s.key">{{ s.label }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            :disabled="isExporting || isLoading || !!loadError || !allCalls.length"
            @click="exportTable('excel')"
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet :size="14" />
            Excel
          </button>
          <button
            :disabled="isExporting || isLoading || !!loadError || !allCalls.length"
            @click="exportTable('pdf')"
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText :size="14" />
            PDF
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-gray-100 border-b border-gray-200">
            <tr>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                اسم العميل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                رقم الهاتف
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الموظف المسؤول
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                نوع المشروع
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                موعد الاتصال القادم
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                آخر تواصل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                مدة المكالمة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الحالة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                ملاحظات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="isLoading">
              <td colspan="9" class="text-center text-gray-400 py-8">...جارٍ التحميل</td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="9" class="text-center py-8">
                <p class="text-red-500 mb-2">{{ loadError.message || 'تعذر تحميل بيانات المكالمات' }}</p>
                <button
                  class="text-xs text-white bg-gray-900 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-700 transition-colors"
                  @click="loadCalls"
                >
                  إعادة المحاولة
                </button>
              </td>
            </tr>
            <template v-else>
            <tr
              v-for="call in filteredCalls"
              :key="call.id"
              class="hover:bg-gray-100 transition-colors"
            >
              <td class="px-4 py-3">
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  @click="call.leadId && router.push({ name: 'CustomerProfile', params: { id: call.leadId } })"
                >
                  <span
                    class="block max-w-40 truncate font-medium text-gray-800 whitespace-nowrap hover:text-indigo-600 hover:underline transition-colors"
                    >{{ call.name }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ call.phone }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ call.agent }}</td>
              <td class="px-4 py-3">
                <span class="font-medium whitespace-nowrap" :class="typeClass(call.type)">{{
                  call.type
                }}</span>
              </td>
              <td class="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                {{ call.date }}
              </td>
              <td class="px-4 py-3 tabular-nums text-gray-500 whitespace-nowrap">{{ call.lastContact }}</td>
              <td class="px-4 py-3 tabular-nums text-gray-500" dir="ltr">{{ formatDuration(call.durationSec) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="statusClass(call.status)"
                >
                  {{ call.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500 max-w-55 truncate" :title="call.note">
                {{ call.note }}
              </td>
            </tr>

            <tr v-if="filteredCalls.length === 0">
              <td colspan="9" class="text-center text-gray-400 py-8">لا توجد نتائج</td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-t border-gray-200">
        <p class="text-xs text-gray-400">
          عرض {{ filteredCalls.length === 0 ? 0 : startIndex + 1 }}-{{ endIndex }} من أصل
          {{ totalCalls }} مكالمة
        </p>
        <div class="flex items-center gap-1">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronRight :size="14" />
          </button>
          <template v-for="p in visiblePages" :key="p">
          <span v-if="typeof p === 'string'" class="w-6 text-center text-gray-400" aria-hidden="true">…</span>
          <button v-else
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors"
            :class="
              p === currentPage ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            "
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          </template>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <ChevronLeft :size="14" />
          </button>
        </div>
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
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ListChecks,
    FileSpreadsheet,
    FileText,
    Calendar,
    CalendarClock,
    RefreshCw,
    PhoneOff,
    XCircle,
    CheckCircle2,
    Star,
    ThumbsDown,
    PhoneCall
  } from '@lucide/vue'
  import { callsService } from '@/services/calls.service'
  import { dashboardService } from '@/services/dashboard.service'
  import { lookupsService } from '@/services/lookups.service'
  import { usersService } from '@/services/users.service'
  import { downloadBlob } from '@/utils/downloadFile'
  import { useNotification } from '@/composables/useNotification'

  const notification = useNotification()
  const isExporting = ref(false)
  async function exportTable(format) {
    if (isExporting.value || isLoading.value || loadError.value || !allCalls.value.length) return
    isExporting.value = true
    const rows = allCalls.value.map(call => [call.name, call.phone, call.agent, call.type, call.date, call.lastContact, formatDuration(call.durationSec), call.status, call.note])
    try {
      const { exportCallsExcel, exportCallsPdf } = await import('@/utils/exportCalls')
      const blob = await (format === 'excel' ? exportCallsExcel(rows) : exportCallsPdf(rows))
      downloadBlob(blob, `سجل_المكالمات.${format === 'excel' ? 'xlsx' : 'pdf'}`)
    } catch (error) {
      notification.error(error.message || 'تعذّر تصدير سجل المكالمات')
    } finally {
      isExporting.value = false
    }
  }

  const router = useRouter()

  const searchQuery = ref('')
  const typeFilter = ref('')
  const agentFilter = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const callTypes = ref([])

  function resetToDefaultView() {
    searchQuery.value = ''
    typeFilter.value = ''
    agentFilter.value = ''
    statusFilter.value = ''
    currentPage.value = 1
  }

  const isLoading = ref(true)
  const loadError = ref(null)
  const allCalls = ref([])
  const serverTotal = ref(null)
  const totalCalls = computed(() => serverTotal.value === null ? matchingCalls.value.length : serverTotal.value)
  const agentsList = ref([])
  const rawStats = ref([])
  function formatDuration(seconds) {
    if (seconds == null || seconds === '' || !Number.isFinite(Number(seconds))) return '—'
    const value = Math.max(0, Math.floor(Number(seconds)))
    return `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  }

  /*
   * أيقونات وألوان كل حالة عبارة عن إعدادات عرض ثابتة في الواجهة،
   * أما القيم (label/value) فتأتي من الـ API عبر rawStats.
   */
    const statIconConfig = {
    '': { icon: PhoneCall, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    interested: { icon: Star, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    not_interested: { icon: ThumbsDown, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    no_answer: { icon: PhoneOff, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    reschedule: { icon: CalendarClock, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    visit: { icon: Calendar, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' }
  }

  const stats = computed(() =>
    (rawStats.value.length ? rawStats.value : [
      { key: '', label: 'إجمالي المكالمات', value: 0 },
      { key: 'interested', label: 'مهتم', value: 0 },
      { key: 'not_interested', label: 'غير مهتم', value: 0 },
      { key: 'no_answer', label: 'لا يرد', value: 0 },
      { key: 'reschedule', label: 'إعادة الجدولة', value: 0 },
      { key: 'visit', label: 'زيارة مجدولة', value: 0 }
    ]).map(s => ({
      ...s,
      ...(statIconConfig[s.key] ?? { icon: PhoneCall, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' })
    }))
  )

  function toggleStatusFilter(key) {
    if (key === 'visit') return
    statusFilter.value = statusFilter.value === key ? '' : key
    currentPage.value = 1
  }

  const matchingCalls = computed(() => allCalls.value.filter(call => {
    const query = searchQuery.value.trim().toLocaleLowerCase()
    return (!query || [call.name, call.phone, call.agent].some(value => String(value ?? '').toLocaleLowerCase().includes(query)))
      && (!typeFilter.value || call.type === typeFilter.value)
      && (!agentFilter.value || call.assignedTo === agentFilter.value || call.agent === agentFilter.value)
      && (!statusFilter.value || call.callStatus === statusFilter.value)
  }))
  const filteredCalls = computed(() => matchingCalls.value)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCalls.value / pageSize.value)))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() => allCalls.value.length ? startIndex.value + allCalls.value.length : 0)
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

  let loadVersion = 0
  let loadController = null
  async function loadCalls() {
    loadController?.abort()
    const controller = new AbortController()
    loadController = controller
    const version = ++loadVersion
    isLoading.value = true
    loadError.value = null
    try {
      const response = await callsService.getList({
        signal: controller.signal,
        page: currentPage.value,
        limit: pageSize.value,
        q: searchQuery.value,
        status: statusFilter.value,
        type: typeFilter.value,
        userId: agentFilter.value,
      })
      if (version !== loadVersion) return
      const items = response.items
      const lastPage = Math.max(1, Math.ceil(response.total / pageSize.value))
      if (currentPage.value > lastPage) {
        currentPage.value = lastPage
        return
      }
      allCalls.value = items.map(call => ({ ...call,
        type: call.projectType || '—',
        status: call.lastResult || call.status,
        date: call.nextCallAt && Number.isFinite(Date.parse(call.nextCallAt))
          ? new Date(call.nextCallAt).toLocaleString('ar', { calendar: 'gregory', dateStyle: 'short', timeStyle: 'short' }) : '—',
        note: call.notes ?? call.note,
      }))
      serverTotal.value = response.total
    } catch (err) {
      if (version !== loadVersion || controller.signal.aborted || err.code === 'ERR_CANCELED') return
      loadError.value = err
    } finally {
      if (version === loadVersion) {
        isLoading.value = false
        loadController = null
      }
    }
  }

  let reloadTimer = null
  function scheduleLoad() {
    clearTimeout(reloadTimer)
    reloadTimer = setTimeout(loadCalls, searchQuery.value.trim() ? 350 : 0)
  }
  watch([searchQuery, typeFilter, agentFilter, statusFilter, pageSize], () => {
    currentPage.value = 1
    scheduleLoad()
  })
  watch(currentPage, (page, previous) => {
    if (page !== previous) scheduleLoad()
  })
  onUnmounted(() => {
    ++loadVersion
    loadController?.abort()
  })
  onMounted(() => {
    loadCalls()
    Promise.allSettled([
      dashboardService.getOverview().then(result => {
        const byOutcome = result.today?.byOutcome ?? {}
        rawStats.value = [
          { key: '', label: 'إجمالي المكالمات', value: result.today?.totalCalls ?? 0 },
          { key: 'interested', label: 'مهتم', value: byOutcome.interested ?? 0 },
          { key: 'not_interested', label: 'غير مهتم', value: byOutcome.not_interested ?? 0 },
          { key: 'no_answer', label: 'لا يرد', value: byOutcome.no_answer ?? 0 },
          { key: 'reschedule', label: 'إعادة الجدولة', value: result.rescheduleDueToday ?? byOutcome.reschedule ?? 0 },
          { key: 'visit', label: 'زيارة مجدولة', value: result.today?.visits ?? 0 },
        ]
      }).catch(error => { loadError.value ??= error }),
      callsService.getRescheduled().then(items => {
        const count = Array.isArray(items) ? items.length : 0
        const current = rawStats.value.find(item => item.key === 'reschedule')
        if (current) current.value = count
      }).catch(() => {}),
      lookupsService.get().then(result => {
        const types = result.types.map(item => typeof item === 'string' ? item : item.name ?? item.label ?? item.value).filter(Boolean)
        if (types.length) callTypes.value = types
      }).catch(() => {}),
      usersService.list({ role: 'call_center', page: 1, limit: 100 }).then(response => {
        const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
        agentsList.value = rows.map(row => ({ id: row.id ?? row._id, name: row.name ?? row.fullName ?? row.email })).filter(row => row.id && row.name)
      }).catch(() => {})
    ])
  })

  function typeClass(type) {
    return type === 'وارد' ? 'text-emerald-600' : 'text-indigo-600'
  }

  function statusClass(status) {
    const map = {
      'زيارة مجدولة': 'bg-sky-50 text-sky-600',
      'إعادة الجدولة': 'bg-indigo-50 text-indigo-600',
      'لا يرد': 'bg-gray-100 text-gray-500',
      'غير مهتم': 'bg-red-50 text-red-500',
      مهتم: 'bg-emerald-50 text-emerald-600',
      'عميل جديد': 'bg-blue-50 text-blue-600',
      'قيد المعالجة': 'bg-amber-50 text-amber-600',
      'تم التحويل': 'bg-emerald-50 text-emerald-600',
      محتمل: 'bg-teal-50 text-teal-600'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }
</script>

<style scoped>
.call-history > div:first-child h1 { font-size: 18px; }
.call-history > div:first-child button { min-height: 40px; border: 0; border-radius: 8px; padding-inline: 24px; }
.call-history > div:first-child button:first-child { background: #4097f4; color: white; }
.call-history > div:first-child button:last-child { background: #edf6ff; color: #4097f4; }
.history-stats > button { background: white; border: 1px solid #dbeafe; border-radius: 14px; padding: 18px; min-height: 180px; }
.history-stats > button > div { width: 48px; height: 48px; margin-bottom: 20px; }
.history-stats > button > p:first-of-type { font-size: 24px; }
.history-stats > button > p:last-child { font-size: 14px; color: #222; }
.history-table > div:first-child { padding: 0 0 20px; border: 0; }
.history-table input[type='text'] { background: white; min-width: 240px; }
.history-table > div:first-child > div:last-child button { border: 1px solid #00a478; color: #00a478; min-width: 80px; }
.history-table > div:first-child > div:last-child button:first-child { background: #009c76; color: white; }
.history-table thead { background: white; }
.history-table th, .history-table td { font-size: 12px; padding: 12px 10px; }
.history-table td span { border-radius: 4px; }
.history-table input[type='checkbox'] { accent-color: #4097f4; cursor: pointer; }
@media (max-width: 640px) { .history-panel { padding: 16px; } .history-stats > button { padding: 14px; min-height: 150px; } }
</style>
