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
    <div class="history-stats grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
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
        <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
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
              <option value="">النوع : الكل</option>
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
              <option v-for="a in agentsList" :key="a" :value="a">{{ a }}</option>
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
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isExportingExcel || !filteredCalls.length"
            @click="handleExportExcel"
          >
            <FileSpreadsheet :size="14" />
            Excel
          </button>
          <button
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isExportingPdf || !filteredCalls.length"
            @click="handleExportPdf"
          >
            <FileText :size="14" />
            PDF
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table ref="tableElement" class="w-full text-xs">
          <thead class="bg-gray-100 border-b border-gray-200">
            <tr>
              <th class="px-3"><input type="checkbox" aria-label="تحديد جميع مكالمات الصفحة" :checked="allSelected" @change="toggleAll($event.target.checked)" /></th>
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
                النوع
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                التاريخ
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                وقت الحديث
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
              <td colspan="10" class="text-center text-gray-400 py-8">...جارٍ التحميل</td>
            </tr>
            <tr v-else-if="loadError">
              <td colspan="10" class="text-center py-8">
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
              <td class="px-3"><input type="checkbox" v-model="selectedIds" :value="call.id" :aria-label="`تحديد ${call.name}`" /></td>
              <td class="px-4 py-3">
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  @click="call.leadId && router.push({ name: 'CustomerProfile', params: { id: call.leadId } })"
                >
                  <span
                    class="font-medium text-gray-800 whitespace-nowrap hover:text-indigo-600 hover:underline transition-colors"
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
              <td class="px-4 py-3 tabular-nums text-gray-500" dir="ltr">{{ formatDuration(call.talkDurationSec) }}</td>
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
              <td colspan="10" class="text-center text-gray-400 py-8">لا توجد نتائج</td>
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
          <button
            v-for="p in totalPages"
            :key="p"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors"
            :class="
              p === currentPage ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            "
            @click="currentPage = p"
          >
            {{ p }}
          </button>
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
    RefreshCw,
    PhoneOff,
    XCircle,
    CheckCircle2,
    PhoneCall
  } from '@lucide/vue'
  import { callsService } from '@/services/calls.service'
  import { downloadBlob } from '@/utils/downloadFile'
  import { useNotification } from '@/composables/useNotification'

  const router = useRouter()
  const notification = useNotification()

  const searchQuery = ref('')
  const typeFilter = ref('')
  const agentFilter = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const callTypes = ['وارد', 'صادر']

  function resetToDefaultView() {
    searchQuery.value = ''
    typeFilter.value = ''
    agentFilter.value = ''
    statusFilter.value = ''
    currentPage.value = 1
  }

  const isLoading = ref(true)
  const loadError = ref(null)
  const paginatedCalls = ref([])
  const totalCalls = ref(0)
  const agentsList = ref([])
  const rawStats = ref([])
  const selectedIds = ref([])
  const tableElement = ref(null)
  const allSelected = computed(() => filteredCalls.value.length > 0 && filteredCalls.value.every(call => selectedIds.value.includes(call.id)))
  function toggleAll(checked) { selectedIds.value = checked ? filteredCalls.value.map(call => call.id) : [] }
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
    '': { icon: PhoneCall, iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
    'زيارة مجدولة': { icon: Calendar, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    'إعادة جدولة': { icon: RefreshCw, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    'لا يرد': { icon: PhoneOff, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    'غير مهتم': { icon: XCircle, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    مهتم: { icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' }
  }

  const stats = computed(() =>
    (rawStats.value.length ? rawStats.value : [
      { key: '', label: 'إجمالي المكالمات', value: '—' },
      { key: 'مهتم', label: 'مهتم', value: '—' },
      { key: 'غير مهتم', label: 'غير مهتم', value: '—' },
      { key: 'لا يرد', label: 'لا يرد', value: '—' },
      { key: 'إعادة جدولة', label: 'إعادة الجدولة', value: '—' },
      { key: 'زيارة مجدولة', label: 'زيارة مجدولة', value: '—' }
    ]).map(s => ({
      ...s,
      ...(statIconConfig[s.key] ?? { icon: PhoneCall, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' })
    }))
  )

  function toggleStatusFilter(key) {
    statusFilter.value = statusFilter.value === key ? '' : key
    currentPage.value = 1
  }

  const filteredCalls = computed(() => paginatedCalls.value.filter(call => {
    const query = searchQuery.value.trim().toLocaleLowerCase()
    return (!query || [call.name, call.phone, call.agent].some(value => String(value ?? '').toLocaleLowerCase().includes(query)))
      && (!typeFilter.value || call.type === typeFilter.value)
      && (!agentFilter.value || call.agent === agentFilter.value)
      && (!statusFilter.value || call.status === statusFilter.value)
  }))

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCalls.value / pageSize.value)))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, totalCalls.value))

  function queryParams() {
    return {
      search: searchQuery.value.trim() || undefined,
      type: typeFilter.value || undefined,
      agent: agentFilter.value || undefined,
      status: statusFilter.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    }
  }

  let loadVersion = 0
  async function loadCalls() {
    const version = ++loadVersion
    isLoading.value = true
    loadError.value = null
    try {
      const { items, total, stats: statsData } = await callsService.getList({ page: currentPage.value, limit: pageSize.value })
      if (version !== loadVersion) return
      paginatedCalls.value = items
      totalCalls.value = total
      rawStats.value = Array.isArray(statsData) ? statsData : []
      agentsList.value = [...new Set(items.map(call => call.agent).filter(Boolean))]
      selectedIds.value = []
    } catch (err) {
      if (version !== loadVersion) return
      loadError.value = err
    } finally {
      if (version === loadVersion) isLoading.value = false
    }
  }

  watch([currentPage, pageSize], loadCalls)
  onUnmounted(() => { ++loadVersion })
  watch(pageSize, () => {
    currentPage.value = 1
  })

  onMounted(loadCalls)

  const isExportingExcel = ref(false)
  const isExportingPdf = ref(false)

  async function handleExportExcel() {
    if (isExportingExcel.value) return
    isExportingExcel.value = true
    try {
      const { default: ExcelJS } = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('المكالمات', { views: [{ rightToLeft: true }] })
      sheet.addRow(['اسم العميل', 'رقم الهاتف', 'الموظف المسؤول', 'النوع', 'التاريخ', 'وقت الحديث', 'مدة المكالمة', 'الحالة', 'ملاحظات'])
      const rows = selectedIds.value.length ? filteredCalls.value.filter(call => selectedIds.value.includes(call.id)) : filteredCalls.value
      rows.forEach(call => sheet.addRow([call.name, call.phone, call.agent, call.type, call.date, formatDuration(call.talkDurationSec), formatDuration(call.durationSec), call.status, call.note]))
      sheet.columns.forEach(column => { column.width = 22 })
      downloadBlob(new Blob([await workbook.xlsx.writeBuffer()]), 'سجل_المكالمات.xlsx')
    } catch (err) {
      notification.error(err?.message || 'تعذر تصدير الملف')
    } finally {
      isExportingExcel.value = false
    }
  }

  async function handleExportPdf() {
    if (isExportingPdf.value) return
    isExportingPdf.value = true
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
      const canvas = await html2canvas(tableElement.value, { scale: 2, backgroundColor: '#ffffff' })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const width = 277
      const height = canvas.height * width / canvas.width
      let offset = 0
      while (offset < height) {
        if (offset) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10 - offset, width, height)
        offset += 190
      }
      pdf.save('سجل_المكالمات.pdf')
    } catch (err) {
      notification.error(err?.message || 'تعذر تصدير الملف')
    } finally {
      isExportingPdf.value = false
    }
  }

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
.history-stats > button { background: white; border: 1px solid #dbeafe; border-radius: 14px; padding: 22px; min-height: 180px; }
.history-stats > button > div { width: 48px; height: 48px; margin-bottom: 20px; }
.history-stats > button > p:first-of-type { font-size: 24px; }
.history-stats > button > p:last-child { font-size: 16px; color: #222; }
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
