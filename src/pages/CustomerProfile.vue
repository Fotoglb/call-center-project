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
        <h1 class="text-base font-bold text-gray-900"><span class="text-gray-400 font-normal">إدارة العملاء / </span>{{ customer.name }}</h1>
        <p class="text-xs text-gray-400 mt-2">ملف العميل الشامل</p>
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
          v-if="permissions.can('callCenter.logCall')"
          class="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue rounded-lg px-3 py-2 hover:bg-blue-dark cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isDialing"
          @click="startCall"
        >
          <PhoneCall :size="14" />
          {{ isDialing ? 'جارٍ بدء الاتصال...' : 'الاتصال الآن' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 items-start">
      <!-- RIGHT: Sidebar -->
      <div class="space-y-5">
        <!-- Customer Card -->
        <div class="bg-white rounded-2xl p-4">
          <div class="flex items-center justify-between gap-3 mb-5">
            <div class="min-w-0">
              <p class="text-xl font-bold text-gray-900 break-words">{{ customer.name }}</p>
            </div>
              <span
                class="inline-flex shrink-0 items-center px-3 py-1 rounded-md text-xs font-medium"
                :class="statusClass(customer.status)"
              >
                {{ customer.status }}
              </span>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-xs">
              <Phone :size="28" class="text-blue bg-blue-light rounded-md p-1.5 shrink-0" />
              <span class="text-gray-600 tabular-nums" dir="ltr">{{ customer.phone }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Mail :size="28" class="text-violet-500 bg-violet-50 rounded-md p-1.5 shrink-0" />
              <span class="text-gray-600" dir="ltr">{{ customer.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <MapPin :size="28" class="text-rose-500 bg-rose-50 rounded-md p-1.5 shrink-0" />
              <span class="text-gray-400">{{ customer.location }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div class="bg-white rounded-2xl p-4">
          <h3 class="text-base font-bold text-gray-900 mb-4">تفاصيل العميل</h3>
          <dl class="space-y-3">
            <div class="flex items-center justify-between gap-4 text-sm">
              <dt class="flex items-center gap-2 text-gray-400"><Zap :size="14" class="text-blue" />مصدر العميل</dt>
              <dd class="text-gray-700">{{ customer.source }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Briefcase :size="14" class="shrink-0 text-violet-500" />
                نوع المشروع
              </dt>
              <dd class="text-gray-700">{{ customer.projectType }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Wallet :size="14" class="shrink-0 text-emerald-500" />
                الميزانية / باقة المشروع
              </dt>
              <dd class="text-gray-700 tabular-nums whitespace-nowrap">{{ formattedBudget }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Calendar :size="14" class="shrink-0 text-amber-500" />
                تاريخ الإضافة
              </dt>
              <dd class="text-gray-700 tabular-nums" dir="ltr">{{ customer.addedAt }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <dt class="flex items-center gap-1.5 text-gray-400">
                <Clock :size="14" class="shrink-0 text-rose-500" />
                آخر تواصل
              </dt>
              <dd class="text-gray-700 text-xs">{{ customer.lastContact }}</dd>
            </div>
          </dl>
        </div>

        <!-- Assigned Agent -->
        <div class="bg-white rounded-2xl p-4">
          <h3 class="text-base font-bold text-gray-900 mb-4">الموظف المسؤول</h3>
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-md bg-violet-50 flex items-center justify-center text-base text-violet-500 shrink-0"
            >
              {{ customer.assignedAgent.name.charAt(0) }}
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">{{ customer.assignedAgent.name }}</p>
              <p class="text-xs text-gray-400">{{ customer.assignedAgent.role }}</p>
            </div>
            <a v-if="customer.assignedAgent.phone" :href="`tel:${customer.assignedAgent.phone}`" aria-label="الاتصال بالموظف المسؤول" class="ms-auto w-9 h-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500"><Phone :size="18" /></a>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="stat in statCards"
            :key="stat.label"
            class="bg-white rounded-2xl p-3 text-start"
          >
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-2" :class="stat.color"><component :is="stat.icon" :size="22" /></div>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-700 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- LEFT: col-span-2 -->
      <div class="min-w-0 space-y-5">
        <!-- Interest Score Card -->
        <div
          class="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-l from-[#2563eb] to-[#347df4]"
        >
          <div>
            <div class="flex items-baseline gap-1">
              <p class="text-xs font-normal text-white">نقاط الاهتمام</p>
            </div>
            <div class="flex items-baseline gap-1 mt-1">
              <span class="text-5xl font-medium text-white">{{ customer.interestScore ?? '—' }}</span>
              <span class="text-lg text-white">/100</span>
            </div>
            <p class="text-xs text-white/70 mt-1 leading-relaxed">
              {{ customer.interestScore === null ? 'لا توجد بيانات' : '' }}
            </p>
          </div>
          <div class="relative w-32 h-32 shrink-0" role="img" :aria-label="`نقاط الاهتمام: ${customer.interestScore ?? 'لا توجد بيانات'}`">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="8" />
              <circle cx="50" cy="50" r="43" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="100" :stroke-dashoffset="100 - Math.min(100, Math.max(0, Number(customer.interestScore) || 0))" />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-3xl text-white" dir="ltr">{{ customer.interestScore === null ? '—' : `${customer.interestScore}%` }}</span>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="bg-white rounded-2xl flex flex-col">
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
                  ? 'text-blue border-b-2 border-blue'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="activeActivityTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Timeline -->
          <div class="activity-timeline-list p-4 space-y-5">
            <div class="activity-items space-y-5">
            <p v-if="!filteredActivity.length" class="text-xs text-gray-400 text-center">لا توجد بيانات</p>
            <div v-for="(entry, index) in filteredActivity" :key="entry.id" class="relative flex gap-5">
              <span v-if="index < filteredActivity.length - 1" class="absolute start-4 top-8 -bottom-5 w-px bg-gray-100" aria-hidden="true"></span>
              <div
                v-if="entry.category === 'calls'"
                class="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                :class="entry.answered === false ? 'bg-red-50' : 'bg-emerald-50'"
              >
                <component
                  :is="entry.answered === false ? PhoneMissed : Phone"
                  :size="14"
                  :class="entry.answered === false ? 'text-red-500' : 'text-emerald-500'"
                />
              </div>
              <div
                v-else-if="entry.category === 'system'"
                class="w-8 h-8 rounded-md bg-blue-light flex items-center justify-center shrink-0 mt-0.5"
              >
                <UserPlus :size="14" class="text-blue" />
              </div>
              <div v-else class="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5" :class="entry.category === 'visits' ? 'bg-amber-50 text-amber-500' : 'bg-violet-50 text-violet-500'">
                <component :is="entry.category === 'visits' ? MapPin : MessageSquare" :size="14" />
              </div>
              <div
                class="flex-1 min-w-0 rounded-lg p-4 bg-gray-50"
              >
                <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium text-gray-900">{{ entry.title }}</span>
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
                <p v-if="entry.meta" class="text-xs text-gray-400 mb-4">بواسطة {{ entry.meta }}</p>
                <p v-if="entry.duration !== null" class="text-xs text-gray-500 mb-2">مدة المكالمة: <span dir="ltr">{{ entry.duration }}</span></p>
                <p v-if="typeof entry.note === 'string' && entry.note" class="text-sm text-gray-400 leading-relaxed">{{ entry.note }}</p>
                <a v-if="entry.fileUrl" :href="entry.fileUrl" target="_blank" rel="noopener noreferrer" class="inline-flex text-sm text-blue underline mt-2">فتح الوثيقة</a>
              </div>
            </div>
            </div>

            <div v-if="activeActivityTab === 'timeline'" class="pt-2 space-y-2">
              <p v-if="permissions.can('customers.viewEdit')" class="text-xs text-gray-500">أضف ملاحظة لملف العميل</p>
              <textarea
                v-model="newActivityNote"
                placeholder="أضف ملاحظة..."
                class="w-full h-24 p-4 resize-none bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
                :disabled="savingActivity || !permissions.can('customers.viewEdit')"
              />
              <div class="flex">
                <button
                  type="button"
                  class="ms-auto text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2 hover:bg-blue-dark cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="savingActivity || !newActivityNote.trim() || !permissions.can('customers.viewEdit')"
                  @click="addActivityNote"
                >
                  {{ savingActivity ? 'جارٍ الإضافة...' : 'إضافة' }}
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
    MessageSquare,
    Phone,
    Mail,
    Zap,
    MapPin,
    Clock,
    Briefcase,
    Wallet,
    Calendar,
    Star,
    PhoneOutgoing,
    PhoneMissed,
    UserPlus
  } from '@lucide/vue'
  import { customersService } from '@/services/customers.service'
  import { mapCustomerProfile, mapCustomerNote } from '@/utils/customerProfile'
  import { useNotification } from '@/composables/useNotification'
  import { useCallDial } from '@/composables/useCallDial'

  const route = useRoute()
  const router = useRouter()
  const { isDialing, startCall } = useCallDial(() => String(route.params.id ?? ''))


  const isLoading = ref(true)
  const loadError = ref(null)
  const customer = ref(null)
  const formattedBudget = computed(() => typeof customer.value?.budget === 'number'
    ? `${new Intl.NumberFormat('en-US').format(customer.value.budget)} ريال` : '—')

  const statCards = computed(() => {
    if (!customer.value) return []
    return [
      { label: 'إجمالي المكالمات', value: customer.value.stats.totalCalls ?? '—', icon: Phone, color: 'bg-blue-50 text-blue-500' },
      { label: 'الزيارات الميدانية', value: customer.value.stats.fieldVisits ?? '—', icon: MapPin, color: 'bg-emerald-50 text-emerald-500' },
      { label: 'أيام منذ الإضافة', value: customer.value.stats.daysSinceAdded ?? '—', icon: Clock, color: 'bg-amber-50 text-amber-500' },
      { label: 'نقاط الاهتمام', value: customer.value.stats.interestPoints ?? '—', icon: Star, color: 'bg-violet-50 text-violet-500' }
    ]
  })

  const activityTabs = [
    { key: 'timeline', label: 'الجدول الزمني' },
    { key: 'calls', label: 'سجل المكالمات' },
    { key: 'visits', label: 'الزيارات' }
  ]
  const activeActivityTab = ref('timeline')
  const newActivityNote = ref('')
  const activityLog = ref({ timeline: [], calls: [], visits: [], documents: [] })
  const savingActivity = ref(false)
  const notification = useNotification()
  watch(() => route.params.id, () => {
    newActivityNote.value = ''
  })
  async function addActivityNote() {
    if (savingActivity.value || !newActivityNote.value.trim() || !permissions.can('customers.viewEdit')) return
    const leadId = String(route.params.id)
    try {
      savingActivity.value = true
      const response = await customersService.addNote(leadId, newActivityNote.value)
      notification.success(response?.message || 'تمت إضافة الملاحظة')
      if (String(route.params.id) === leadId) {
        newActivityNote.value = ''
        if (response?.data?.id && typeof response.data.content === 'string') {
          const note = mapCustomerNote(response.data)
          activityLog.value.timeline = [note, ...activityLog.value.timeline.filter(entry => entry.id !== note.id)]
        } else {
          await loadCustomer()
        }
      }
    } catch (error) {
      notification.error(error?.message || 'تعذر إضافة الملاحظة')
    } finally {
      savingActivity.value = false
    }
  }

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
      'مهتم': 'bg-emerald-50 text-emerald-600',
      'غير مهتم': 'bg-red-50 text-red-500',
      'لا يرد': 'bg-gray-100 text-gray-500',
      'إعادة جدولة': 'bg-violet-50 text-violet-500',
      منتظم: 'bg-emerald-50 text-emerald-600',
      'قيد الدراسة': 'bg-orange-50 text-orange-500'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }
</script>

<style scoped>
.activity-timeline-list {
  max-height: 680px;
}

.activity-items {
  max-height: 540px;
  overflow-y: auto;
  padding-inline-end: 6px;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}
</style>
