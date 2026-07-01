<template>
  <div class="space-y-6">

    <!-- Stats Row -->
    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-gray-200 p-4 space-y-1"
      >
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-sm font-medium text-gray-700">{{ stat.label }}</p>
        <p class="text-xs text-gray-400">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-3 gap-4">

      <!-- Line Chart -->
      <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-gray-900">أداء المبيعات الأسبوعي</h3>
          <p class="text-xs text-gray-400 mt-0.5">المكالمات والتحويلات - هذا الأسبوع</p>
        </div>
        <Line :data="lineChartData" :options="lineChartOptions" class="max-h-52" />
      </div>

      <!-- Right Column -->
      <div class="flex flex-col gap-4">

        <!-- Mini Stats -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-xl font-bold text-gray-900">250</p>
            <p class="text-xs text-gray-500 mt-1">عملاء جدد</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-xl font-bold text-gray-900">1,290</p>
            <p class="text-xs text-gray-500 mt-1">المكالمات</p>
          </div>
        </div>

        <!-- Donut Chart -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex-1">
          <div class="mb-3">
            <h3 class="text-sm font-semibold text-gray-900">توزيع مصادر العملاء</h3>
            <p class="text-xs text-gray-400 mt-0.5">هذا الأسبوع</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-28 h-28 shrink-0">
              <Doughnut :data="donutChartData" :options="donutChartOptions" />
            </div>
            <ul class="space-y-1.5 text-xs flex-1">
              <li v-for="(item, i) in donutLegend" :key="i" class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: item.color }" />
                  {{ item.label }}
                </span>
                <span class="text-gray-500 font-medium">{{ item.percent }}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 — Area Chart full width -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">أداء فريق المبيعات</h3>
          <p class="text-xs text-gray-400 mt-0.5">المكالمات والتحويلات أول موظف - هذا الأسبوع</p>
        </div>
        <button class="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
          عرض التقرير الكامل
        </button>
      </div>
      <Line :data="areaChartData" :options="areaChartOptions" class="max-h-44" />
      <div class="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
        <div class="text-end">
          <p class="text-xs font-semibold text-gray-800">أحمد الراشد</p>
          <p class="text-xs text-gray-400">أفضل موظف</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">أ</div>
      </div>
    </div>

    <!-- Bottom Row: Upcoming Visits + Activity Log -->
    <div class="grid grid-cols-3 gap-4">

      <!-- Upcoming Visits -->
      <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">الزيارات القادمة</h3>
          <button class="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">عرض الكل</button>
        </div>

        <!-- Table -->
        <div class="overflow-hidden">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-start pb-3 text-gray-400 font-medium">العميل</th>
                <th class="text-start pb-3 text-gray-400 font-medium">نوع الزيارة</th>
                <th class="text-start pb-3 text-gray-400 font-medium">المسؤول</th>
                <th class="text-start pb-3 text-gray-400 font-medium">الموعد</th>
                <th class="text-start pb-3 text-gray-400 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="visit in upcomingVisits" :key="visit.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-3 font-medium text-gray-800">{{ visit.client }}</td>
                <td class="py-3 text-gray-500">{{ visit.type }}</td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                      {{ visit.agentInitials }}
                    </div>
                    <span class="text-gray-600">{{ visit.agent }}</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">{{ visit.time }}</td>
                <td class="py-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="visitStatusClass(visit.status)"
                  >
                    {{ visit.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">سجل النشاطات الأخيرة</h3>
          <button class="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">عرض الكل</button>
        </div>
        <ul class="space-y-4">
          <li v-for="activity in activities" :key="activity.id" class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
              {{ activity.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-700 leading-relaxed">
                <span class="font-semibold">{{ activity.user }}</span>
                {{ activity.action }}
                <span v-if="activity.target" class="font-semibold text-gray-900"> {{ activity.target }}</span>
              </p>
            </div>
            <span class="text-xs text-gray-400 shrink-0 tabular-nums">{{ activity.time }}</span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend, ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend, ArcElement,
)

const stats = [
  { value: '92%',   label: 'أداء الفريق',    sub: 'موسمية الأسبوع' },
  { value: '18.5%', label: 'معدل التحويل',   sub: 'من الأسبوع' },
  { value: '40',    label: 'زيارة مجدولة',   sub: 'خلال 7 أيام' },
  { value: '90',    label: 'عملاء مهتمون',   sub: 'مشاركة في الأسبوع' },
  { value: '1,290', label: 'مكالمات اليوم',  sub: 'من أصل 1400 مستهدف' },
  { value: '250',   label: 'عملاء جدد',      sub: 'هدف الأسبوع' },
]

const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

const lineChartData = {
  labels: days,
  datasets: [
    {
      label: 'المكالمات',
      data: [65, 72, 68, 85, 90, 88, 95],
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#6366F1',
    },
    {
      label: 'التحويلات',
      data: [40, 55, 48, 60, 72, 65, 78],
      borderColor: '#C084FC',
      backgroundColor: 'rgba(192,132,252,0.08)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#C084FC',
    },
  ],
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
    y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
  },
}

const donutLegend = [
  { label: 'جوجل الويب',    percent: 30, color: '#3B82F6' },
  { label: 'سوشيال ميديا', percent: 27, color: '#06B6D4' },
  { label: 'إعلان عميل',   percent: 18, color: '#10B981' },
  { label: 'تسويق حول',    percent: 12, color: '#F59E0B' },
  { label: 'الأخرى',        percent:  9, color: '#EF4444' },
]

const donutChartData = {
  labels: donutLegend.map(i => i.label),
  datasets: [{
    data: donutLegend.map(i => i.percent),
    backgroundColor: donutLegend.map(i => i.color),
    borderWidth: 0,
    hoverOffset: 4,
  }],
}

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '70%',
  plugins: { legend: { display: false } },
}

const areaChartData = {
  labels: days,
  datasets: [
    {
      label: 'المكالمات',
      data: [30, 55, 45, 70, 85, 75, 90],
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20,184,166,0.15)',
      borderWidth: 2,
      tension: 0.5,
      fill: true,
      pointRadius: 0,
    },
    {
      label: 'التحويلات',
      data: [20, 35, 30, 50, 60, 55, 65],
      borderColor: '#F472B6',
      backgroundColor: 'rgba(244,114,182,0.12)',
      borderWidth: 2,
      tension: 0.5,
      fill: true,
      pointRadius: 0,
    },
  ],
}

const areaChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
    y: { grid: { color: '#F9FAFB' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
  },
}

const upcomingVisits = [
  { id: 1, client: 'عبد الله الخالدي', type: 'زيارة مبدأية',  agent: 'أحمد محمد', agentInitials: 'أح', time: 'اليوم 1:30',  status: 'متابعة' },
  { id: 2, client: 'عبد الله الخالدي', type: 'زيارة مبدأية',  agent: 'أحمد محمد', agentInitials: 'أح', time: 'اليوم 3:30',  status: 'متابعة' },
  { id: 3, client: 'علي إبراهيم',      type: 'زيارة ميدانية', agent: 'سارة أحمد', agentInitials: 'سا', time: 'اليوم 5:00',  status: 'كتابة'  },
  { id: 4, client: 'محمد السالم',      type: 'زيارة مبدأية',  agent: 'عمر خالد',  agentInitials: 'عم', time: 'غدا 10:00',   status: 'غير نشط' },
  { id: 5, client: 'نورا المحمد',      type: 'زيارة ميدانية', agent: 'فاطمة حسن', agentInitials: 'فا', time: 'غدا 1:00',    status: 'متابعة' },
]

function visitStatusClass(status) {
  if (status === 'متابعة')  return 'bg-emerald-50 text-emerald-600'
  if (status === 'كتابة')   return 'bg-blue-50 text-blue-600'
  if (status === 'غير نشط') return 'bg-orange-50 text-orange-500'
  return 'bg-gray-100 text-gray-500'
}

const activities = [
  { id: 1, initials: 'أح', user: 'أحمد محمد',  action: 'أضاف عميل جديد |',        target: 'عبد الله القاسم', time: '5 د'  },
  { id: 2, initials: 'سا', user: 'سارة أحمد',  action: 'أجرت مكالمة مع',           target: 'نورا المحمد',     time: '24 د' },
  { id: 3, initials: 'مع', user: 'محمد علي',   action: 'أضاف زيارة مبدأية |',      target: 'فيصل المثنى',    time: '40 ث' },
  { id: 4, initials: 'فا', user: 'فاطمة حسن',  action: 'جدولت زيارة في التشرين',   target: '',                time: '55 ث' },
  { id: 5, initials: 'سا', user: 'سارة أحمد',  action: 'أجرت وصول إلى |',          target: 'خالد الزهراني',  time: '1 س'  },
]
</script>
