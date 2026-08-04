<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3">
      <div>
        <p class="text-xs text-gray-400 mb-1">إدارة العملاء / {{ customer.name }}</p>
        <h1 class="text-xl font-bold text-gray-900">{{ customer.name }}</h1>
        <p class="text-xs text-gray-400 mt-0.5">ملف العميل الكامل</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="router.back()"
        >
          <ArrowRight :size="14" />
          العودة
        </button>
        <button
          class="flex items-center gap-1.5 text-xs font-semibold text-blue bg-sky-light border border-blue-200 rounded-lg px-3 py-2 hover:bg-sky-lighter cursor-pointer transition-colors"
          @click="
            router.push({
              name: 'AddCustomer',
              query: {
                editId: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                city: customer.location,
                projectType: customer.projectType
              }
            })
          "
        >
          <Pencil :size="14" />
          تعديل
        </button>
        <button
          class="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue rounded-lg px-3 py-2 hover:bg-blue-dark cursor-pointer transition-colors"
          @click="router.push({ name: 'Calls' })"
        >
          <PhoneCall :size="14" />
          الاتصال الآن
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- RIGHT: Sidebar -->
      <div class="space-y-5">
        <!-- Customer Card -->
        <div class="bg-gray-50 rounded-xl p-5">
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
        <div class="bg-gray-50 rounded-xl p-5">
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
        <div class="bg-gray-50 rounded-xl p-5">
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
        <div class="grid grid-cols-1 xsm:grid-cols-2 gap-3">
          <div
            v-for="stat in statCards"
            :key="stat.label"
            class="bg-gray-50 rounded-xl p-4 text-center"
          >
            <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- LEFT: col-span-2 -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Interest Score Card -->
        <div
          class="rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 bg-gradient-to-l from-blue to-blue-dark"
        >
          <div>
            <div class="flex items-baseline gap-1">
              <p class="text-sm font-bold text-white">نقاط الاهتمام</p>
            </div>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-[55px] font-bold text-white">{{ customer.interestScore }}</span>
              <span class="text-xs text-white/70">/100</span>
            </div>
            <p class="text-xs text-white/70 mt-1 leading-relaxed">
              احتمالية التحويل مرتفعة جداً – يُنصح بالمتابعة العاجلة
            </p>
          </div>
          <div class="relative w-35 h-35 shrink-0">
            <svg class="w-35 h-35 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff4d" stroke-width="8" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#ffffff"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference * (1 - customer.interestScore / 100)"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[40px] font-bold text-white">{{ customer.interestScore }}%</span>
            </div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="bg-gray-50 rounded-xl flex flex-col">
          <!-- Tabs -->
          <div
            class="flex items-center gap-1 px-5 pt-4 border-b border-gray-200 shrink-0 overflow-x-auto"
          >
            <button
              v-for="tab in activityTabs"
              :key="tab.key"
              class="px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
              <div
                v-if="entry.category === 'calls'"
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :class="entry.answered ? 'bg-emerald-50' : 'bg-red-50'"
              >
                <component
                  :is="entry.answered ? PhoneOutgoing : PhoneMissed"
                  :size="14"
                  :class="entry.answered ? 'text-emerald-600' : 'text-red-500'"
                />
              </div>
              <div
                v-else-if="entry.category === 'system'"
                class="w-8 h-8 rounded-full bg-blue-light flex items-center justify-center shrink-0 mt-0.5"
              >
                <UserPlus :size="14" class="text-blue" />
              </div>
              <span v-else class="w-5 h-5 rounded-md border border-gray-300 shrink-0 mt-0.5"></span>
              <div
                class="flex-1 min-w-0 rounded-xl p-3"
                :class="
                  entry.category === 'calls' && !entry.answered
                    ? 'border-2 border-blue bg-sky-lighter'
                    : 'bg-white'
                "
              >
                <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-semibold text-gray-800">{{ entry.title }}</span>
                    <span
                      v-if="entry.tag"
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

            <div v-if="activeActivityTab === 'timeline'" class="pt-2 space-y-2">
              <input
                v-model="newActivityNote"
                type="text"
                placeholder="موقع إلكتروني خاص بنوع عقارات سكنية"
                class="w-full h-11 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
                @keyup.enter="addActivity"
              />
              <div class="flex">
                <button
                  type="button"
                  class="ms-auto text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2 hover:bg-blue-dark cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!newActivityNote.trim()"
                  @click="addActivity"
                >
                  إضافة
                </button>
              </div>
            </div>
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
    Star,
    PhoneOutgoing,
    PhoneMissed,
    UserPlus
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
  const activeActivityTab = ref('timeline')
  const newActivityNote = ref('')

  const activityLog = ref([
    {
      id: 0,
      category: 'system',
      title: 'إضافة العميل إلى النظام',
      tag: '',
      tagClass: '',
      time: '9:00',
      period: 'ص',
      date: '10/6/2026',
      note: 'تم إضافة العميل من مصدر الموقع الإلكتروني - نموذج طلب معلومات',
      meta: 'بواسطة النظام'
    },
    {
      id: 1,
      category: 'calls',
      answered: true,
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
      answered: false,
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
      answered: true,
      title: 'مكالمة واردة',
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
  ])

  const filteredActivity = computed(() => {
    if (activeActivityTab.value === 'timeline') return activityLog.value
    return activityLog.value.filter(e => e.category === activeActivityTab.value)
  })

  function addActivity() {
    const text = newActivityNote.value.trim()
    if (!text) return
    activityLog.value.unshift({
      id: Date.now(),
      category: 'notes',
      title: 'ملاحظة جديدة',
      tag: '',
      tagClass: '',
      time: 'الآن',
      period: '',
      date: 'اليوم',
      note: text,
      meta: `الموظف: ${customer.value.assignedAgent.name}`
    })
    newActivityNote.value = ''
  }

  function statusClass(status) {
    const map = {
      'عميل جديد': 'bg-indigo-50 text-indigo-600',
      منتظم: 'bg-emerald-50 text-emerald-600',
      'قيد الدراسة': 'bg-orange-50 text-orange-500'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }
</script>
