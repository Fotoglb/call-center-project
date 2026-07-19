<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-gray-400 mb-1">إدارة العملاء / {{ customer.name }}</p>
        <h1 class="text-xl font-bold text-gray-900">{{ customer.name }}</h1>
        <p class="text-xs text-gray-400 mt-0.5">ملف العميل الكامل</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="router.back()"
        >
          <ArrowRight :size="14" />
          العودة
        </button>
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <Pencil :size="14" />
          تعديل
        </button>
        <button
          class="flex items-center gap-1.5 text-xs text-white bg-indigo-600 rounded-lg px-3 py-2 hover:bg-indigo-700 cursor-pointer transition-colors"
        >
          <PhoneCall :size="14" />
          الاتصال الآن
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-5">
      <!-- RIGHT: Sidebar -->
      <div class="space-y-5">
        <!-- Customer Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0"
            >
              {{ customer.name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">{{ customer.name }}</p>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                :class="statusClass(customer.status)"
              >
                {{ customer.status }}
              </span>
            </div>
          </div>
          <div class="space-y-2.5">
            <div class="flex items-center gap-2 text-xs">
              <Phone :size="13" class="text-gray-400 shrink-0" />
              <span class="text-gray-600 tabular-nums" dir="ltr">{{ customer.phone }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Mail :size="13" class="text-gray-400 shrink-0" />
              <span class="text-gray-600" dir="ltr">{{ customer.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <IdCard :size="13" class="text-gray-400 shrink-0" />
              <span class="text-gray-600 tabular-nums">{{ customer.nationalId }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">تفاصيل العميل</h3>
          <dl class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <MapPin :size="13" class="shrink-0" />
                موقع الخدمات
              </dt>
              <dd class="font-semibold text-gray-800">{{ customer.location }}</dd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Building2 :size="13" class="shrink-0" />
                نوع العمل
              </dt>
              <dd class="font-semibold text-gray-800">{{ customer.workType }}</dd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Briefcase :size="13" class="shrink-0" />
                نوع المشروع
              </dt>
              <dd class="font-semibold text-gray-800">{{ customer.projectType }}</dd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Wallet :size="13" class="shrink-0" />
                الميزانية
              </dt>
              <dd class="font-semibold text-gray-800 tabular-nums">{{ customer.budget }} ريال</dd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Calendar :size="13" class="shrink-0" />
                تاريخ الإنشاء
              </dt>
              <dd class="font-semibold text-gray-800 tabular-nums">{{ customer.createdAt }}</dd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Star :size="13" class="shrink-0" />
                الأولوية
              </dt>
              <dd class="font-semibold text-gray-800">{{ customer.priority }}</dd>
            </div>
          </dl>
        </div>

        <!-- Assigned Agent -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">الموظف المسؤول</h3>
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0"
            >
              {{ customer.assignedAgent.name.charAt(0) }}
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">{{ customer.assignedAgent.name }}</p>
              <p class="text-xs text-gray-400">{{ customer.assignedAgent.role }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in statCards"
            :key="stat.label"
            class="bg-white rounded-xl border border-gray-200 p-4 text-center"
          >
            <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- LEFT: col-span-2 -->
      <div class="col-span-2 space-y-5">
        <!-- Interest Score Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5">
          <div>
            <div class="flex items-baseline gap-1">
              <p class="text-sm font-bold text-gray-900">نقاط الاهتمام</p>
            </div>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-xs text-gray-400">100/</span>
              <span class="text-2xl font-bold text-gray-900">{{ customer.interestScore }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-1 leading-relaxed">
              احتمالية التحويل مرتفعة جداً – يُنصح بالمتابعة العاجلة
            </p>
          </div>
          <div class="relative w-20 h-20 shrink-0">
            <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F5F9" stroke-width="8" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#6366F1"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference * (1 - customer.interestScore / 100)"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold text-gray-900">{{ customer.interestScore }}%</span>
            </div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="bg-white rounded-xl border border-gray-200 flex flex-col">
          <!-- Tabs -->
          <div class="flex items-center gap-1 px-5 pt-4 border-b border-gray-100 shrink-0">
            <button
              v-for="tab in activityTabs"
              :key="tab.key"
              class="px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer"
              :class="
                activeActivityTab === tab.key
                  ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/40'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="activeActivityTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Timeline -->
          <div class="p-5 space-y-3">
            <div v-for="entry in filteredActivity" :key="entry.id" class="flex gap-3">
              <span class="w-5 h-5 rounded-md border border-gray-300 shrink-0 mt-0.5"></span>
              <div class="flex-1 min-w-0 bg-gray-50 rounded-xl p-3">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-800">{{ entry.title }}</span>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="entry.tagClass"
                      >{{ entry.tag }}</span
                    >
                  </div>
                  <span class="text-xs text-gray-400 tabular-nums shrink-0"
                    >{{ entry.time }} {{ entry.period }} - {{ entry.date }}</span
                  >
                </div>
                <p class="text-xs text-gray-500 leading-relaxed mb-1">{{ entry.note }}</p>
                <p class="text-xs text-gray-400">{{ entry.meta }}</p>
              </div>
            </div>

            <button
              class="w-full text-center text-xs font-medium text-gray-500 hover:text-gray-700 py-2 cursor-pointer transition-colors"
            >
              تحميل المزيد
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    ArrowRight,
    Pencil,
    PhoneCall,
    Phone,
    Mail,
    IdCard,
    MapPin,
    Building2,
    Briefcase,
    Wallet,
    Calendar,
    Star
  } from '@lucide/vue'

  const route = useRoute()
  const router = useRouter()

  const circumference = 2 * Math.PI * 34

  const customers = [
    {
      id: 1,
      name: 'عبد الله الخالدي',
      status: 'عميل جديد',
      phone: '0505551234',
      email: 'khal5346@outlook.com',
      nationalId: '1023456789',
      interestScore: 88,
      location: 'الرياض',
      workType: 'تجاري',
      projectType: 'B2B',
      budget: '120,000',
      createdAt: '10/6/2026',
      priority: 'عالي',
      assignedAgent: { name: 'سارة أحمد', role: 'موظف أول مبيعات' },
      stats: { fieldVisits: 50, totalCalls: 247, interestPoints: 50, daysSinceAdded: 4 }
    }
  ]

  const customer = computed(
    () => customers.find(c => c.id === Number(route.params.id)) ?? customers[0]
  )

  const statCards = computed(() => [
    { label: 'الزيارات الميدانية', value: customer.value.stats.fieldVisits },
    { label: 'إجمالي المكالمات', value: customer.value.stats.totalCalls },
    { label: 'نقاط الاهتمام', value: customer.value.stats.interestPoints },
    { label: 'أيام منذ الإضافة', value: customer.value.stats.daysSinceAdded }
  ])

  const activityTabs = [
    { key: 'timeline', label: 'الجدول الزمني' },
    { key: 'calls', label: 'سجل المكالمات' },
    { key: 'visits', label: 'الزيارات' },
    { key: 'documents', label: 'الوثائق' }
  ]
  const activeActivityTab = ref('calls')

  const activityLog = [
    {
      id: 1,
      category: 'calls',
      title: 'مكالمة هاتفية صادرة',
      tag: 'متابعة مجدولة',
      tagClass: 'bg-emerald-50 text-emerald-600',
      time: '11:15',
      period: 'ص',
      date: '12/6/2026',
      note: 'أول تواصل مع العميل. أبدى اهتماماً بإنشاء موقع إلكتروني سكني - عقاري. مدة المكالمة: 4:28 دقيقة',
      meta: 'الموظف: سارة أحمد'
    },
    {
      id: 2,
      category: 'calls',
      title: 'مكالمة واردة – لم يُرد',
      tag: 'متابعة مجدولة',
      tagClass: 'bg-emerald-50 text-emerald-600',
      time: '11:15',
      period: 'ص',
      date: '12/6/2026',
      note: 'اتصل العميل ولم يتم الرد. تم ترك رسالة صوتية للمتابعة.',
      meta: 'الموظف: سارة أحمد'
    },
    {
      id: 3,
      category: 'calls',
      title: 'مكالمة واردة – لم يُرد',
      tag: 'متابعة مجدولة',
      tagClass: 'bg-emerald-50 text-emerald-600',
      time: '11:15',
      period: 'ص',
      date: '12/6/2026',
      note: 'تحدثنا عن تفاصيل الوحدة TM-12. أبدت اهتماماً كبيراً وطلبت جدولة زيارة ميدانية للمشروع. مدة المكالمة: 8:42 دقيقة',
      meta: 'الموظف: سارة أحمد'
    },
    {
      id: 4,
      category: 'visits',
      title: 'زيارة ميدانية – مجدولة',
      tag: 'قادم',
      tagClass: 'bg-orange-50 text-orange-500',
      time: '9:00',
      period: 'ص',
      date: '10/6/2026',
      note: 'تم جدولة زيارة ميدانية لمشاهدة الوحدة TM-12 والجولة في المشروع',
      meta: 'اليوم - 5:00 م – سارة أحمد'
    }
  ]

  const filteredActivity = computed(() => {
    if (activeActivityTab.value === 'timeline') return activityLog
    return activityLog.filter(e => e.category === activeActivityTab.value)
  })

  function statusClass(status) {
    const map = {
      'عميل جديد': 'bg-indigo-50 text-indigo-600',
      منتظم: 'bg-emerald-50 text-emerald-600',
      'قيد الدراسة': 'bg-orange-50 text-orange-500'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }
</script>
