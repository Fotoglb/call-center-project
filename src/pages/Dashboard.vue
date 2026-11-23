<template>
  <div v-if="isLoading" class="flex items-center justify-center py-24 text-sm text-gray-400">
    ...جارٍ تحميل بيانات لوحة التحكم
  </div>

  <div v-else-if="loadError" class="flex flex-col items-center justify-center gap-3 py-24 text-center">
    <p class="text-sm text-red-500">تعذر تحميل بيانات لوحة التحكم</p>
    <button
      class="text-xs text-white bg-gray-900 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors"
      @click="loadDashboard"
    >
      إعادة المحاولة
    </button>
  </div>

  <div v-else class="space-y-6">
    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-50 p-4 text-center min-h-37.25 lg:items-stretch lg:justify-between lg:gap-0 lg:text-start"
      >
        <div class="hidden w-9 h-9 rounded-lg bg-gray-200 lg:block"></div>
        <div class="space-y-1">
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-sm font-medium text-gray-700">{{ stat.label }}</p>
          <p class="text-xs text-gray-400">{{ stat.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- Line Chart -->
      <div class="order-2 bg-gray-50 rounded-xl p-5 lg:order-0 lg:col-span-2">
        <div class="mb-4 flex items-start justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">أداء المبيعات الأسبوعي</h3>
            <p class="text-xs text-gray-400 mt-0.5">العملاء الجدد و المكالمات - آخر 7 أيام</p>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-500" dir="ltr">
            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-1 w-7 rounded-full bg-indigo-500"></span>
              المكالمات
            </span>
            <span class="flex items-center gap-1.5" dir="rtl">
              <span class="h-1 w-7 rounded-full bg-pink-400"></span>
              عملاء جدد
            </span>
          </div>
        </div>
        <Line :data="lineChartData" :options="lineChartOptions" class="max-h-52" />
      </div>

      <!-- Right Column -->
      <div class="order-1 flex flex-col gap-4 lg:order-0">
        <!-- Donut Chart -->
        <div class="bg-gray-50 rounded-xl p-5 flex-1">
          <div class="mb-3">
            <h3 class="text-sm font-semibold text-gray-900">توزيع مصادر العملاء</h3>
            <p class="text-xs text-gray-400 mt-0.5">هذا الشهر</p>
          </div>
          <div class="flex flex-row items-center justify-between gap-4 lg:flex-col">
            <div class="w-28 h-28 shrink-0">
              <Doughnut :data="donutChartData" :options="donutChartOptions" />
            </div>
            <ul class="space-y-2.5 text-xs flex-1">
              <li
                v-for="(item, i) in donutLegend"
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
    </div>

    <!-- Charts Row 2 — Area Chart full width -->
    <div class="bg-gray-50 rounded-xl p-5">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">أداء فريق المبيعات</h3>
          <p class="text-xs text-gray-400 mt-0.5">المكالمات والتحويلات أول موظف - هذا الأسبوع</p>
        </div>
        <button
          v-if="permissions.canOpen('/reports')"
          class="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white cursor-pointer"
          @click="router.push({ name: 'Reports' })"
        >
          عرض التقرير الكامل
        </button>
      </div>
      <Line :data="areaChartData" :options="areaChartOptions" class="max-h-44" />
    </div>

    <!-- Bottom Row: Activity Log (RIGHT in RTL) + Upcoming Visits (LEFT in RTL) -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- Activity Log — col-span-1 → RIGHT in RTL -->
      <div class="bg-gray-50 rounded-xl p-5 lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">سجل النشاطات الأخيرة</h3>
            <p class="text-xs text-gray-400 mt-0.5">آخر التحديثات في الوقت الفعلي</p>
          </div>
          <span
            class="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-3 py-1.5"
          >
            مباشر
          </span>
        </div>
        <ul v-if="activities.length" class="activity-list space-y-4" tabindex="0" aria-label="سجل النشاطات الأخيرة">
          <li v-for="activity in activities" :key="activity.id" class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-md bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0"
            >
              {{ initials(activity.user) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-700 leading-relaxed">
                <span class="font-semibold">{{ activity.user }}</span>
                {{ activity.action }}
                <span v-if="activity.target" class="font-semibold text-gray-900">
                  [ {{ activity.target }} ]</span
                >
              </p>
            </div>
            <div class="flex items-center gap-1 text-gray-400 shrink-0">
              <Clock :size="11" />
              <span class="text-xs tabular-nums">{{ activity.time }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-center text-xs text-gray-400 py-8">لا توجد نشاطات حتى الآن</p>
      </div>

      <!-- Upcoming Visits — col-span-2 → LEFT in RTL -->
      <div class="bg-gray-50 rounded-xl p-5">
        <!-- Section header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div
              class="
            "
            >
              <h3 class="text-sm font-semibold text-gray-900">الزيارات القادمة</h3>
              <p class="text-xs text-gray-400">خلال 48 ساعة</p>
            </div>
          </div>

          <button class="text-xs bg-gray-100 px-4 py-2 rounded-md cursor-pointer font-medium">
            عرض الكل
          </button>
        </div>

        <!-- Visit cards -->
        <ul v-if="upcomingVisits.length" class="">
          <li
            v-for="visit in upcomingVisits"
            :key="visit.id"
            class="flex items-center gap-3 py-3 bg-white mb-2 px-2 rounded-lg transition-colors"
          >
            <!-- Customer info (RIGHT in RTL = first in DOM) -->
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ visit.client }}</p>
              <p class="text-xs text-gray-400 my-2">{{ visit.type }}</p>

              <!-- Absolute time (MIDDLE) -->
              <div class="flex items-center gap-1 text-xs text-gray-400 shrink-0 min-w-22.5">
                <Clock :size="12" />
                <span>{{ visit.time }}</span>
              </div>
            </div>

            <!-- Countdown + status badge (LEFT in RTL = last in DOM) -->
            <div class="flex flex-col items-end justify-between self-stretch shrink-0">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="visitStatusClass(visit.status)"
              >
                {{ visit.status }}
              </span>
              <span class="text-xs text-gray-500">{{ visit.agent }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-center text-xs text-gray-400 py-8">لا توجد زيارات قادمة</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Clock } from '@lucide/vue'
  import { Line, Doughnut } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
  } from 'chart.js'
  import { dashboardService } from '@/services/dashboard.service'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement
  )

  const router = useRouter()

  const isLoading = ref(true)
  const loadError = ref(null)

  const stats = ref([])
  const weeklyPerformance = ref({ labels: [], calls: [], newCustomers: [] })
  const donutLegend = ref([])
  const teamPerformance = ref({ labels: [], calls: [], transfers: [] })
  const activities = ref([])
  const upcomingVisits = ref([])
  function mapActivity(item) {
    return {
      id: item.id,
      user: item.userId?.name ?? '—',
      action: item.description ?? item.action ?? '',
      target: '',
      time: Number.isFinite(Date.parse(item.createdAt)) ? new Date(item.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '—'
    }
  }

  const lineChartData = computed(() => ({
    labels: weeklyPerformance.value.labels,
    datasets: [
      {
        label: 'المكالمات',
        data: weeklyPerformance.value.calls,
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 7,
        pointHitRadius: 12,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#6366F1',
        pointBorderWidth: 0,
        clip: false
      },
      {
        label: 'عملاء جدد',
        data: weeklyPerformance.value.newCustomers,
        borderColor: '#F472B6',
        backgroundColor: '#F472B6',
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
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

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        offset: false,
        bounds: 'ticks',
        grid: { display: true, color: '#ECEEF2', lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: 11 }, color: '#9CA3AF' }
      },
      y: {
        min: 0,
        max: 120,
        beginAtZero: true,
        grid: { display: true, color: '#ECEEF2', lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: { stepSize: 40, font: { size: 11 }, color: '#9CA3AF' }
      }
    }
  }

  const donutChartData = computed(() => ({
    labels: donutLegend.value.map(i => i.label),
    datasets: [
      {
        data: donutLegend.value.map(i => i.percent),
        backgroundColor: donutLegend.value.map(i => i.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }))

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: { legend: { display: false } }
  }

  const areaChartData = computed(() => ({
    labels: teamPerformance.value.labels,
    datasets: [
      {
        label: 'المكالمات',
        data: teamPerformance.value.calls,
        borderColor: '#14B8A6',
        borderWidth: 2,
        tension: 0.5,
        fill: false,
        pointRadius: 0
      },
      {
        label: 'التحويلات',
        data: teamPerformance.value.transfers,
        borderColor: '#F472B6',
        borderWidth: 2,
        tension: 0.5,
        fill: false,
        pointRadius: 0
      }
    ]
  }))

  const areaChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' } },
      y: { grid: { color: '#F9FAFB' }, ticks: { font: { size: 11 }, color: '#9CA3AF' } }
    }
  }

  function visitStatusClass(status) {
    if (status === 'مؤكدة') return 'bg-emerald-50 text-emerald-600'
    if (status === 'مباشر') return 'bg-blue-50 text-blue-600'
    if (status === 'قيد التأكيد') return 'bg-amber-50 text-amber-600'
    if (status === 'ملغي') return 'bg-red-50 text-red-500'
    return 'bg-gray-100 text-gray-500'
  }

  function initials(name) {
    return `${name.slice(0, 1)} ${name.slice(1, 2)}`
  }

  async function loadDashboard() {
    isLoading.value = true
    loadError.value = null
    try {
      const overview = await dashboardService.getOverview()
      stats.value = overview.stats
      weeklyPerformance.value = { labels: [], calls: [], newCustomers: [] }
      donutLegend.value = []
      teamPerformance.value = { labels: [], calls: [], transfers: [] }
      activities.value = overview.recentActivity.map(mapActivity)
      upcomingVisits.value = []
    } catch (err) {
      loadError.value = err
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadDashboard)
</script>

<style scoped>
.activity-list {
  max-height: 360px;
  overflow-y: auto;
  padding-inline-end: 6px;
  scrollbar-width: thin;
  overscroll-behavior: contain;
}
</style>
