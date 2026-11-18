<template>
  <div class="space-y-5">
    <!-- Loading / Error states -->
    <div v-if="isLoading" class="flex items-center justify-center py-24 text-sm text-gray-400">
      ...جارٍ تحميل بيانات العميل
    </div>
    <div v-else-if="loadError" class="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p class="text-sm text-red-500">تعذر تحميل بيانات العميل</p>
      <button
        class="text-xs text-white bg-gray-900 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors"
        @click="loadCustomer"
      >
        إعادة المحاولة
      </button>
    </div>
    <template v-else>
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
          v-if="permissions.can('customers.viewEdit')"
          class="flex items-center gap-1.5 text-xs font-semibold text-blue bg-sky-light border border-blue-200 rounded-lg px-3 py-2 hover:bg-sky-lighter cursor-pointer transition-colors"
          @click="
            router.push({
              name: 'AddCustomer',
              query: {
                editId: customer.id
              }
            })
          "
        >
          <Pencil :size="14" />
          تعديل
        </button>
        <button
          v-if="permissions.canOpen('/calls')"
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
              <span class="text-[55px] font-bold text-white">{{ customer.interestScore ?? '—' }}</span>
              <span class="text-xs text-white/70">/100</span>
            </div>
            <p class="text-xs text-white/70 mt-1 leading-relaxed">
              {{ customer.interestScore === null ? 'لا توجد بيانات' : '' }}
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
                :stroke-dashoffset="circumference * (1 - (customer.interestScore ?? 0) / 100)"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[40px] font-bold text-white">{{ customer.interestScore === null ? '—' : `${customer.interestScore}%` }}</span>
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
            <p v-if="!filteredActivity.length" class="text-xs text-gray-400 text-center">لا توجد بيانات</p>
            <div v-for="entry in filteredActivity" :key="entry.id" class="flex gap-3">
              <div
                v-if="entry.category === 'calls'"
                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :class="entry.answered === false ? 'bg-red-50' : 'bg-blue-light'"
              >
                <component
                  :is="entry.answered === false ? PhoneMissed : Phone"
                  :size="14"
                  :class="entry.answered === false ? 'text-red-500' : 'text-blue'"
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
                  entry.category === 'calls' && entry.answered === false
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
                disabled
                title="إضافة النشاط غير متاحة حاليًا"
              />
              <div class="flex">
                <button
                  type="button"
                  class="ms-auto text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2 hover:bg-blue-dark cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                  title="إضافة النشاط غير متاحة حاليًا"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { ref, computed, watch, onMounted } from 'vue'
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
  import { customersService } from '@/services/customers.service'
  import { mapCustomerProfile } from '@/utils/customerProfile'

  const route = useRoute()
  const router = useRouter()

  const circumference = 2 * Math.PI * 34

  const isLoading = ref(true)
  const loadError = ref(null)
  const customer = ref(null)

  const statCards = computed(() => {
    if (!customer.value) return []
    return [
      { label: 'الزيارات الميدانية', value: customer.value.stats.fieldVisits ?? 'لا توجد بيانات' },
      { label: 'إجمالي المكالمات', value: customer.value.stats.totalCalls ?? 'لا توجد بيانات' },
      { label: 'نقاط الاهتمام', value: customer.value.stats.interestPoints ?? 'لا توجد بيانات' },
      { label: 'أيام منذ الإضافة', value: customer.value.stats.daysSinceAdded ?? 'لا توجد بيانات' }
    ]
  })

  const activityTabs = [
    { key: 'timeline', label: 'الجدول الزمني' },
    { key: 'calls', label: 'سجل المكالمات' },
    { key: 'visits', label: 'الزيارات' },
    { key: 'documents', label: 'الوثائق' }
  ]
  const activeActivityTab = ref('timeline')
  const newActivityNote = ref('')
  const activityLog = ref({ timeline: [], calls: [], visits: [], documents: [] })

  let loadVersion = 0
  async function loadCustomer() {
    const version = ++loadVersion
    isLoading.value = true
    loadError.value = null
    try {
      const response = await customersService.getProfile(route.params.id)
      if (version !== loadVersion) return
      const profile = mapCustomerProfile(response)
      customer.value = profile.customer
      activityLog.value = profile.activities
    } catch (err) {
      if (version !== loadVersion) return
      loadError.value = err
    } finally {
      if (version === loadVersion) isLoading.value = false
    }
  }

  watch(() => route.params.id, loadCustomer)
  onMounted(loadCustomer)

  const filteredActivity = computed(() => {
    return activityLog.value[activeActivityTab.value] ?? []
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
