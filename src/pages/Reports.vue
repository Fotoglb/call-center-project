<template>
  <div ref="reportRoot" class="min-w-0 space-y-5 overflow-x-hidden" dir="rtl">
    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">***التقارير والتحليلات</h1>

        <p class="mt-1 text-xs text-gray-400">تقرير مفصل قابل للتصدير والفلترة</p>
      </div>

      <!-- Export Actions -->
      <div class="flex flex-wrap items-center justify-end gap-2">
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
          :disabled="isExportingPdf || isShareBusy || isLoading || !hasExportData"
          @click="onExportPdfClick"
        >
          {{ isExportingPdf ? '...جاري التجهيز' : 'PDF' }}
        </button>

        <button
          type="button"
          class="rounded-lg bg-blue-dark px-8 py-2 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          :class="isExportingExcel ? 'cursor-not-allowed' : 'cursor-pointer'"
          :disabled="isExportingExcel || isLoading || !hasExportData"
          @click="exportExcel"
        >
          <span v-if="isExportingExcel" class="flex items-center gap-1.5">
            <Loader2 :size="14" class="animate-spin" />
            ...جاري التجهيز
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
                v-model="draftDateFrom"
                type="date"
                :max="draftDateTo || undefined"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-gray-500"> إلى تاريخ </label>

              <input
                v-model="draftDateTo"
                type="date"
                :min="draftDateFrom || undefined"
                class="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <p v-if="dateRangeError" role="alert" class="text-xs text-red-600">
              {{ dateRangeError }}
            </p>
            <button
              type="button"
              class="w-full cursor-pointer rounded-lg bg-gray-900 py-1.5 text-xs text-white transition-colors hover:bg-gray-700"
              @click="applyDateRange"
            >
              تطبيق
            </button>
          </div>
        </div>

        <!-- Employee Filter -->
        <div class="relative">
          <select
            v-model="agentFilter"
            :aria-busy="employeeReportLoading || currentEmployeeLoading"
            aria-label="تصفية مخطط وجدول أداء الموظفين"
            class="w-60 max-w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pe-7 ps-3 text-xs text-gray-600 hover:border-gray-300 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">أداء الموظفين: الكل</option>
            <option v-if="employeeReportLoading || currentEmployeeLoading" disabled>
              جارٍ تحميل الموظفين...
            </option>
            <option v-else-if="!reportEmployeeOptions.length" disabled>
              {{ employeeReportError || currentEmployeeError || 'لا يوجد موظفون في التقارير' }}
            </option>

            <option
              v-for="employee in reportEmployeeOptions"
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
            <option value="">توزيع المصادر: الكل</option>

            <option
              v-for="source in sourceLegend"
              :key="source.sourceId ?? source.label"
              :value="source.sourceId ?? source.label"
            >
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
          @click="selectPeriod('daily')"
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
          @click="selectPeriod('weekly')"
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
          @click="selectPeriod('monthly')"
        >
          شهري
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <p class="text-[10px] text-gray-400">التقرير اليومي لتاريخ {{ dateTo }}</p>
    <p v-if="dailyError" role="alert" class="text-sm text-red-500">{{ dailyError }}</p>
    <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <div
        v-for="stat in displayedStats"
        :key="stat.label"
        class="min-w-0 space-y-2 rounded-2xl bg-white p-6"
      >
        <p
          class="min-h-9"
          :class="
            typeof stat.value === 'number'
              ? 'text-[28px] font-bold text-gray-900'
              : 'text-xs font-normal leading-5 text-gray-400'
          "
        >
          {{ stat.value }}{{ typeof stat.value === 'number' ? stat.unit || '' : '' }}
        </p>

        <p class="text-xs leading-5 text-gray-500">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <!-- Main Charts -->
    <div class="report-main-charts grid min-w-0 grid-cols-1">
      <!-- Conversion Trend -->
      <div class="conversion-panel min-w-0 overflow-hidden bg-white">
        <!-- Header like Figma -->
        <div
          class="conversion-heading flex flex-wrap items-center justify-between gap-x-8 gap-y-3"
          dir="rtl"
        >
          <!-- Title on the right -->
          <div class="shrink-0">
            <h3 class="text-sm font-bold text-gray-900">معدل التحويل — الاتجاه الزمني</h3>

            <p class="mt-1 text-[10px] leading-4 text-slate-400">
              العملاء الجدد والتحويلات حسب اليوم
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-5 text-[10px] text-gray-600">
            <span class="flex items-center gap-2"
              ><span class="h-1 w-5 rounded-full bg-[#8180FF]"></span>عملاء جدد</span
            >
            <span class="flex items-center gap-2"
              ><span class="h-1 w-5 rounded-full bg-[#E898FF]"></span>التحويلات</span
            >
          </div>
        </div>
        <p v-if="conversionError" role="alert" class="mb-3 text-xs text-red-600">
          {{ conversionError }}
        </p>

        <!-- Chart -->
        <div class="chart-scroll" dir="ltr" tabindex="0" aria-label="تمرير مخطط التحويل">
          <div
            class="conversion-canvas chart-container relative"
            :style="{ width: `${Math.max(720, conversionTrendData.labels.length * 110)}px` }"
          >
            <Line
              v-if="hasChartData(conversionTrendData)"
              ref="conversionChartRef"
              :data="conversionTrendData"
              :options="lineOptions"
            />
            <p
              v-else
              class="flex h-full items-center justify-center text-[10px] leading-4 text-gray-400"
              dir="rtl"
              role="status"
            >
              {{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sources Doughnut -->
      <div class="sources-panel min-w-0 overflow-hidden bg-white">
        <h3 class="text-sm font-semibold text-gray-900">توزيع مصادر العملاء</h3>

        <p class="mb-4 mt-1 text-xs text-gray-400">من {{ dateFrom }} إلى {{ dateTo }}</p>
        <p v-if="sourcesError" role="alert" class="mb-3 text-xs text-red-600">{{ sourcesError }}</p>

        <div class="sources-content flex min-w-0 flex-col items-center gap-4">
          <div class="source-ring relative h-40 w-40 shrink-0">
            <Doughnut
              v-if="hasChartData(sourceChartData)"
              ref="sourceChartRef"
              :data="sourceChartData"
              :options="donutOptions"
            />
            <p
              v-else
              class="flex h-full items-center justify-center text-[10px] leading-4 text-gray-400"
              dir="rtl"
              role="status"
            >
              {{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}
            </p>
          </div>

          <ul
            class="sources-list w-full min-w-0 space-y-3 text-xs"
            tabindex="0"
            aria-label="مصادر العملاء"
          >
            <li
              v-for="item in filteredSources"
              :key="item.sourceId ?? item.label"
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

              <span class="shrink-0 font-medium text-gray-500">{{ item.percent }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Secondary Charts -->
    <div class="report-secondary-charts grid min-w-0 grid-cols-1 gap-7 xl:grid-cols-2">
      <!-- Employee Performance Chart -->
      <div class="employee-donut-panel min-w-0 overflow-hidden rounded-2xl bg-white p-6">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">أداء الموظفين</h3>

            <p class="mt-1 text-xs text-slate-400">المكالمات والعملاء الجدد والتحويلات</p>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500" dir="ltr">
            <button
              type="button"
              class="flex items-center gap-2 cursor-pointer"
              dir="rtl"
              :aria-pressed="employeeMetric === 'calls'"
              @click="employeeMetric = 'calls'"
            >
              <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
              المكالمات
            </button>
            <button
              type="button"
              class="flex items-center gap-2 cursor-pointer"
              dir="rtl"
              :aria-pressed="employeeMetric === 'newCustomers'"
              @click="employeeMetric = 'newCustomers'"
            >
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              عملاء جدد
            </button>
            <button
              type="button"
              class="flex items-center gap-2 cursor-pointer"
              dir="rtl"
              :aria-pressed="employeeMetric === 'conversions'"
              @click="employeeMetric = 'conversions'"
            >
              <span class="h-2 w-2 rounded-full bg-amber-400"></span>
              التحويلات
            </button>
          </div>
        </div>

        <div class="employee-ring chart-container relative mx-auto shrink-0" dir="ltr">
          <Doughnut
            v-if="employeeMetricTotal > 0"
            ref="employeeChartRef"
            :data="employeeDonutData"
            :options="donutOptions"
          />
          <div
            v-else
            class="flex h-full flex-col items-center justify-center gap-2 text-xs text-gray-500"
            dir="rtl"
            role="status"
          >
            <p>
              {{
                currentEmployeeLoading
                  ? 'جارٍ تحميل أداء الموظفين...'
                  : currentEmployeeError || 'لا توجد قيم لهذا المؤشر في التقرير الحالي'
              }}
            </p>
            <button
              v-if="currentEmployeeError && !isExportingPdf"
              class="text-blue underline"
              @click="loadReportData"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
        <ul
          class="employee-donut-list space-y-4 text-xs text-gray-500"
          tabindex="0"
          aria-label="نسب أداء الموظفين"
        >
          <li
            v-for="employee in employeeDistribution"
            :key="employee.id"
            class="flex items-center justify-between gap-3"
          >
            <span class="flex items-center gap-1.5"
              ><span
                class="h-2 w-2 shrink-0 rounded-full"
                :style="{ backgroundColor: employee.color }"
              ></span
              >{{ employee.name }}</span
            >
            <span class="tabular-nums" dir="ltr" :title="String(employee.value)"
              >{{ employee.percent }}%</span
            >
          </li>
        </ul>
      </div>

      <!-- Visit Success -->
      <div class="min-w-0 overflow-hidden rounded-2xl bg-white p-6">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">معدل نجاح الزيارات</h3>

            <p class="mt-1 text-xs text-gray-400">الزيارات الناجحة لكل يوم</p>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500" dir="ltr">
            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-2 w-2 rounded-full bg-teal-500"></span>
              الزيارات
            </span>
          </div>
        </div>

        <div
          class="chart-scroll visit-success-scroll mt-2"
          dir="ltr"
          tabindex="0"
          aria-label="تمرير مخطط نجاح الزيارات"
        >
          <div
            class="visit-success-canvas chart-container relative h-72"
            :style="{ width: `${Math.max(720, visitSuccessData.labels.length * 110)}px` }"
          >
            <Bar
              v-if="hasChartData(visitSuccessData)"
              ref="visitChartRef"
              :data="visitSuccessData"
              :options="visitBarOptions"
            />
            <p
              v-else
              class="flex h-full items-center justify-center text-[10px] leading-4 text-gray-400"
              dir="rtl"
              role="status"
            >
              {{ isLoading ? 'جارٍ التحميل...' : 'لا يوجد بيانات' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Performance Table -->
    <div class="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div class="border-b border-gray-100 px-7 py-5 text-right">
        <h3 class="text-base font-bold text-gray-900">تقرير الأداء الوظيفي</h3>

        <p class="mt-1 text-[11px] text-gray-400">مقارنة شاملة لجميع الموظفين - هذا الأسبوع</p>
        <p v-if="employeeActionError" role="alert" class="mt-2 text-xs text-red-600">
          {{ employeeActionError }}
        </p>
        <p v-if="employeeActionSuccess" role="status" class="mt-2 text-xs text-emerald-600">
          {{ employeeActionSuccess }}
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-262.5 text-xs">
          <thead class="border-b border-gray-100 bg-white">
            <tr>
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

              <th
                v-for="label in ['الزيارات', 'نجاح الزيارات', 'نقاط الأداء', 'الأداء']"
                :key="label"
                class="whitespace-nowrap px-4 py-3 text-start font-medium text-gray-500"
              >
                {{ label }}
              </th>
              <th v-if="!isExportingPdf" class="w-16 px-4 py-3">الإجراءات</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-if="!employeeRows.length">
              <td
                :colspan="isExportingPdf ? 9 : 10"
                class="px-4 py-8 text-center text-xs text-gray-400"
                role="status"
              >
                {{ isLoading ? 'جارٍ التحميل...' : employeeReportError || 'لا يوجد بيانات' }}
              </td>
            </tr>
            <tr
              v-for="employee in isExportingPdf ? employeeRows : employeePageRows"
              :key="employee.id"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap font-medium text-gray-800">
                    {{ employee.name }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.calls ?? '' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.newCustomers ?? '' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.conversions ?? '' }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.conversionRate == null ? '' : `${employee.conversionRate}%` }}
              </td>

              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.visits ?? '' }}</td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">
                {{ employee.visitSuccessRate == null ? '' : `${employee.visitSuccessRate}%` }}
              </td>
              <td class="px-4 py-3 text-gray-600 tabular-nums">{{ employee.score ?? '' }}</td>
              <td class="px-4 py-3">
                <span
                  v-if="employee.performance"
                  class="inline-flex whitespace-nowrap rounded-md px-3 py-1.5"
                  :class="performanceClass(employee.performance)"
                  >{{ employee.performance }}</span
                >
              </td>
              <td v-if="!isExportingPdf" class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    title="إعادة تعيين كلمة المرور"
                    :aria-label="`إعادة تعيين كلمة مرور ${employee.name}`"
                    disabled
                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 cursor-not-allowed opacity-40"
                  >
                    <Pencil :size="16" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    title="تعطيل الموظف"
                    :aria-label="`تعطيل الموظف ${employee.name}`"
                    disabled
                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 cursor-not-allowed opacity-40"
                  >
                    <Trash2 :size="16" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!isExportingPdf && employeeRows.length"
          class="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-xs text-gray-500"
          dir="rtl"
        >
          <span
            >عرض {{ employeePageStart }}-{{ employeePageEnd }} من أصل
            {{ employeeRows.length }} موظف</span
          >
          <div class="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              class="rounded-md border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="employeePage <= 1"
              @click="employeePage--"
            >
              السابق
            </button>
            <span class="tabular-nums">{{ employeePage }} / {{ employeeTotalPages }}</span>
            <button
              type="button"
              class="rounded-md border border-gray-200 px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="employeePage >= employeeTotalPages"
              @click="employeePage++"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { useEmployees } from '@/composables/useEmployees'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

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

  import { useNotification } from '@/composables/useNotification'
  import { useReportShare } from '@/composables/useReportShare'
  import { exportReportsExcel, exportReportsPdf } from '@/utils/exportReports'
  import { buildPdfFileName } from '@/utils/fileName'
  import { downloadBlob } from '@/utils/downloadFile'
  import { reportsService } from '@/services/reports.service'

  ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
    monthly: 'شهري',
    custom: 'فترة مخصصة'
  }

  const periodLabel = computed(() => periodLabels[period.value] ?? period.value)

  /* ----------------------------------------
   * Date range
   * -------------------------------------- */

  const showDatePicker = ref(false)
  const dateRangeRef = ref(null)
  const shareMenuRef = ref(null)

  const reportToday = new Date()
  const localDate = date =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const dateFrom = ref(localDate(reportToday))
  const dateTo = ref(localDate(reportToday))
  const draftDateFrom = ref(dateFrom.value)
  const draftDateTo = ref(dateTo.value)
  const dateRangeError = ref('')
  function selectPeriod(value) {
    const today = new Date()
    const start = new Date(today)
    if (value === 'weekly') start.setDate(start.getDate() - 6)
    if (value === 'monthly') start.setDate(1)
    period.value = value
    dateFrom.value = localDate(start)
    dateTo.value = localDate(today)
    draftDateFrom.value = dateFrom.value
    draftDateTo.value = dateTo.value
    dateRangeError.value = ''
    showDatePicker.value = false
  }
  function applyDateRange() {
    if (!draftDateFrom.value || !draftDateTo.value || draftDateFrom.value > draftDateTo.value) {
      dateRangeError.value =
        'اختر تاريخ البداية والنهاية، على أن تكون البداية قبل النهاية أو مساوية لها.'
      return
    }
    dateRangeError.value = ''
    period.value = 'custom'
    dateFrom.value = draftDateFrom.value
    dateTo.value = draftDateTo.value
    showDatePicker.value = false
  }
  watch(showDatePicker, open => {
    if (!open) return
    draftDateFrom.value = dateFrom.value
    draftDateTo.value = dateTo.value
    dateRangeError.value = ''
  })

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
  const dailyData = ref({})
  const overviewData = ref({ cards: {}, sources: {}, trend: [] })
  const overviewError = ref('')
  const dailyError = ref('')
  const displayedStats = computed(() => {
    const cards = stats.value.length
      ? stats.value
      : [
          'إجمالي العملاء',
          'تم التحويل المشروع',
          'معدل التحويل',
          'إجمالي المكالمات',
          'الزيارة الميدانية',
          'متوسط وقت التحويل'
        ].map(label => ({ label }))
    return cards.map(stat => ({ ...stat, value: stat.value ?? '' }))
  })

  /* ----------------------------------------
   * Customer sources
   * -------------------------------------- */

  const sourceLegend = ref([])
  const filteredSources = computed(() =>
    sourceLegend.value.filter(
      source => !sourceFilter.value || (source.sourceId ?? source.label) === sourceFilter.value
    )
  )
  const sourcesTotal = ref(null)
  const sourcesError = ref('')

  const sourceChartData = computed(() => ({
    labels: filteredSources.value.map(item => item.label),

    datasets: [
      {
        data: filteredSources.value.map(item => item.percent),
        backgroundColor: filteredSources.value.map(item => item.color),
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

  const conversionSummary = ref(null)
  const conversionError = ref('')
  const conversionTrendRaw = ref({ labels: [], leads: [], conversions: [] })
  const conversionTrendData = computed(() => ({
    labels: conversionTrendRaw.value.labels,
    datasets: [
      {
        label: 'عملاء جدد',
        data: conversionTrendRaw.value.leads,
        borderColor: '#8180FF',
        backgroundColor: '#8180FF',
        borderWidth: 1,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'التحويلات',
        data: conversionTrendRaw.value.conversions,
        borderColor: '#E898FF',
        backgroundColor: '#E898FF',
        borderWidth: 1,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
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

        title: {
          display: true,
          text: 'التاريخ',
          color: '#6B7280',
          font: { size: 11, family: 'Tajawal' }
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
        suggestedMax: 120,
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

        title: {
          display: true,
          text: 'العدد',
          color: '#6B7280',
          font: { size: 11, family: 'Tajawal' }
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
        label: 'نسبة نجاح الزيارات',
        data: visitSuccessRaw.value.visits,
        backgroundColor: '#14B8A6',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }))

  /* ----------------------------------------
   * Employee trend chart
   * -------------------------------------- */

  const employeeTrendDataAll = computed(() => ({
    labels: currentEmployeePerformance.value.map(employee => employee.name),
    datasets: [
      {
        label: 'المكالمات',
        data: currentEmployeePerformance.value.map(employee => employee.calls),
        backgroundColor: '#6366F1',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },
      {
        label: 'عملاء جدد',
        data: currentEmployeePerformance.value.map(employee => employee.newCustomers),
        backgroundColor: '#34D399',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },
      {
        label: 'التحويلات',
        data: currentEmployeePerformance.value.map(employee => employee.conversions),
        backgroundColor: '#FBBF24',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      }
    ]
  }))
  const employeeTrendData = computed(() => ({
    labels: currentEmployeeRows.value.map(employee => employee.name),

    datasets: [
      {
        label: 'المكالمات',
        data: currentEmployeeRows.value.map(employee => employee.calls),
        backgroundColor: '#6366F1',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },

      {
        label: 'عملاء جدد',
        data: currentEmployeeRows.value.map(employee => employee.newCustomers),
        backgroundColor: '#34D399',
        borderRadius: 4,
        borderSkipped: false,
        maxBarThickness: 18
      },
      {
        label: 'التحويلات',
        data: currentEmployeeRows.value.map(employee => employee.conversions),
        backgroundColor: '#FBBF24',
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

  const visitBarOptions = {
    ...barOptions,
    layout: {
      ...barOptions.layout,
      padding: { ...barOptions.layout.padding, top: 18, bottom: 24 }
    },
    scales: {
      ...barOptions.scales,
      x: {
        ...barOptions.scales.x,
        title: {
          display: true,
          text: 'التاريخ',
          color: '#6B7280',
          font: { size: 11, family: 'Tajawal' }
        }
      },
      y: {
        ...barOptions.scales.y,
        min: 0,
        beginAtZero: true,
        grace: '20%',
        ticks: { ...barOptions.scales.y.ticks, stepSize: 1, precision: 0 },
        title: {
          display: true,
          text: 'العدد',
          color: '#6B7280',
          font: { size: 11, family: 'Tajawal' }
        }
      }
    }
  }

  /* ----------------------------------------
   * Employee performance table
   * -------------------------------------- */

  const employeePerformance = ref([])
  const currentEmployeePerformance = ref([])
  const currentEmployeeLoading = ref(false)
  const currentEmployeeError = ref('')
  const reportEmployeeOptions = computed(() => [
    ...new Map(
      [...employeePerformance.value, ...currentEmployeePerformance.value].map(employee => [
        employee.id,
        employee
      ])
    ).values()
  ])
  const currentEmployeeRows = computed(() =>
    currentEmployeePerformance.value.filter(
      employee => !agentFilter.value || employee.id === agentFilter.value
    )
  )
  const employeeReportLoading = ref(false)
  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
    updatingId,
    resettingId,
    actionError: employeeActionError,
    actionSuccess: employeeActionSuccess,
    loadEmployees,
    deactivateEmployee,
    resetEmployeePassword
  } = useEmployees()
  const employeeBusy = computed(() => !!updatingId.value || !!resettingId.value)
  const employeeReportError = ref('')
  const employeeRows = computed(() =>
    employeePerformance.value.filter(
      employee => !agentFilter.value || employee.id === agentFilter.value
    )
  )
  const employeePage = ref(1)
  const employeePageSize = 10
  const employeeTotalPages = computed(() =>
    Math.max(1, Math.ceil(employeeRows.value.length / employeePageSize))
  )
  const employeePageRows = computed(() => {
    const start = (employeePage.value - 1) * employeePageSize
    return employeeRows.value.slice(start, start + employeePageSize)
  })
  const employeePageStart = computed(() =>
    employeeRows.value.length ? (employeePage.value - 1) * employeePageSize + 1 : 0
  )
  const employeePageEnd = computed(() =>
    Math.min(employeePage.value * employeePageSize, employeeRows.value.length)
  )
  const employeeMetric = ref('calls')
  const employeeMetricTotal = computed(() =>
    currentEmployeeRows.value.reduce(
      (sum, employee) => sum + Math.max(0, Number(employee[employeeMetric.value]) || 0),
      0
    )
  )
  const employeeDistribution = computed(() =>
    currentEmployeeRows.value.map((employee, index) => {
      const value = Math.max(0, Number(employee[employeeMetric.value]) || 0)
      return {
        id: employee.id,
        name: employee.name,
        value,
        percent: employeeMetricTotal.value
          ? Math.round((value / employeeMetricTotal.value) * 1000) / 10
          : 0,
        color: ['#2563eb', '#9333ea', '#10b981', '#f59e0b', '#ef4444'][index % 5]
      }
    })
  )
  const employeeDonutData = computed(() => ({
    labels: employeeDistribution.value.map(employee => employee.name),
    datasets: [
      {
        label:
          employeeMetric.value === 'calls'
            ? 'المكالمات'
            : employeeMetric.value === 'newCustomers'
              ? 'عملاء جدد'
              : 'التحويلات',
        data: employeeDistribution.value.map(employee => employee.value),
        backgroundColor: employeeDistribution.value.map(employee => employee.color),
        hoverBackgroundColor: employeeDistribution.value.map(employee => employee.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        borderRadius: 5
      }
    ]
  }))

  /* ----------------------------------------
   * Load report data from API
   * -------------------------------------- */

  function reportParams() {
    return {
      period: period.value,
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
    employeeReportLoading.value = true
    currentEmployeeLoading.value = true
    currentEmployeeError.value = ''
    dailyError.value = ''
    employeeReportError.value = ''
    sourcesError.value = ''
    conversionError.value = ''
    conversionSummary.value = null
    sourcesTotal.value = null
    overviewError.value = ''
    stats.value = []
    dailyData.value = {}
    sourceLegend.value = []
    conversionTrendRaw.value = { labels: [], leads: [], conversions: [] }
    visitSuccessRaw.value = { labels: [], visits: [], newCustomers: [] }
    const params = reportParams()
    const sections = [
      [dailyData, () => reportsService.getDaily(dateTo.value), {}],
      [
        overviewData,
        () => reportsService.getOverview(params),
        { cards: {}, sources: {}, trend: [] }
      ],
      [
        currentEmployeePerformance,
        async () => {
          try {
            return await reportsService.getEmployeePerformance()
          } finally {
            if (request === reportRequest) currentEmployeeLoading.value = false
          }
        },
        []
      ],
      [
        employeePerformance,
        async () => {
          try {
            const rows = await reportsService.getEmployeePerformance(params)
            return rows
          } finally {
            if (request === reportRequest) employeeReportLoading.value = false
          }
        },
        []
      ]
    ]
    await Promise.all(
      sections.map(async ([target, fetch, empty]) => {
        target.value = empty
        try {
          const result = await fetch()
          if (request !== reportRequest) return
          target.value =
            target === overviewData || target === dailyData
              ? result
              : Array.isArray(empty)
                ? Array.isArray(result)
                  ? result
                  : []
                : Object.fromEntries(
                    Object.keys(empty).map(key => [
                      key,
                      Array.isArray(result?.[key]) ? result[key] : []
                    ])
                  )
        } catch (error) {
          if (request === reportRequest) target.value = empty
          if (request === reportRequest && target === overviewData) {
            overviewError.value = error.message || 'تعذّر تحميل ملخص التقارير'
            dailyError.value = overviewError.value
            sourcesError.value = overviewError.value
            conversionError.value = overviewError.value
          }
          if (request === reportRequest && target === dailyData)
            dailyError.value = error.message || 'تعذّر تحميل التقرير اليومي'
          if (request === reportRequest && target === employeePerformance)
            employeeReportError.value = error.message || 'تعذّر تحميل أداء الموظفين'
          if (request === reportRequest && target === currentEmployeePerformance)
            currentEmployeeError.value = error.message || 'تعذّر تحميل أداء الموظفين الحالي'
          if (request === reportRequest && target === stats)
            dailyError.value = error.message || 'تعذّر تحميل التقرير اليومي'
        }
      })
    )
    if (request === reportRequest) {
      const overview = overviewData.value
      const cards = overview.cards ?? {}
      const daily = dailyData.value ?? {}
      stats.value = [
        {
          label: 'إجمالي العملاء',
          value: cards.totalLeads ?? daily.totalLeads ?? daily.newLeads ?? ''
        },
        { label: 'تم التحويل المشروع', value: cards.converted ?? daily.converted ?? '' },
        {
          label: 'معدل التحويل',
          value: cards.conversionRate ?? daily.conversionRate ?? '',
          unit: '%'
        },
        { label: 'إجمالي المكالمات', value: cards.totalCalls ?? daily.totalCalls ?? '' },
        {
          label: 'الزيارة الميدانية',
          value: cards.fieldVisitRate ?? daily.visits ?? daily.fieldVisitRate ?? '',
          unit: cards.fieldVisitRate != null && daily.visits == null ? '%' : ''
        },
        {
          label: 'متوسط وقت التحويل',
          value: cards.avgConversionDays ?? daily.avgConversionDays ?? '',
          unit: 'يوم'
        }
      ]
      const sourceRows = Array.isArray(overview.sources?.rows) ? overview.sources.rows : []
      sourceLegend.value = sourceRows.map(row => ({
        ...row,
        label: row.name,
        color: row.color || '#94a3b8'
      }))
      sourcesTotal.value = overview.sources?.total ?? null
      if (!sourceRows.some(row => row.sourceId === sourceFilter.value)) sourceFilter.value = ''
      const trend = overview.trend ?? []
      conversionTrendRaw.value = {
        labels: trend.map(row => row.date),
        leads: trend.map(row => row.leads),
        conversions: trend.map(row => row.converted)
      }
      visitSuccessRaw.value = {
        labels: trend.map(row => row.date),
        visits: trend.map(row => row.visits),
        newCustomers: trend.map(row => row.leads)
      }
      conversionSummary.value = {
        totalLeads: cards.totalLeads,
        converted: cards.converted,
        conversionRate: cards.conversionRate
      }
    }
    if (request === reportRequest) {
      isLoading.value = false
      if (!reportEmployeeOptions.value.some(employee => employee.id === agentFilter.value))
        agentFilter.value = ''
    }
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
   * Export
   * -------------------------------------- */

  const reportRoot = ref(null)
  const isExportingPdf = ref(false)

  const conversionChartRef = ref(null)
  const employeeChartRef = ref(null)
  const visitChartRef = ref(null)
  const sourceChartRef = ref(null)

  const isExportingExcel = ref(false)
  const notification = useNotification()
  const hasExportData = computed(() =>
    Boolean(
      overviewData.value?.trend?.length ||
      overviewData.value?.sources?.rows?.length ||
      employeeRows.value.length ||
      displayedStats.value.some(stat => stat.value !== '')
    )
  )

  function getChartInstance(componentRef) {
    const component = componentRef?.value
    const canvas = component?.canvas ?? component?.$el ?? component?.$refs?.canvas
    if (canvas instanceof HTMLCanvasElement)
      return ChartJS.getChart(canvas) ?? component?.chart ?? null
    return component?.chart ?? null
  }

  function chartImage(componentRef) {
    const chart = getChartInstance(componentRef)
    return chart?.canvas ? chart.toBase64Image('image/png', 1) : ''
  }

  async function highResolutionChartImage(type, data, options, itemCount) {
    await document.fonts?.ready
    const baseWidth =
      type === 'doughnut' ? 900 : Math.max(1500, Math.min(3000, 900 + itemCount * 110))
    const baseHeight = type === 'doughnut' ? 760 : 720
    const host = document.createElement('div')
    host.style.cssText = `position:absolute;left:-20000px;top:0;width:${baseWidth}px;height:${baseHeight}px;background:#fff;`
    const canvas = document.createElement('canvas')
    canvas.width = baseWidth
    canvas.height = baseHeight
    canvas.style.width = `${baseWidth}px`
    canvas.style.height = `${baseHeight}px`
    host.appendChild(canvas)
    document.body.appendChild(host)
    const exportOptions = JSON.parse(JSON.stringify(options || {}))
    exportOptions.responsive = false
    exportOptions.maintainAspectRatio = false
    exportOptions.animation = false
    exportOptions.devicePixelRatio = 3
    const chart = new ChartJS(canvas, {
      type,
      data: JSON.parse(JSON.stringify(data)),
      options: exportOptions
    })
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const image = chart.toBase64Image('image/png', 1)
    chart.destroy()
    host.remove()
    return image
  }

  async function exportPayload(highResolution = false) {
    const meta = {
      from: dateFrom.value,
      to: dateTo.value,
      filters:
        'الفترة: ' +
        periodLabel.value +
        ' | الموظف: ' +
        (reportEmployeeOptions.value.find(employee => employee.id === agentFilter.value)?.name ||
          'الكل') +
        ' | المصدر: ' +
        (sourceLegend.value.find(source => (source.sourceId ?? source.label) === sourceFilter.value)
          ?.label || 'الكل'),
      exportedAt: new Date().toLocaleString('ar', {
        calendar: 'gregory',
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }
    const cards = displayedStats.value.map(stat => ({
      label: stat.label,
      value: stat.value,
      unit: stat.unit
    }))
    const trend = (overviewData.value?.trend ?? []).map(row => ({
      date: row.date,
      leads: row.leads,
      converted: row.converted,
      calls: row.calls,
      visits: row.visits
    }))
    const sources = (overviewData.value?.sources?.rows ?? []).filter(
      row => !sourceFilter.value || row.sourceId === sourceFilter.value
    )
    const employees = currentEmployeeRows.value.map(row => ({
      name: row.name,
      calls: row.calls,
      newCustomers: row.newCustomers,
      conversions: row.conversions
    }))
    const employeeTable = employeeRows.value.map(row => ({
      name: row.name,
      calls: row.calls,
      newCustomers: row.newCustomers,
      conversions: row.conversions,
      conversionRate: row.conversionRate,
      interested: row.interested,
      noAnswer: row.noAnswer,
      avgDurationSec: row.avgDurationSec,
      visits: row.visits,
      visitSuccessRate: row.visitSuccessRate,
      score: row.score,
      performance: row.performance
    }))
    const charts = highResolution
      ? {
          conversion: await highResolutionChartImage(
            'line',
            conversionTrendData.value,
            lineOptions,
            trend.length
          ),
          sources: await highResolutionChartImage(
            'doughnut',
            sourceChartData.value,
            donutOptions,
            sources.length
          ),
          employees: await highResolutionChartImage(
            'doughnut',
            employeeDonutData.value,
            donutOptions,
            employees.length
          ),
          visits: await highResolutionChartImage(
            'bar',
            visitSuccessData.value,
            visitBarOptions,
            trend.length
          )
        }
      : {
          conversion: chartImage(conversionChartRef),
          sources: chartImage(sourceChartRef),
          employees: chartImage(employeeChartRef),
          visits: chartImage(visitChartRef)
        }
    const clone = value => JSON.parse(JSON.stringify(value))
    const exportCharts = {
      conversion: {
        type: 'line',
        title: '\u0645\u0639\u062f\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644',
        ...clone(conversionTrendData.value),
        options: clone(lineOptions)
      },
      sources: {
        type: 'doughnut',
        title:
          '\u062a\u0648\u0632\u064a\u0639 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621',
        ...clone(sourceChartData.value),
        options: clone(donutOptions)
      },
      employees: {
        type: 'doughnut',
        title: '\u0623\u062f\u0627\u0621 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646',
        ...clone(employeeDonutData.value),
        options: clone(donutOptions)
      },
      visits: {
        type: 'bar',
        title:
          '\u0645\u0639\u062f\u0644 \u0646\u062c\u0627\u062d \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a',
        ...clone(visitSuccessData.value),
        options: clone(visitBarOptions)
      }
    }
    const pdfFontUrl = new URL('fonts/report-arabic.ttf', document.baseURI).toString()
    return {
      meta,
      pdfFontUrl,
      cards,
      trend,
      sources,
      employees,
      visitTrend: trend.map(row => ({ date: row.date, visits: row.visits })),
      employeeTable,
      exportCharts,
      charts
    }
  }

  async function exportExcel() {
    if (isExportingExcel.value || isLoading.value) return
    const failedSection = [
      overviewError.value,
      dailyError.value,
      sourcesError.value,
      conversionError.value,
      employeeReportError.value,
      currentEmployeeError.value
    ].find(Boolean)
    if (failedSection) {
      notification.error('تعذر تصدير التقرير لأن جزءاً من البيانات لم يكتمل تحميله')
      return
    }
    isExportingExcel.value = true
    try {
      const payload = await exportPayload(true)
      if (
        !payload.trend.length &&
        !payload.sources.length &&
        !payload.employeeTable.length &&
        !payload.cards.some(card => card.value !== '')
      ) {
        notification.error('لا توجد بيانات قابلة للتصدير')
        return
      }
      const blob = await exportReportsExcel(payload)
      const stamp = dateFrom.value + '_' + dateTo.value
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'تقرير_التقارير_والتحليلات_' + stamp + '.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      notification.success('تم تصدير التقرير إلى Excel بنجاح')
    } catch (error) {
      console.error('Excel export failed:', error)
      notification.error(error.message || 'حدث خطأ أثناء تصدير التقرير')
    } finally {
      isExportingExcel.value = false
    }
  }

  async function captureReportPdf() {
    if (isExportingPdf.value || isLoading.value) return
    const failedSection = [
      overviewError.value,
      dailyError.value,
      sourcesError.value,
      conversionError.value,
      employeeReportError.value,
      currentEmployeeError.value
    ].find(Boolean)
    if (failedSection) {
      notification.error('تعذر تصدير التقرير لأن جزءاً من البيانات لم يكتمل تحميله')
      return
    }
    const payload = await exportPayload(false)
    if (
      !payload.trend.length &&
      !payload.sources.length &&
      !payload.employeeTable.length &&
      !payload.cards.some(card => card.value !== '')
    ) {
      notification.error('لا توجد بيانات قابلة للتصدير')
      return
    }
    isExportingPdf.value = true
    try {
      return await exportReportsPdf(payload)
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

  watch([agentFilter, sourceFilter], invalidatePreparedReport)
  watch(employeeRows, () => {
    employeePage.value = 1
  })
  watch(employeeMetric, invalidatePreparedReport)
  watch([period, dateFrom, dateTo], () => {
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
    if (isShareBusy.value || isExportingPdf.value || isLoading.value || !hasExportData.value) {
      return
    }

    try {
      const blob = await captureReportPdf()
      if (blob)
        downloadBlob(
          blob,
          buildPdfFileName('تقرير-التقارير-والتحليلات-' + dateFrom.value + '-' + dateTo.value)
        )
    } catch (error) {
      console.error('Report PDF export failed:', error)
      notification.error(error.message || 'تعذر تصدير التقرير إلى PDF')
    }
  }
</script>

<style scoped>
  .employee-donut-panel {
    height: 450px;
    display: flex;
    flex-direction: column;
  }
  .employee-ring {
    width: 180px;
    height: 180px;
    margin-block: 4px 20px;
    filter: drop-shadow(0 3px 8px rgb(0 0 0 / 12%));
  }
  .employee-donut-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
  }
  .report-main-charts {
    gap: 28px;
  }
  .conversion-panel,
  .sources-panel {
    border-radius: 16px;
    padding: 24px;
  }
  .conversion-panel {
    display: flex;
    flex-direction: column;
    height: 450px;
  }
  .conversion-heading {
    min-height: 44px;
    margin-bottom: 28px;
  }
  .conversion-heading h3 {
    font-size: 18px;
    line-height: 26px;
  }
  .conversion-heading p {
    font-size: 12px;
    line-height: 18px;
    color: #9caab8;
  }
  .conversion-heading > div:last-child {
    font-size: 12px;
  }
  .conversion-canvas {
    height: 320px;
    min-width: 100%;
  }
  .employee-canvas {
    height: 280px;
    min-width: 100%;
  }
  .chart-scroll {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    overscroll-behavior-x: contain;
    flex: 1;
  }
  .visit-success-scroll {
    padding-top: 24px;
    padding-bottom: 36px;
    box-sizing: border-box;
  }
  .sources-panel > h3 {
    font-size: 18px;
    line-height: 26px;
    font-weight: 700;
  }
  .sources-panel {
    height: 450px;
    display: flex;
    flex-direction: column;
  }
  .sources-panel > h3,
  .sources-panel > p {
    flex-shrink: 0;
  }
  .sources-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .sources-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-gutter: stable;
    padding-inline-end: 6px;
  }
  .source-ring {
    margin-block: 8px 12px;
  }
  .report-secondary-charts > div {
    min-height: 400px;
  }
  @media (min-width: 1024px) {
    .report-main-charts {
      grid-template-columns: minmax(0, 3.17fr) minmax(240px, 1fr);
    }
  }
  @media (max-width: 639px) {
    .conversion-panel,
    .sources-panel {
      padding: 16px;
    }
    .conversion-heading h3 {
      font-size: 14px;
    }
    .conversion-panel {
      height: 450px;
    }
    .conversion-canvas {
      height: 300px;
    }
  }
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
