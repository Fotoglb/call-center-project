<template>
  <div class="space-y-5">
    <!-- Title -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-gray-900">التقارير والتحليلات</h1>
        <p class="text-xs text-gray-400 mt-1">تقرير مفصل قابل للتصدير والفلترة</p>
      </div>

      <!-- Export Buttons (pushed to the left in RTL) -->
      <div class="flex items-center gap-2 justify-end">
        <button
          class="text-xs font-medium rounded-lg px-4 py-2 cursor-pointer transition-colors"
          :class="
            exportFormat === 'excel'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
          "
          @click="exportFormat = 'excel'"
        >
          Excel
        </button>
        <button
          class="text-xs font-medium rounded-lg px-4 py-2 cursor-pointer transition-colors"
          :class="
            exportFormat === 'pdf'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
          "
          @click="exportFormat = 'pdf'"
        >
          PDF
        </button>
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <Share2 :size="14" />
          مشاركة التقرير
        </button>
      </div>
    </div>
    <!-- Period Toggle (left) + Filters (right) -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 flex-wrap">
        <div ref="dateRangeRef" class="relative">
          <button
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="showDatePicker = !showDatePicker"
          >
            <CalendarRange :size="14" />
            <span dir="ltr">{{ dateRangeLabel }}</span>
            <ChevronDown :size="12" />
          </button>
          <div
            v-if="showDatePicker"
            class="absolute z-10 top-full mt-2 start-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2 w-52"
          >
            <div>
              <label class="text-xs text-gray-500 block mb-1">من تاريخ</label>
              <input
                v-model="dateFrom"
                type="date"
                class="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 block mb-1">إلى تاريخ</label>
              <input
                v-model="dateTo"
                type="date"
                class="w-full text-xs text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              class="w-full text-xs text-white bg-gray-900 rounded-lg py-1.5 hover:bg-gray-700 cursor-pointer transition-colors"
              @click="showDatePicker = false"
            >
              تطبيق
            </button>
          </div>
        </div>
        <div class="relative">
          <select
            v-model="agentFilter"
            class="appearance-none text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">جميع الموظفين</option>
            <option v-for="a in employeePerformance" :key="a.name" :value="a.name">
              {{ a.name }}
            </option>
          </select>
          <ChevronDown
            :size="12"
            class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div class="relative">
          <select
            v-model="sourceFilter"
            class="appearance-none text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">جميع المصادر</option>
            <option v-for="s in sourceLegend" :key="s.label" :value="s.label">{{ s.label }}</option>
          </select>
          <ChevronDown
            :size="12"
            class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      <div class="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
          :class="
            period === 'daily' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'daily'"
        >
          يومي
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
          :class="
            period === 'weekly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'weekly'"
        >
          أسبوعي
        </button>
        <button
          class="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors"
          :class="
            period === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'monthly'"
        >
          شهري
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-gray-200 p-4 space-y-1"
      >
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-xs text-gray-500">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Charts Row 1: Donut + Conversion Trend -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">معدل التحويل – الاتجاه الزمني</h3>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-indigo-500"></span>الزيارات</span
            >
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-purple-400"></span>المكالمات</span
            >
          </div>
        </div>
        <Line :data="conversionTrendData" :options="lineOptions" class="max-h-44" />
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">توزيع مصادر العملاء</h3>
        <div class="flex items-center gap-4">
          <div class="w-32 h-32 shrink-0">
            <Doughnut :data="sourceChartData" :options="donutOptions" />
          </div>
          <ul class="space-y-1.5 text-xs flex-1">
            <li
              v-for="(item, i) in sourceLegend"
              :key="i"
              class="flex items-center justify-between gap-2"
            >
              <span class="flex items-center gap-1.5">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ background: item.color }"
                />
                {{ item.label }}
              </span>
              <span class="text-gray-500 font-medium">{{ item.percent }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Charts Row 2: Visit Success + Employee Performance Trend -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">معدل نجاح الزيارات</h3>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-teal-500"></span>الزيارات</span
            >
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-amber-400"></span>عملاء جدد</span
            >
          </div>
        </div>
        <Bar :data="visitSuccessData" :options="barOptions" class="max-h-44" />
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">أداء الموظفين</h3>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-indigo-500"></span>المكالمات</span
            >
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-emerald-400"></span>عملاء جدد</span
            >
          </div>
        </div>
        <Bar :data="employeeTrendData" :options="barOptions" class="max-h-44" />
      </div>
    </div>

    <!-- Employee Performance Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">تقرير الأداء الوظيفي</h3>
        <p class="text-xs text-gray-400 mt-0.5">مقارنة شاملة لجميع الموظفين خلال هذا الأسبوع</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الموظف
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                عدد المكالمات
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                معدل التحويل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الزيارات
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                معدل نجاح الزيارات
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                عملاء جدد
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الأداء
              </th>
              <th class="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="emp in employeePerformance"
              :key="emp.name"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0"
                  >
                    {{ emp.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-gray-800 whitespace-nowrap">{{ emp.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ emp.calls }}</td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ emp.conversionRate }}%</td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ emp.visits }}</td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ emp.visitSuccessRate }}%</td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ emp.newCustomers }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="performanceClass(emp.performance)"
                >
                  {{ emp.performance }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  class="text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors"
                  title="تنزيل"
                >
                  <Download :size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { Line, Doughnut, Bar } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
  } from 'chart.js'
  import { Download, ChevronDown, CalendarRange, Share2 } from '@lucide/vue'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
  )

  const exportFormat = ref('excel')
  const period = ref('daily')
  const agentFilter = ref('')

  const showDatePicker = ref(false)
  const dateRangeRef = ref(null)
  const dateFrom = ref('2026-06-10')
  const dateTo = ref('2026-06-16')

  const dateRangeLabel = computed(() => {
    const format = d => {
      const [y, m, day] = d.split('-')
      return `${Number(day)}/${Number(m)}/${y}`
    }
    return `${format(dateTo.value)} - ${format(dateFrom.value)}`
  })

  function handleClickOutside(e) {
    if (dateRangeRef.value && !dateRangeRef.value.contains(e.target)) {
      showDatePicker.value = false
    }
  }

  onMounted(() => document.addEventListener('click', handleClickOutside))
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
  const sourceFilter = ref('')

  const stats = [
    { value: '8.1 يوم', label: 'متوسط وقت الرد' },
    { value: '18.5%', label: 'معدل التحويل' },
    { value: '40', label: 'إجمالي الزيارات' },
    { value: '20%', label: 'معدل النجاح' },
    { value: '22', label: 'مشاريع تم إنجازها' },
    { value: '247', label: 'إجمالي العملاء' }
  ]

  const sourceLegend = [
    { label: 'جوجل أدز', percent: 38, color: '#3B82F6' },
    { label: 'وسائل التواصل', percent: 27, color: '#06B6D4' },
    { label: 'الاتصال المباشر', percent: 14, color: '#10B981' },
    { label: 'إعلانات تويتر', percent: 12, color: '#F59E0B' },
    { label: 'أخرى', percent: 9, color: '#EF4444' }
  ]

  const sourceChartData = {
    labels: sourceLegend.map(i => i.label),
    datasets: [
      {
        data: sourceLegend.map(i => i.percent),
        backgroundColor: sourceLegend.map(i => i.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: { legend: { display: false } }
  }

  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']

  const conversionTrendData = {
    labels: months,
    datasets: [
      {
        label: 'الزيارات',
        data: [45, 60, 55, 70, 65, 80],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#6366F1'
      },
      {
        label: 'المكالمات',
        data: [30, 40, 38, 50, 55, 62],
        borderColor: '#C084FC',
        backgroundColor: 'rgba(192,132,252,0.08)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#C084FC'
      }
    ]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
      y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } }
    }
  }

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  const visitSuccessData = {
    labels: days,
    datasets: [
      {
        label: 'الزيارات',
        data: [8, 12, 10, 14, 16, 11, 9],
        backgroundColor: '#14B8A6',
        borderRadius: 4
      },
      {
        label: 'عملاء جدد',
        data: [4, 6, 5, 8, 9, 6, 5],
        backgroundColor: '#FBBF24',
        borderRadius: 4
      }
    ]
  }

  const employeeTrendData = {
    labels: days,
    datasets: [
      {
        label: 'المكالمات',
        data: [20, 28, 24, 32, 35, 26, 22],
        backgroundColor: '#6366F1',
        borderRadius: 4
      },
      {
        label: 'عملاء جدد',
        data: [6, 9, 7, 11, 12, 8, 7],
        backgroundColor: '#34D399',
        borderRadius: 4
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
      y: { grid: { color: '#F9FAFB' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } }
    }
  }

  const employeePerformance = [
    {
      name: 'سارة أحمد',
      calls: 156,
      conversionRate: 24,
      visits: 18,
      visitSuccessRate: 78,
      newCustomers: 32,
      performance: 'ممتاز'
    },
    {
      name: 'محمد علي',
      calls: 142,
      conversionRate: 21,
      visits: 15,
      visitSuccessRate: 70,
      newCustomers: 27,
      performance: 'جيد جدا'
    },
    {
      name: 'هند الفضل',
      calls: 138,
      conversionRate: 19,
      visits: 14,
      visitSuccessRate: 65,
      newCustomers: 24,
      performance: 'جيد جدا'
    },
    {
      name: 'إبراهيم أحمد',
      calls: 121,
      conversionRate: 17,
      visits: 12,
      visitSuccessRate: 58,
      newCustomers: 19,
      performance: 'متوسط'
    },
    {
      name: 'فاطمة حسن',
      calls: 130,
      conversionRate: 22,
      visits: 16,
      visitSuccessRate: 73,
      newCustomers: 28,
      performance: 'ممتاز'
    },
    {
      name: 'يوسف سالم',
      calls: 98,
      conversionRate: 13,
      visits: 9,
      visitSuccessRate: 48,
      newCustomers: 14,
      performance: 'ضعيف'
    },
    {
      name: 'طارق محمد',
      calls: 115,
      conversionRate: 18,
      visits: 11,
      visitSuccessRate: 60,
      newCustomers: 20,
      performance: 'متوسط'
    }
  ]

  function performanceClass(performance) {
    const map = {
      ممتاز: 'bg-emerald-50 text-emerald-600',
      'جيد جدا': 'bg-blue-50 text-blue-600',
      متوسط: 'bg-amber-50 text-amber-600',
      ضعيف: 'bg-red-50 text-red-500'
    }
    return map[performance] ?? 'bg-gray-100 text-gray-500'
  }
</script>
