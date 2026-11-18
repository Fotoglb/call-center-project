<template>
  <div ref="reportRoot" class="min-w-0 space-y-5 overflow-x-hidden" dir="rtl">
    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">التقارير والتحليلات</h1>

        <p class="mt-1 text-xs text-gray-400">تقرير مفصل قابل للتصدير والفلترة</p>
      </div>

      <!-- Export Actions -->
      <div v-if="!isExportingPdf" class="flex flex-wrap items-center justify-end gap-2">
        <div ref="shareMenuRef" class="relative">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue px-4 py-2 text-xs font-medium text-blue transition-colors hover:bg-blue-light disabled:cursor-not-allowed disabled:opacity-60"
            :aria-label="shareButtonLabel"
            :aria-busy="isShareBusy"
            :disabled="isShareBusy || isExportingPdf"
            @click="shareReport"
          >
            <Loader2 v-if="isShareBusy" :size="14" class="animate-spin" />
            <Share2 v-else :size="14" />
            {{ shareButtonLabel }}
          </button>

          <div
            v-if="isFallbackMenuOpen"
            class="absolute start-0 top-full z-30 mt-2 space-y-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-8 py-2 text-start text-xs text-gray-600 transition-colors hover:bg-gray-50"
              @click="downloadReport"
            >
              <Download :size="14" />
              تنزيل PDF
            </button>
          </div>
        </div>

        <button
          type="button"
          class="cursor-pointer rounded-lg bg-blue px-8 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isExportingPdf || isShareBusy"
          @click="onExportPdfClick"
        >
          {{ isExportingPdf ? '...جاري التجهيز' : 'PDF' }}
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-lg bg-blue-dark px-8 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isExportingExcel"
          @click="exportExcel"
        >
          <span v-if="isExportingExcel" class="flex items-center gap-1.5">
            <Loader2 :size="14" class="animate-spin" />
            ...جاري التصدير
          </span>

          <span v-else>Excel</span>
        </button>
      </div>
    </div>

    <!-- Filters and Period -->
    <div v-if="!isExportingPdf" class="flex flex-wrap items-center justify-between gap-3">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Date Range -->
        <div ref="dateRangeRef" class="relative">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            @click="showDatePicker = !showDatePicker"
          >
            <CalendarRange :size="14" />

            <span dir="ltr">
              {{ dateRangeLabel }}
            </span>

            <ChevronDown :size="12" />
          </button>

          <div
            v-if="showDatePicker"
            class="absolute start-0 top-full z-30 mt-2 w-52 space-y-2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
          >
            <div>
              <label class="mb-1 block text-xs text-gray-500"> من تاريخ </label>

              <input
                v-model="dateFrom"
                type="date"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-gray-500"> إلى تاريخ </label>

              <input
                v-model="dateTo"
                type="date"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              class="w-full cursor-pointer rounded-lg bg-gray-900 py-1.5 text-xs text-white transition-colors hover:bg-gray-700"
              @click="showDatePicker = false"
            >
              تطبيق
            </button>
          </div>
        </div>

        <!-- Employee Filter -->
        <div class="relative">
          <select
            v-model="agentFilter"
            :aria-busy="employeesLoading"
            class="w-60 max-w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pe-7 ps-3 text-xs text-gray-600 hover:border-gray-300 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">جميع الموظفين</option>
            <option v-if="employeesLoading" disabled>جارٍ تحميل الموظفين...</option>
            <option v-else-if="!employees.length" disabled>{{ employeesError ? 'تعذّر تحميل الموظفين' : 'لا يوجد موظفون' }}</option>

            <option
              v-for="employee in employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }}
            </option>
          </select>

          <ChevronDown
            :size="12"
            class="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <!-- Source Filter -->
        <div class="relative">
          <select
            v-model="sourceFilter"
            class="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pe-7 ps-3 text-xs text-gray-600 hover:border-gray-300 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">جميع المصادر</option>

            <option v-for="source in sourceLegend" :key="source.label" :value="source.label">
              {{ source.label }}
            </option>
          </select>

          <ChevronDown
            :size="12"
            class="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <!-- Period Tabs -->
      <div class="flex shrink-0 items-center gap-2.5 rounded-lg border border-blue bg-blue/10 p-1">
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'daily'
              ? 'bg-white text-blue-dark shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'daily'"
        >
          يومي
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'weekly'
              ? 'bg-white text-blue-dark shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'weekly'"
        >
          أسبوعي
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'monthly'
              ? 'bg-white text-blue-dark shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'monthly'"
        >
          شهري
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div
        v-for="stat in displayedStats"
        :key="stat.label"
        class="min-w-0 space-y-1 rounded-xl bg-gray-50 p-4"
      >
        <p class="text-2xl font-bold text-gray-900">
          {{ stat.value }}
        </p>

        <p class="text-xs text-gray-500">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <!-- Main Charts -->
    <div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-4">
      <!-- Conversion Trend -->
      <div class="min-w-0 overflow-hidden rounded-2xl bg-gray-50 sm:p-5 p-2 xl:col-span-3">
        <!-- Header like Figma -->
        <div class="mb-5 flex flex-wrap items-start justify-between gap-x-8 gap-y-4" dir="rtl">
          <!-- Title on the right -->
          <div class="shrink-0">
            <h3 class="text-base font-semibold text-gray-900">معدل التحويل – الاتجاه الزمني</h3>

            <p class="mt-1 text-sm text-gray-400">نسبة العملاء الجدد والتحويلات حسب اليوم</p>
          </div>

          <!-- Legend on the left -->
          <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600" dir="ltr">
            <span class="flex items-center gap-2 whitespace-nowrap" dir="rtl">
              <span class="h-1 w-7 rounded-full bg-indigo-500"></span>
              الزيارات
            </span>

            <span class="flex items-center gap-2 whitespace-nowrap" dir="rtl">
              <span class="h-1 w-7 rounded-full bg-purple-400"></span>
              المكالمات
            </span>

            <span class="flex items-center gap-2 whitespace-nowrap" dir="rtl">
              <span class="h-1 w-7 rounded-full bg-pink-400"></span>
              عملاء جدد
            </span>
          </div>
        </div>

        <!-- Chart -->
        <div class="chart-container relative h-[250px] w-full min-w-0" dir="ltr">
          <Line v-if="hasChartData(conversionTrendData)" ref="conversionChartRef" :data="conversionTrendData" :options="lineOptions" />
          <p v-else class="flex h-full items-center justify-center text-xs text-gray-400" dir="rtl" role="status">{{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}</p>
        </div>
      </div>

      <!-- Sources Doughnut -->
      <div class="min-w-0 overflow-hidden rounded-2xl bg-gray-50 p-5 xl:col-span-1">
        <h3 class="text-sm font-semibold text-gray-900">توزيع مصادر العملاء</h3>

        <p class="mb-4 mt-1 text-xs text-gray-400">هذا الشهر</p>

        <div class="flex min-w-0 flex-col items-center gap-4">
          <div class="relative h-32 w-32 shrink-0">
            <Doughnut v-if="hasChartData(sourceChartData)" ref="sourceChartRef" :data="sourceChartData" :options="donutOptions" />
          <p v-else class="flex h-full items-center justify-center text-xs text-gray-400" dir="rtl" role="status">{{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}</p>
          </div>

          <ul class="w-full min-w-0 space-y-3 text-xs">
            <li
              v-for="item in sourceLegend"
              :key="item.label"
              class="flex min-w-0 items-center justify-between gap-2"
            >
              <span class="flex items-center gap-1.5">
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: item.color }"
                ></span>

                <span class="whitespace-nowrap">
                  {{ item.label }}
                </span>
              </span>

              <span class="shrink-0 font-medium text-gray-500"> {{ item.percent }}% </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Secondary Charts -->
    <div class="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
      <!-- Employee Performance Chart -->
      <div class="min-w-0 overflow-hidden rounded-2xl bg-gray-50 p-5">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">أداء الموظفين</h3>

            <p class="mt-1 text-xs text-gray-400">مقارنة المكالمات والعملاء الجدد</p>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500" dir="ltr">
            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
              المكالمات
            </span>

            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              عملاء جدد
            </span>
          </div>
        </div>

        <div class="chart-container relative h-52 w-full min-w-0" dir="ltr">
          <Bar v-if="hasChartData(employeeTrendData)" ref="employeeChartRef" :data="employeeTrendData" :options="barOptions" />
          <p v-else class="flex h-full items-center justify-center text-xs text-gray-400" dir="rtl" role="status">{{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}</p>
        </div>
      </div>

      <!-- Visit Success -->
      <div class="min-w-0 overflow-hidden rounded-2xl bg-gray-50 p-5">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">معدل نجاح الزيارات</h3>

            <p class="mt-1 text-xs text-gray-400">نسبة الزيارات الناجحة لكل يوم</p>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500" dir="ltr">
            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-2 w-2 rounded-full bg-teal-500"></span>
              الزيارات
            </span>

            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-2 w-2 rounded-full bg-amber-400"></span>
              عملاء جدد
            </span>
          </div>
        </div>

        <div class="chart-container relative h-52 w-full min-w-0" dir="ltr">
          <Bar v-if="hasChartData(visitSuccessData)" ref="visitChartRef" :data="visitSuccessData" :options="barOptions" />
          <p v-else class="flex h-full items-center justify-center text-xs text-gray-400" dir="rtl" role="status">{{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}</p>
        </div>
      </div>
    </div>

    <!-- Employee Performance Table -->
    <div class="min-w-0 overflow-hidden rounded-2xl bg-gray-50">
      <div class="border-b border-gray-200 px-5 py-4">
        <h3 class="text-sm font-semibold text-gray-900">تقرير الأداء الوظيفي</h3>

        <p class="mt-0.5 text-xs text-gray-400">مقارنة شاملة لجميع الموظفين خلال هذا الأسبوع</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-262.5 text-xs">
          <thead class="border-b border-gray-200 bg-gray-100">
            <tr>
              <th v-if="!isExportingPdf" class="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  class="cursor-pointer"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                />
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                الموظف
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                عدد المكالمات
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                عملاء جدد
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                التحويلات
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                معدل التحويل
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                الزيارات
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                نجاح الزيارات
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                نقاط الأداء
              </th>

              <th class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500">
                الأداء
              </th>

              <th v-if="!isExportingPdf" class="w-16 px-4 py-3"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr v-if="!employeeRows.length"><td :colspan="isExportingPdf ? 10 : 12" class="px-4 py-8 text-center text-xs text-gray-400" role="status">لا يوجد بيانات</td></tr>
            <tr
              v-for="employee in employeeRows"
              :key="employee.id"
              class="transition-colors hover:bg-gray-100"
            >
              <td v-if="!isExportingPdf" class="px-4 py-3">
                <input
                  type="checkbox"
                  class="cursor-pointer"
                  :checked="selectedEmployees.includes(employee.id)"
                  @change="toggleEmployee(employee.id)"
                />
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap font-medium text-gray-800">
                    {{ employee.name }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.calls ?? '—' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.newCustomers ?? '—' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.conversions ?? '—' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.conversionRate == null ? '—' : `${employee.conversionRate}%` }}</td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.visits ?? '—' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.visitSuccessRate == null ? '—' : `${employee.visitSuccessRate}%` }}</td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.score ?? '—' }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium"
                  :class="performanceClass(employee.performance)"
                >
                  {{ employee.performance ?? '—' }}
                </span>
              </td>

              <td v-if="!isExportingPdf" class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    title="إعادة تعيين كلمة المرور"
                    :aria-label="`إعادة تعيين كلمة مرور ${employee.name}`"
                    :disabled="employeeBusy || !employee.id"
                    v-if="permissions.can('employees.manage')"
                    @click="resetEmployeePassword(employee)"
                    class="cursor-pointer text-gray-400 transition-colors hover:text-indigo-500"
                  >
                    <Pencil :size="14" />
                  </button>

                  <button
                    type="button"
                    title="تعطيل الموظف"
                    :aria-label="`تعطيل الموظف ${employee.name}`"
                    :disabled="employeeBusy || !employee.id || employee.status === 'inactive'"
                    v-if="permissions.can('employees.manage')"
                    @click="deactivateEmployee(employee)"
                    class="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { useEmployees } from '@/composables/useEmployees'
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

  import { Bar, Doughnut, Line } from 'vue-chartjs'

  import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
  } from 'chart.js'

  import {
    CalendarRange,
    ChevronDown,
    Download,
    Loader2,
    Pencil,
    Share2,
    Trash2
  } from '@lucide/vue'
  import ExcelJS from 'exceljs'

  import { useNotification } from '@/composables/useNotification'
  import { useReportShare } from '@/composables/useReportShare'
  import { generateReportPdfBlob } from '@/services/reportPdf.service'
  import { buildPdfFileName } from '@/utils/fileName'
  import { reportsService } from '@/services/reports.service'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
  )

  /* ----------------------------------------
   * Filters
   * -------------------------------------- */

  const period = ref('daily')
  const agentFilter = ref('')
  const sourceFilter = ref('')
  const isLoading = ref(true)


  const periodLabels = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري'
  }

  const periodLabel = computed(() => periodLabels[period.value] ?? period.value)

  /* ----------------------------------------
   * Date range
   * -------------------------------------- */

  const showDatePicker = ref(false)
  const dateRangeRef = ref(null)
  const shareMenuRef = ref(null)

  const reportToday = new Date()
  const reportStart = new Date(reportToday)
  reportStart.setDate(reportStart.getDate() - 6)
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const dateFrom = ref(localDate(reportStart))
  const dateTo = ref(localDate(reportToday))

  const dateRangeLabel = computed(() => {
    const formatDate = date => {
      if (!date) {
        return ''
      }

      const [year, month, day] = date.split('-')

      return `${Number(day)}/${Number(month)}/${year}`
    }

    return `${formatDate(dateTo.value)} - ${formatDate(dateFrom.value)}`
  })

  function handleClickOutside(event) {
    if (dateRangeRef.value && !dateRangeRef.value.contains(event.target)) {
      showDatePicker.value = false
    }

    if (shareMenuRef.value && !shareMenuRef.value.contains(event.target)) {
      isFallbackMenuOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  /* ----------------------------------------
   * Statistics
   * -------------------------------------- */

  const stats = ref([])
  const displayedStats = computed(() => stats.value.length ? stats.value : [
    'متوسط وقت الرد', 'معدل التحويل', 'إجمالي الزيارات',
    'معدل النجاح', 'مشاريع تم إنجازها', 'إجمالي العملاء',
  ].map(label => ({ label, value: isLoading.value ? 'جارٍ التحميل...' : 'لا يوجد بيانات' })))

  /* ----------------------------------------
   * Customer sources
   * -------------------------------------- */

  const sourceLegend = ref([])

  const sourceChartData = computed(() => ({
    labels: sourceLegend.value.map(item => item.label),

    datasets: [
      {
        data: sourceLegend.value.map(item => item.percent),
        backgroundColor: sourceLegend.value.map(item => item.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }))

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        rtl: true,
        textDirection: 'rtl'
      }
    }
  }

  /* ----------------------------------------
   * Conversion line chart
   * -------------------------------------- */

  const conversionTrendRaw = ref({ labels: [], visits: [], calls: [], newCustomers: [] })

  const conversionTrendData = computed(() => ({
    labels: conversionTrendRaw.value.labels,

    datasets: [
      {
        label: 'الزيارات',
        data: conversionTrendRaw.value.visits,

        borderColor: '#6C7CFF',
        backgroundColor: '#6C7CFF',

        borderWidth: 1.5,
        tension: 0.4,
        fill: false,

        pointRadius: 6,
        pointHoverRadius: 7,
        pointHitRadius: 12,

        pointBackgroundColor: '#6C7CFF',
        pointBorderColor: '#6C7CFF',
        pointBorderWidth: 0,

        clip: false
      },

      {
        label: 'المكالمات',
        data: conversionTrendRaw.value.calls,

        borderColor: '#DF78F5',
        backgroundColor: '#DF78F5',

        borderWidth: 1.5,
        tension: 0.4,
        fill: false,

        pointRadius: 6,
        pointHoverRadius: 7,
        pointHitRadius: 12,

        pointBackgroundColor: '#DF78F5',
        pointBorderColor: '#DF78F5',
        pointBorderWidth: 0,

        clip: false
      },

      {
        label: 'عملاء جدد',
        data: conversionTrendRaw.value.newCustomers,

        borderColor: 'transparent',
        backgroundColor: '#F472B6',

        showLine: false,

        pointRadius: 6,
        pointHoverRadius: 7,
        pointHitRadius: 12,

        pointBackgroundColor: '#F472B6',
        pointBorderColor: '#F472B6',
        pointBorderWidth: 0,

        clip: false
      }
    ]
  }))

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    normalized: true,
    resizeDelay: 100,

    interaction: {
      mode: 'index',
      intersect: false
    },

    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 0
      }
    },

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        rtl: true,
        textDirection: 'rtl',
        displayColors: true
      }
    },

    scales: {
      x: {
        /*
         * false للحفاظ على نفس توزيع Figma:
         * أول نقطة على بداية المحور وآخر نقطة على نهايته.
         */
        offset: false,
        bounds: 'ticks',

        grid: {
          display: true,
          color: '#ECEEF2',
          lineWidth: 1,
          drawTicks: false
        },

        border: {
          display: false
        },

        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          padding: 12,
          color: '#4B5563',

          font: {
            size: 11,
            family: 'Tajawal'
          }
        }
      },

      y: {
        min: 0,
        max: 120,
        beginAtZero: true,

        grid: {
          display: true,
          color: '#ECEEF2',
          lineWidth: 1,
          drawTicks: false
        },

        border: {
          display: false
        },

        ticks: {
          stepSize: 40,
          padding: 12,
          color: '#374151',

          font: {
            size: 12,
            family: 'Tajawal'
          }
        }
      }
    }
  }

  /* ----------------------------------------
   * Visit success chart
   * -------------------------------------- */

  const visitSuccessRaw = ref({ labels: [], visits: [], newCustomers: [] })

  const visitSuccessData = computed(() => ({
    labels: visitSuccessRaw.value.labels,

    datasets: [
      {
        label: 'الزيارات',
        data: visitSuccessRaw.value.visits,
        backgroundColor: '#14B8A6',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },

      {
        label: 'عملاء جدد',
        data: visitSuccessRaw.value.newCustomers,
        backgroundColor: '#FBBF24',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }))

  /* ----------------------------------------
   * Employee trend chart
   * -------------------------------------- */

  const employeeTrendRaw = ref({ labels: [], calls: [], newCustomers: [] })

  const employeeTrendData = computed(() => ({
    labels: employeeTrendRaw.value.labels,

    datasets: [
      {
        label: 'المكالمات',
        data: employeeTrendRaw.value.calls,
        backgroundColor: '#6366F1',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },

      {
        label: 'عملاء جدد',
        data: employeeTrendRaw.value.newCustomers,
        backgroundColor: '#34D399',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }))

  /* ----------------------------------------
   * Bar chart options
   * -------------------------------------- */

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    normalized: true,
    resizeDelay: 100,

    interaction: {
      mode: 'index',
      intersect: false
    },

    layout: {
      padding: {
        left: 6,
        right: 6,
        top: 6,
        bottom: 0
      }
    },

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        rtl: true,
        textDirection: 'rtl'
      }
    },

    scales: {
      x: {
        offset: true,

        grid: {
          display: false
        },

        border: {
          display: false
        },

        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          color: '#9CA3AF',

          font: {
            size: 11,
            family: 'Tajawal'
          }
        }
      },

      y: {
        beginAtZero: true,

        grid: {
          color: '#F3F4F6',
          drawTicks: false
        },

        border: {
          display: false
        },

        ticks: {
          padding: 6,
          color: '#9CA3AF',

          font: {
            size: 11,
            family: 'Tajawal'
          }
        }
      }
    }
  }

  /* ----------------------------------------
   * Employee performance table
   * -------------------------------------- */

  const employeePerformance = ref([])
  const {
    employees,
    loading: employeesLoading, error: employeesError, updatingId, resettingId,
    actionError: employeeActionError, actionSuccess: employeeActionSuccess,
    loadEmployees,
    deactivateEmployee, resetEmployeePassword,
  } = useEmployees()
  const employeeBusy = computed(() => !!updatingId.value || !!resettingId.value)
  // Reserved for the upcoming report endpoint; users only populate the employee filter.
  const employeeRows = ref([])

  /* ----------------------------------------
   * Load report data from API
   * -------------------------------------- */

  function reportParams() {
    return {
      period: period.value,
      agent: agentFilter.value || undefined,
      source: sourceFilter.value || undefined,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    }
  }

  let reportRequest = 0
  function hasChartData(data) {
    return data.datasets.some(dataset => dataset.data.some(value => value != null))
  }

  async function loadReportData() {
    const request = ++reportRequest
    isLoading.value = true
    const params = reportParams()
    const sections = [
      [stats, () => reportsService.getSummary(params), []],
      [sourceLegend, () => reportsService.getCustomerSources(params), []],
      [conversionTrendRaw, () => reportsService.getConversionTrend(params), { labels: [], visits: [], calls: [], newCustomers: [] }],
      [employeePerformance, () => reportsService.getEmployeePerformance(params), []],
      [visitSuccessRaw, () => reportsService.getVisitSuccess(params), { labels: [], visits: [], newCustomers: [] }],
      [employeeTrendRaw, () => reportsService.getEmployeeTrend(params), { labels: [], calls: [], newCustomers: [] }],
    ]
    await Promise.all(sections.map(async ([target, fetch, empty]) => {
      target.value = empty
      try {
        const result = await fetch()
        if (request !== reportRequest) return
        target.value = Array.isArray(empty)
          ? (Array.isArray(result) ? result : [])
          : Object.fromEntries(Object.keys(empty).map(key => [key, Array.isArray(result?.[key]) ? result[key] : []]))
      } catch {
        if (request === reportRequest) target.value = empty
      }
    }))
    if (request === reportRequest) isLoading.value = false
  }

  onMounted(loadReportData)

  function performanceClass(performance) {
    const classes = {
      'تم التحويل': 'bg-emerald-50 text-emerald-600',
      مهتم: 'bg-blue-50 text-blue-600',
      'عميل جديد': 'bg-sky-50 text-sky-600',
      'قيد المعالجة': 'bg-yellow-50 text-yellow-600',
      'غير مهتم': 'bg-red-50 text-red-500',
      محتمل: 'bg-teal-50 text-teal-600'
    }

    return classes[performance] ?? 'bg-gray-100 text-gray-500'
  }

  /* ----------------------------------------
   * Row selection
   * -------------------------------------- */

  const selectedEmployees = ref([])

  const allSelected = computed(
    () =>
      employeeRows.value.length > 0 &&
      employeeRows.value.every(employee => selectedEmployees.value.includes(employee.id))
  )

  function toggleEmployee(name) {
    const index = selectedEmployees.value.indexOf(name)

    if (index === -1) {
      selectedEmployees.value.push(name)
    } else {
      selectedEmployees.value.splice(index, 1)
    }
  }

  function toggleSelectAll() {
    selectedEmployees.value = allSelected.value
      ? []
      : employeeRows.value.map(employee => employee.id)
  }

  /* ----------------------------------------
   * Export
   * -------------------------------------- */

  const reportRoot = ref(null)
  const isExportingPdf = ref(false)

  const conversionChartRef = ref(null)
  const sourceChartRef = ref(null)
  const employeeChartRef = ref(null)
  const visitChartRef = ref(null)

  const isExportingExcel = ref(false)
  const notification = useNotification()

  /* ----------------------------------------
   * Excel export helpers
   * -------------------------------------- */

  function safeCell(value) {
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    if (typeof value === 'number' && Number.isNaN(value)) {
      return '-'
    }

    return value
  }

  function formatFileDate(date) {
    if (!date) {
      return ''
    }

    const [year, month, day] = date.split('-')

    return `${day}-${month}-${year}`
  }

  function newRtlSheet(workbook, name) {
    return workbook.addWorksheet(name, {
      views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }]
    })
  }

  function styleHeaderRow(row) {
    row.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      }

      cell.alignment = { vertical: 'middle', horizontal: 'center', readingOrder: 'rtl' }

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }
    })

    row.height = 22
  }

  function styleDataRows(worksheet) {
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      worksheet.getRow(rowNumber).eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }

        cell.alignment = { vertical: 'middle', horizontal: 'center', readingOrder: 'rtl' }
      })
    }
  }

  function autoSizeColumns(worksheet, minWidth = 12) {
    worksheet.columns.forEach(column => {
      let maxLength = minWidth

      column.eachCell({ includeEmpty: true }, cell => {
        const length = String(cell.value ?? '').length

        if (length > maxLength) {
          maxLength = length
        }
      })

      column.width = Math.min(maxLength + 4, 45)
    })
  }

  function addSeriesTableSheet(workbook, name, chartData, firstColumnHeader) {
    const sheet = newRtlSheet(workbook, name)

    sheet.columns = [
      { header: firstColumnHeader, key: 'label' },
      ...chartData.datasets.map((dataset, index) => ({
        header: dataset.label ?? `سلسلة ${index + 1}`,
        key: `series${index}`
      }))
    ]

    chartData.labels.forEach((label, rowIndex) => {
      const row = { label: safeCell(label) }

      chartData.datasets.forEach((dataset, index) => {
        row[`series${index}`] = safeCell(dataset.data[rowIndex])
      })

      sheet.addRow(row)
    })

    styleHeaderRow(sheet.getRow(1))
    styleDataRows(sheet)
    sheet.autoFilter = { from: 'A1', to: `${sheet.getColumn(sheet.columnCount).letter}1` }
    autoSizeColumns(sheet)

    return sheet
  }

  function getChartInstance(componentRef) {
    const canvas = componentRef?.value?.$el

    return canvas instanceof HTMLCanvasElement ? ChartJS.getChart(canvas) : null
  }

  function addChartImage(workbook, worksheet, title, chartInstance, startRow) {
    worksheet.getCell(`A${startRow}`).value = title
    worksheet.getCell(`A${startRow}`).font = { bold: true, size: 13, color: { argb: 'FF111827' } }
    worksheet.getCell(`A${startRow}`).alignment = { horizontal: 'right', readingOrder: 'rtl' }

    if (!chartInstance || !chartInstance.canvas) {
      worksheet.getCell(`A${startRow + 1}`).value = 'الرسم غير متاح للتصدير'

      return startRow + 3
    }

    const canvas = chartInstance.canvas
    const dpr = window.devicePixelRatio || 1
    const widthPx = canvas.width / dpr
    const heightPx = canvas.height / dpr

    const base64 = chartInstance.toBase64Image('image/png', 1)
    const imageId = workbook.addImage({ base64, extension: 'png' })

    worksheet.addImage(imageId, {
      tl: { col: 0.3, row: startRow + 0.3 },
      ext: { width: widthPx, height: heightPx }
    })

    const rowsUsed = Math.ceil(heightPx / 20) + 2

    return startRow + rowsUsed
  }

  function addLegendRows(worksheet, startRow, items) {
    let row = startRow

    items.forEach(item => {
      worksheet.getCell(`A${row}`).value = item.label
      worksheet.getCell(`A${row}`).alignment = { horizontal: 'right', readingOrder: 'rtl' }

      worksheet.getCell(`B${row}`).value = ' '

      worksheet.getCell(`B${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${item.color.replace('#', '')}` }
      }

      row++
    })

    return row + 1
  }

  /* ----------------------------------------
   * Excel export
   * -------------------------------------- */

  async function exportExcel() {
    if (isExportingExcel.value) {
      return
    }

    isExportingExcel.value = true

    try {
      await nextTick()

      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'نظام مركز الاتصال'
      workbook.created = new Date()

      /* ---------- Sheet 1: ملخص التقرير ---------- */

      const summarySheet = newRtlSheet(workbook, 'ملخص التقرير')

      summarySheet.columns = [
        { header: 'المؤشر', key: 'label' },
        { header: 'القيمة', key: 'value' }
      ]

      stats.value.forEach(stat => {
        summarySheet.addRow({ label: safeCell(stat.label), value: safeCell(stat.value) })
      })

      summarySheet.addRow({
        label: 'الفترة الزمنية',
        value: `${dateFrom.value} إلى ${dateTo.value}`
      })

      summarySheet.addRow({
        label: 'الموظف المحدد',
        value: safeCell(employees.value.find(employee => employee.id === agentFilter.value)?.name || 'جميع الموظفين')
      })

      summarySheet.addRow({
        label: 'المصدر المحدد',
        value: safeCell(sourceFilter.value || 'جميع المصادر')
      })

      summarySheet.addRow({ label: 'نوع التجميع الحالي', value: periodLabel.value })

      styleHeaderRow(summarySheet.getRow(1))
      styleDataRows(summarySheet)
      summarySheet.autoFilter = 'A1:B1'
      autoSizeColumns(summarySheet, 18)

      /* ---------- Sheet 2: الاتجاه الزمني ---------- */

      const trendSheet = newRtlSheet(workbook, 'الاتجاه الزمني')

      const trendDatasetByLabel = Object.fromEntries(
        conversionTrendData.value.datasets.map(dataset => [dataset.label, dataset.data])
      )

      trendSheet.columns = [
        { header: 'اليوم', key: 'day' },
        { header: 'الزيارات', key: 'visits' },
        { header: 'المكالمات', key: 'calls' },
        { header: 'عملاء جدد', key: 'newCustomers' }
      ]

      conversionTrendData.value.labels.forEach((label, index) => {
        trendSheet.addRow({
          day: safeCell(label),
          visits: safeCell(trendDatasetByLabel['الزيارات']?.[index]),
          calls: safeCell(trendDatasetByLabel['المكالمات']?.[index]),
          newCustomers: safeCell(trendDatasetByLabel['عملاء جدد']?.[index])
        })
      })

      styleHeaderRow(trendSheet.getRow(1))
      styleDataRows(trendSheet)
      trendSheet.autoFilter = 'A1:D1'
      autoSizeColumns(trendSheet)

      /* ---------- Sheet 3: مصادر العملاء ---------- */

      const sourcesSheet = newRtlSheet(workbook, 'مصادر العملاء')

      sourcesSheet.columns = [
        { header: 'المصدر', key: 'label' },
        { header: 'النسبة المئوية', key: 'percent' },
        { header: 'اللون', key: 'color' }
      ]

      sourceLegend.value.forEach(item => {
        sourcesSheet.addRow({
          label: safeCell(item.label),
          percent: item.percent / 100,
          color: safeCell(item.color)
        })
      })

      sourcesSheet.getColumn('percent').numFmt = '0%'

      styleHeaderRow(sourcesSheet.getRow(1))
      styleDataRows(sourcesSheet)

      sourceLegend.value.forEach((item, index) => {
        sourcesSheet.getCell(`C${index + 2}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: `FF${item.color.replace('#', '')}` }
        }

        sourcesSheet.getCell(`C${index + 2}`).font = { color: { argb: 'FFFFFFFF' } }
      })

      sourcesSheet.autoFilter = 'A1:C1'
      autoSizeColumns(sourcesSheet)

      /* ---------- Sheet 4: البيانات التفصيلية ---------- */

      const detailSheet = newRtlSheet(workbook, 'البيانات التفصيلية')

      detailSheet.columns = [
        { header: 'الموظف', key: 'name' },
        { header: 'عدد المكالمات', key: 'calls' },
        { header: 'عملاء جدد', key: 'newCustomers' },
        { header: 'التحويلات', key: 'conversions' },
        { header: 'معدل التحويل', key: 'conversionRate' },
        { header: 'الزيارات', key: 'visits' },
        { header: 'نجاح الزيارات', key: 'visitSuccessRate' },
        { header: 'نقاط الأداء', key: 'score' },
        { header: 'الأداء', key: 'performance' }
      ]

      employeePerformance.value.forEach(employee => {
        detailSheet.addRow({
          name: safeCell(employee.name),
          calls: safeCell(employee.calls),
          newCustomers: safeCell(employee.newCustomers),
          conversions: safeCell(employee.conversions),
          conversionRate: employee.conversionRate / 100,
          visits: safeCell(employee.visits),
          visitSuccessRate: employee.visitSuccessRate / 100,
          score: safeCell(employee.score),
          performance: safeCell(employee.performance)
        })
      })

      detailSheet.getColumn('conversionRate').numFmt = '0%'
      detailSheet.getColumn('visitSuccessRate').numFmt = '0%'

      styleHeaderRow(detailSheet.getRow(1))
      styleDataRows(detailSheet)
      detailSheet.autoFilter = 'A1:I1'
      autoSizeColumns(detailSheet)

      /* ---------- Sheet 5: أداء الموظفين (رسم المقارنة اليومي) ---------- */

      addSeriesTableSheet(workbook, 'أداء الموظفين', employeeTrendData.value, 'اليوم')

      /* ---------- Sheet 6: نجاح الزيارات (رسم المقارنة اليومي) ---------- */

      addSeriesTableSheet(workbook, 'نجاح الزيارات', visitSuccessData.value, 'اليوم')

      /* ---------- Sheet 7: الرسوم البيانية ---------- */

      const chartsSheet = newRtlSheet(workbook, 'الرسوم البيانية')
      chartsSheet.views = [{ rightToLeft: true }]
      chartsSheet.getColumn(1).width = 90
      chartsSheet.getColumn(2).width = 14

      let row = 1

      row = addChartImage(
        workbook,
        chartsSheet,
        'معدل التحويل – الاتجاه الزمني',
        getChartInstance(conversionChartRef),
        row
      )

      row = addLegendRows(
        chartsSheet,
        row,
        conversionTrendData.value.datasets.map(dataset => ({
          label: dataset.label,
          color: dataset.backgroundColor
        }))
      )

      row = addChartImage(
        workbook,
        chartsSheet,
        'توزيع مصادر العملاء',
        getChartInstance(sourceChartRef),
        row
      )

      row = addLegendRows(
        chartsSheet,
        row,
        sourceLegend.value.map(item => ({ label: `${item.label} (${item.percent}%)`, color: item.color }))
      )

      row = addChartImage(
        workbook,
        chartsSheet,
        'أداء الموظفين',
        getChartInstance(employeeChartRef),
        row
      )

      row = addLegendRows(
        chartsSheet,
        row,
        employeeTrendData.value.datasets.map(dataset => ({
          label: dataset.label,
          color: dataset.backgroundColor
        }))
      )

      row = addChartImage(
        workbook,
        chartsSheet,
        'معدل نجاح الزيارات',
        getChartInstance(visitChartRef),
        row
      )

      addLegendRows(
        chartsSheet,
        row,
        visitSuccessData.value.datasets.map(dataset => ({
          label: dataset.label,
          color: dataset.backgroundColor
        }))
      )

      /* ---------- Save ---------- */

      const buffer = await workbook.xlsx.writeBuffer()

      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `تقرير_التحليلات_من_${formatFileDate(dateFrom.value)}_إلى_${formatFileDate(dateTo.value)}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      notification.success('تم تصدير التقرير إلى Excel بنجاح')
    } catch (error) {
      console.error('Excel export failed:', error)
      notification.error('حدث خطأ أثناء تصدير التقرير، حاول مرة أخرى')
    } finally {
      isExportingExcel.value = false
    }
  }

  async function captureReportPdf() {
    if (!reportRoot.value) {
      throw new Error('Report root element is not available')
    }

    if (isExportingPdf.value) {
      throw new Error('A PDF export is already in progress')
    }

    isExportingPdf.value = true
    await nextTick()

    try {
      return await generateReportPdfBlob(reportRoot.value)
    } finally {
      isExportingPdf.value = false
    }
  }

  /* ----------------------------------------
   * Share report
   * -------------------------------------- */

  const {
    isPreparing: isSharePreparing,
    isSharing: isReportSharing,
    isFallbackMenuOpen,
    shareReport,
    downloadReport,
    invalidatePreparedReport
  } = useReportShare({
    generatePdf: captureReportPdf,
    getFileName: () => buildPdfFileName(`تقرير-التحليلات-${dateFrom.value}-${dateTo.value}`),
    reportTitle: 'تقرير التحليلات',
    shareText: 'الرجاء الاطلاع على التقرير المرفق.'
  })

  watch([period, agentFilter, sourceFilter, dateFrom, dateTo], () => {
    invalidatePreparedReport()
    loadReportData()
  })

  const shareButtonLabel = computed(() => {
    if (isSharePreparing.value) {
      return '...جاري تجهيز التقرير'
    }

    if (isReportSharing.value) {
      return '...جاري فتح خيارات المشاركة'
    }

    return 'مشاركة التقرير'
  })

  const isShareBusy = computed(() => isSharePreparing.value || isReportSharing.value)

  async function onExportPdfClick() {
    if (isShareBusy.value || isExportingPdf.value) {
      return
    }

    await downloadReport()
  }
</script>

<style scoped>
  /*
 * يمنع عنصر الرسم من فرض عرض أكبر
 * من المساحة المتاحة له داخل CSS Grid.
 */
  .chart-container {
    min-width: 0;
    overflow: hidden;
  }

  /*
 * تثبيت Canvas داخل أبعاد الحاوية.
 * هذا يمنع خروج الرسم خارج حدود الكارت.
 */
  .chart-container :deep(canvas) {
    position: absolute !important;
    inset: 0 !important;

    display: block !important;

    width: 100% !important;
    max-width: 100% !important;

    height: 100% !important;
    max-height: 100% !important;
  }
</style>
