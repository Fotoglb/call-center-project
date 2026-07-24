<template>
  <div class="min-w-0 space-y-5 overflow-x-hidden" dir="rtl">
    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">التقارير والتحليلات</h1>

        <p class="mt-1 text-xs text-gray-400">تقرير مفصل قابل للتصدير والفلترة</p>
      </div>

      <!-- Export Actions -->
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          :class="
            exportFormat === 'excel'
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          "
          @click="exportFormat = 'excel'"
        >
          Excel
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition-colors"
          :class="
            exportFormat === 'pdf'
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          "
          @click="exportFormat = 'pdf'"
        >
          PDF
        </button>

        <button
          type="button"
          class="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
        >
          <Share2 :size="14" />
          مشاركة التقرير
        </button>
      </div>
    </div>

    <!-- Filters and Period -->
    <div class="flex flex-wrap items-center justify-between gap-3">
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
            class="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pe-7 ps-3 text-xs text-gray-600 hover:border-gray-300 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">جميع الموظفين</option>

            <option
              v-for="employee in employeePerformance"
              :key="employee.name"
              :value="employee.name"
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
      <div class="flex shrink-0 items-center rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'daily' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'daily'"
        >
          يومي
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'weekly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
          "
          @click="period = 'weekly'"
        >
          أسبوعي
        </button>

        <button
          type="button"
          class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            period === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
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
        v-for="stat in stats"
        :key="stat.label"
        class="min-w-0 space-y-1 rounded-xl border border-gray-200 bg-white p-4"
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
      <div
        class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-3"
      >
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
          <Line :data="conversionTrendData" :options="lineOptions" />
        </div>
      </div>

      <!-- Sources Doughnut -->
      <div
        class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-1"
      >
        <h3 class="text-sm font-semibold text-gray-900">توزيع مصادر العملاء</h3>

        <p class="mb-4 mt-1 text-xs text-gray-400">هذا الشهر</p>

        <div class="flex min-w-0 flex-col items-center gap-4">
          <div class="relative h-32 w-32 shrink-0">
            <Doughnut :data="sourceChartData" :options="donutOptions" />
          </div>

          <ul class="w-full min-w-0 space-y-3 text-xs">
            <li
              v-for="item in sourceLegend"
              :key="item.label"
              class="flex min-w-0 items-center justify-between gap-2"
            >
              <span class="flex min-w-0 items-center gap-1.5">
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: item.color }"
                ></span>

                <span class="truncate">
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
      <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
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
          <Bar :data="employeeTrendData" :options="barOptions" />
        </div>
      </div>

      <!-- Visit Success -->
      <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
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
          <Bar :data="visitSuccessData" :options="barOptions" />
        </div>
      </div>
    </div>

    <!-- Employee Performance Table -->
    <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div class="border-b border-gray-100 px-5 py-4">
        <h3 class="text-sm font-semibold text-gray-900">تقرير الأداء الوظيفي</h3>

        <p class="mt-0.5 text-xs text-gray-400">مقارنة شاملة لجميع الموظفين خلال هذا الأسبوع</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-262.5 text-xs">
          <thead class="border-b border-gray-200 bg-gray-50">
            <tr>
              <th class="w-10 px-4 py-3">
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

              <th class="w-16 px-4 py-3"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="employee in employeePerformance"
              :key="employee.name"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  class="cursor-pointer"
                  :checked="selectedEmployees.includes(employee.name)"
                  @change="toggleEmployee(employee.name)"
                />
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600"
                  >
                    {{ employee.name.charAt(0) }}
                  </div>

                  <span class="whitespace-nowrap font-medium text-gray-800">
                    {{ employee.name }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.calls }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.newCustomers }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.conversions }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.conversionRate }}%</td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.visits }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.visitSuccessRate }}%</td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.score }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="performanceClass(employee.performance)"
                >
                  {{ employee.performance }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    title="تعديل"
                    class="cursor-pointer text-gray-400 transition-colors hover:text-indigo-500"
                  >
                    <Pencil :size="14" />
                  </button>

                  <button
                    type="button"
                    title="حذف"
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
  import { computed, onMounted, onUnmounted, ref } from 'vue'

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

  import { CalendarRange, ChevronDown, Pencil, Share2, Trash2 } from '@lucide/vue'

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

  const exportFormat = ref('excel')
  const period = ref('daily')
  const agentFilter = ref('')
  const sourceFilter = ref('')

  /* ----------------------------------------
   * Date range
   * -------------------------------------- */

  const showDatePicker = ref(false)
  const dateRangeRef = ref(null)

  const dateFrom = ref('2026-06-10')
  const dateTo = ref('2026-06-16')

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

  const stats = [
    {
      value: '8.1 يوم',
      label: 'متوسط وقت الرد'
    },
    {
      value: '18.5%',
      label: 'معدل التحويل'
    },
    {
      value: '40',
      label: 'إجمالي الزيارات'
    },
    {
      value: '20%',
      label: 'معدل النجاح'
    },
    {
      value: '22',
      label: 'مشاريع تم إنجازها'
    },
    {
      value: '247',
      label: 'إجمالي العملاء'
    }
  ]

  /* ----------------------------------------
   * Customer sources
   * -------------------------------------- */

  const sourceLegend = [
    {
      label: 'مواقع الويب',
      percent: 38,
      color: '#3B82F6'
    },
    {
      label: 'إعلانات سوشيال ميديا',
      percent: 27,
      color: '#A855F7'
    },
    {
      label: 'توصية عميل',
      percent: 18,
      color: '#10B981'
    },
    {
      label: 'إعلانات جوجل',
      percent: 12,
      color: '#F59E0B'
    },
    {
      label: 'أخرى',
      percent: 5,
      color: '#EF4444'
    }
  ]

  const sourceChartData = {
    labels: sourceLegend.map(item => item.label),

    datasets: [
      {
        data: sourceLegend.map(item => item.percent),
        backgroundColor: sourceLegend.map(item => item.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }

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
   * Shared labels
   * -------------------------------------- */

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

  /* ----------------------------------------
   * Conversion line chart
   * -------------------------------------- */

  const conversionTrendData = {
    labels: days,

    datasets: [
      {
        label: 'الزيارات',
        data: [80, 73, 76, 91, 113, 120, 110],

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
        data: [44, 56, 64, 68, 71, 74, 77],

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
        data: [null, null, null, null, null, null, 25],

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
  }

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

  const visitSuccessData = {
    labels: days,

    datasets: [
      {
        label: 'الزيارات',
        data: [8, 12, 10, 14, 16, 11, 9],
        backgroundColor: '#14B8A6',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },

      {
        label: 'عملاء جدد',
        data: [4, 6, 5, 8, 9, 6, 5],
        backgroundColor: '#FBBF24',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }

  /* ----------------------------------------
   * Employee trend chart
   * -------------------------------------- */

  const employeeTrendData = {
    labels: days,

    datasets: [
      {
        label: 'المكالمات',
        data: [20, 28, 24, 32, 35, 26, 22],
        backgroundColor: '#6366F1',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },

      {
        label: 'عملاء جدد',
        data: [6, 9, 7, 11, 12, 8, 7],
        backgroundColor: '#34D399',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }

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

  const employeePerformance = [
    {
      name: 'سارة أحمد',
      calls: 156,
      conversions: 37,
      conversionRate: 24,
      visits: 18,
      visitSuccessRate: 78,
      newCustomers: 32,
      score: 92,
      performance: 'تم التحويل'
    },
    {
      name: 'محمد علي',
      calls: 142,
      conversions: 30,
      conversionRate: 21,
      visits: 15,
      visitSuccessRate: 70,
      newCustomers: 27,
      score: 85,
      performance: 'مهتم'
    },
    {
      name: 'هند الفضل',
      calls: 138,
      conversions: 26,
      conversionRate: 19,
      visits: 14,
      visitSuccessRate: 65,
      newCustomers: 24,
      score: 80,
      performance: 'عميل جديد'
    },
    {
      name: 'إبراهيم أحمد',
      calls: 121,
      conversions: 21,
      conversionRate: 17,
      visits: 12,
      visitSuccessRate: 58,
      newCustomers: 19,
      score: 65,
      performance: 'قيد المعالجة'
    },
    {
      name: 'فاطمة حسن',
      calls: 130,
      conversions: 29,
      conversionRate: 22,
      visits: 16,
      visitSuccessRate: 73,
      newCustomers: 28,
      score: 90,
      performance: 'تم التحويل'
    },
    {
      name: 'يوسف سالم',
      calls: 98,
      conversions: 13,
      conversionRate: 13,
      visits: 9,
      visitSuccessRate: 48,
      newCustomers: 14,
      score: 45,
      performance: 'غير مهتم'
    },
    {
      name: 'طارق محمد',
      calls: 115,
      conversions: 21,
      conversionRate: 18,
      visits: 11,
      visitSuccessRate: 60,
      newCustomers: 20,
      score: 63,
      performance: 'محتمل'
    }
  ]

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
      employeePerformance.length > 0 &&
      selectedEmployees.value.length === employeePerformance.length
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
      : employeePerformance.map(employee => employee.name)
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
