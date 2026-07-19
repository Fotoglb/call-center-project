<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Top Stats Bar -->
    <div class="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-3">
      <!-- Online Status -->
      <div class="flex items-center gap-2 pe-4 border-e border-gray-100">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
        <span class="text-xs font-semibold text-emerald-600">متصل</span>
      </div>

      <!-- Stats -->
      <div
        v-for="stat in topStats"
        :key="stat.label"
        class="flex items-center gap-2.5 px-4 border-e border-gray-100 last:border-0"
      >
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          :class="stat.iconBg"
        >
          <component :is="stat.icon" :size="14" :class="stat.iconColor" />
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900 leading-none">{{ stat.value }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-4 flex-1 min-h-0">
      <!-- LEFT: Calls List -->
      <div class="bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
        <!-- Header -->
        <div class="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <h3 class="text-sm font-bold text-gray-900">مركز الاتصالات</h3>
          <p class="text-xs text-gray-400 mt-0.5 leading-relaxed">
            قائمة مكالمات العملاء المخصصة لك اليوم – مرتبة تلقائياً حسب الأولوية
          </p>
          <p class="text-xs text-gray-400 mt-2">قائمة المكالمات المجدولة – {{ todayLabel }}</p>
        </div>

        <!-- Search -->
        <div class="px-4 py-2.5 border-b border-gray-100 shrink-0">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث عن عميل، رقم هاتف، موظف..."
              class="w-full h-9 ps-3 pe-8 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300"
            />
            <Search
              :size="13"
              class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 px-4 py-2 border-b border-gray-100 shrink-0">
          <button
            v-for="f in filterTabs"
            :key="f.key"
            class="px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            :class="
              activeFilter === f.key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            "
            @click="activeFilter = f.key"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Customer List -->
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="(call, idx) in filteredCalls"
            :key="call.id"
            class="relative w-full flex items-center gap-3 px-4 py-3 transition-colors text-start cursor-pointer rounded-xl mb-2"
            :class="
              selectedCallId === call.id
                ? 'bg-indigo-50 border-r-2  border-indigo-500'
                : 'hover:bg-gray-50'
            "
            @click="selectCall(call)"
          >
            <!-- Active left border -->

            <!-- Number badge -->
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="
                selectedCallId === call.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500'
              "
            >
              {{ idx + 1 }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 truncate">{{ call.name }}</p>
              <p class="text-xs text-gray-400 tabular-nums mt-0.5 text-end" dir="ltr">
                {{ call.phone }}
              </p>
              <!-- Badges row -->
              <div class="flex items-center flex-wrap gap-1 mt-1.5">
                <span class="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-medium">
                  {{ call.priority }}
                </span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-md font-medium border"
                  :class="callStatusClass(call.status)"
                >
                  {{ call.status }}
                </span>
              </div>
            </div>

            <!-- Countdown + Avatar -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- Direction badge -->
              <span
                class="text-xs font-semibold px-2 py-1 rounded-lg shrink-0"
                :class="directionClass(call.direction)"
                >{{ call.direction }}</span
              >
              <!-- Countdown -->
              <div class="flex items-center gap-1 text-gray-400">
                <Clock :size="11" />
                <span class="text-xs tabular-nums">{{ call.countdown }}</span>
              </div>
            </div>
          </button>

          <p v-if="filteredCalls.length === 0" class="text-center text-xs text-gray-400 py-8">
            لا توجد نتائج
          </p>
        </div>
      </div>

      <!-- RIGHT: Customer Detail -->
      <div class="col-span-2 flex flex-col gap-4 min-h-0">
        <!-- No Selection State -->
        <div
          v-if="!selectedCall"
          class="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center"
        >
          <div class="text-center">
            <div
              class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
            >
              <Phone :size="22" class="text-gray-400" />
            </div>
            <p class="text-sm font-medium text-gray-500">اختر عميلاً من القائمة لعرض التفاصيل</p>
          </div>
        </div>

        <!-- Selected Customer -->
        <template v-else>
          <!-- Customer Header Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-5 shrink-0">
            <div class="flex items-start justify-between">
              <!-- Info -->
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0"
                >
                  {{ selectedCall.name.charAt(0) }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base font-bold text-gray-900">{{ selectedCall.name }}</h2>
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      :class="callStatusClass(selectedCall.status)"
                    >
                      {{ selectedCall.status }}
                    </span>
                  </div>
                  <div class="flex items-center flex-wrap gap-1.5 mt-2">
                    <p class="text-xs text-gray-400 tabular-nums mt-0.5" dir="ltr">
                      {{ selectedCall.phone }}
                    </p>

                    <span
                      v-for="tag in selectedCall.tags"
                      :key="tag"
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >{{ tag }}</span
                    >
                    <span class="text-xs text-gray-400"
                      >آخر تواصل: {{ selectedCall.lastContact }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="router.push({ name: 'CustomerProfile', params: { id: selectedCall.id } })"
                >
                  <UserRound :size="13" />
                  عرض الملف
                </button>
                <button
                  class="flex items-center gap-1.5 text-xs text-white bg-green-400 rounded-lg px-3 py-2 hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  <PhoneCall :size="13" />
                  الاتصال الآن
                </button>
              </div>
            </div>
          </div>

          <!-- Tabs + History + Result -->
          <div class="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
            <!-- Tabs -->
            <div class="flex items-center gap-1 px-5 pt-4 border-b border-gray-100 shrink-0">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer"
                :class="
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/40'
                    : 'text-gray-500 hover:text-gray-700'
                "
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab Content -->
            <div class="flex-1 overflow-y-auto p-5">
              <!-- Contact History Tab -->
              <div v-if="activeTab === 'history'" class="space-y-3">
                <p class="text-xs font-semibold text-gray-500 mb-3">سجل المحادثات</p>
                <div v-for="entry in selectedCall.history" :key="entry.id" class="flex gap-3">
                  <!-- Icon -->
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    :class="historyIconBg(entry.type)"
                  >
                    <component
                      :is="historyIcon(entry.type)"
                      :size="14"
                      :class="historyIconColor(entry.type)"
                    />
                  </div>

                  <!-- Body -->
                  <div class="flex-1 min-w-0 bg-gray-50 rounded-xl p-3">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold text-gray-800">{{ entry.type }}</span>
                        <div class="flex items-center gap-1 text-gray-400">
                          <Clock :size="11" />
                          <span class="text-xs tabular-nums">{{ entry.duration }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          :class="historyResultClass(entry.result)"
                          >{{ entry.result }}</span
                        >
                        <span class="text-xs text-gray-400 tabular-nums">{{ entry.date }}</span>
                      </div>
                    </div>
                    <p class="text-xs text-gray-500 leading-relaxed">{{ entry.note }}</p>
                  </div>
                </div>
              </div>

              <!-- Notes Tab -->
              <div v-if="activeTab === 'notes'" class="space-y-3">
                <textarea
                  v-model="noteText"
                  rows="5"
                  placeholder="أضف ملاحظة حول هذا العميل..."
                  class="w-full ps-4 pe-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors resize-none"
                ></textarea>
                <button
                  class="text-xs text-white bg-gray-900 rounded-lg px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  حفظ الملاحظة
                </button>
              </div>

              <!-- Customer Data Tab -->
              <div v-if="activeTab === 'data'" class="space-y-3">
                <dl class="grid grid-cols-2 gap-3">
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">
                      رقم الجوال <span class="text-red-400">*</span>
                    </dt>
                    <dd
                      class="flex items-center justify-between text-xs font-semibold text-gray-800"
                    >
                      <span class="flex items-center gap-1.5">
                        <Phone :size="13" class="text-gray-400 shrink-0" />
                        <span dir="ltr">{{ selectedCall.phone }}</span>
                      </span>
                      <span class="text-gray-400 font-normal">+966</span>
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">
                      الاسم بالكامل <span class="text-red-400">*</span>
                    </dt>
                    <dd class="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                      <UserRound :size="13" class="text-gray-400 shrink-0" />
                      {{ selectedCall.name }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">مصدر العميل</dt>
                    <dd class="text-xs font-semibold text-gray-800">
                      {{ selectedCall.source ?? '—' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">نوع العمل</dt>
                    <dd class="text-xs font-semibold text-gray-800">
                      {{ selectedCall.workType ?? '—' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">
                      نوع مشروع العميل <span class="text-red-400">*</span>
                    </dt>
                    <dd class="text-xs font-semibold text-gray-800">
                      {{ selectedCall.projectType ?? '—' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">تاريخ الإنشاء</dt>
                    <dd class="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                      <Calendar :size="13" class="text-gray-400 shrink-0" />
                      {{ selectedCall.createdAt ?? '—' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">الأولوية</dt>
                    <dd class="text-xs font-semibold text-gray-800">
                      {{ selectedCall.priority ?? '—' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <dt class="text-xs text-gray-400 mb-1.5">محاولات الاتصال</dt>
                    <dd class="text-xs font-semibold text-gray-800">
                      {{ selectedCall.callAttempts ? selectedCall.callAttempts + ' اتصالات' : '—' }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Call Result Section -->
            <div class="border-t border-gray-100 p-5 shrink-0">
              <p class="text-xs font-semibold text-gray-700 mb-3">نتيجة المكالمة</p>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="outcome in callOutcomes"
                  :key="outcome.key"
                  class="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
                  :class="
                    selectedOutcome === outcome.key
                      ? outcome.activeClass
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  "
                  @click="selectedOutcome = outcome.key"
                >
                  <component :is="outcome.icon" :size="16" />
                  <span class="font-semibold">{{ outcome.label }}</span>
                  <span class="text-[10px] text-gray-400 font-normal leading-tight text-center">{{
                    outcome.sub
                  }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Search,
    Phone,
    PhoneCall,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    MessageSquare,
    UserRound,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    CalendarClock,
    PhoneOff
  } from '@lucide/vue'

  const topStats = [
    {
      label: 'مكالمات الانتظار',
      value: '6',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500'
    },
    {
      label: 'عملاء ينشطون',
      value: '5',
      icon: UserRound,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500'
    },
    {
      label: 'مكالمة اليوم',
      value: '30',
      icon: Phone,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-500'
    },
    {
      label: 'مؤسسة المكالمات',
      value: '640',
      icon: PhoneOutgoing,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500'
    }
  ]

  const router = useRouter()

  const todayLabel = 'الثلاثاء 16 يونيو 2026'

  const searchQuery = ref('')
  const selectedCallId = ref(1)
  const activeTab = ref('data')
  const selectedOutcome = ref('')
  const noteText = ref('')
  const activeFilter = ref('all')

  const filterTabs = [
    { key: 'all', label: 'الكل' },
    { key: 'في الانتظار', label: 'في الانتظار' },
    { key: 'مؤجل', label: 'مؤجل' },
    { key: 'لا يرد', label: 'لا يرد' }
  ]

  const tabs = [
    { key: 'history', label: 'تاريخ التواصل' },
    { key: 'notes', label: 'ملاحظات العميل' },
    { key: 'data', label: 'بيانات العميل' }
  ]

  const callOutcomes = [
    {
      key: 'reschedule',
      label: 'إعادة جدولة',
      sub: 'طلب موعد آخر',
      icon: CalendarClock,
      activeClass: 'border-indigo-400 bg-indigo-50 text-indigo-600'
    },
    {
      key: 'no_answer',
      label: 'لا يرد',
      sub: 'لم يرد على المكالمة',
      icon: PhoneOff,
      activeClass: 'border-gray-400 bg-gray-100 text-gray-700'
    },
    {
      key: 'not_interested',
      label: 'غير مهتم',
      sub: 'لا رغبة في الشراء',
      icon: XCircle,
      activeClass: 'border-red-400 bg-red-50 text-red-600'
    },
    {
      key: 'interested',
      label: 'مهتم',
      sub: 'أبدى اهتمام بالشراء',
      icon: CheckCircle2,
      activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-600'
    }
  ]

  const callsList = [
    {
      id: 1,
      name: 'عبد الله الخالدي',
      phone: '0505551234',
      status: 'في الانتظار',
      priority: 'عالي الأهمية',
      countdown: '5 د',
      direction: 'وارد',
      tags: ['سكني', 'إعلانات رقمية'],
      lastContact: 'أمس 13:30م',
      lastResult: 'مهتم',
      workType: 'تجاري، عقاري',
      source: 'إعلانات رقمية',
      createdAt: '6/6/2026',
      projectType: 'B2B',
      callAttempts: 3,
      history: [
        {
          id: 1,
          type: 'مكالمة صادر',
          date: 'أمس 13:30م',
          duration: '15:12 د',
          result: 'مهتم',
          note: 'تم التواصل مع العميل وأبدى اهتماماً بالمنتج، طلب إرسال عرض تفصيلي عبر البريد الإلكتروني.'
        },
        {
          id: 2,
          type: 'رسالة صادر',
          date: 'الأحد 4/8/2026 10:00ص',
          duration: '—',
          result: 'تم الإرسال',
          note: 'تم إرسال الكتالوج الإلكتروني الكامل وقائمة الأسعار عبر البريد الإلكتروني.'
        },
        {
          id: 3,
          type: 'مكالمة وارد',
          date: 'الأحد 16/6/2026 1:00م',
          duration: '0 د',
          result: 'لا يرد',
          note: 'لم يتم الرد على المكالمة، تم ترك رسالة صوتية للعميل للتواصل.'
        },
        {
          id: 4,
          type: 'مكالمة صادر',
          date: 'الثلاثاء 30/6/2026 2:30م',
          duration: '8:45 د',
          result: 'متابعة مجدولة',
          note: 'تواصل العميل وطلب تأجيل اتخاذ القرار لأسبوع، تم جدولة متابعة.'
        }
      ]
    },
    {
      id: 2,
      name: 'نورا محمد',
      phone: '0555561234',
      status: 'في الانتظار',
      priority: 'عالي الأهمية',
      countdown: '5 د',
      direction: 'وارد',
      tags: ['B2C'],
      lastContact: 'الأسبوع الماضي',
      lastResult: 'إعادة جدولة',
      history: []
    },
    {
      id: 3,
      name: 'فاطمة علي',
      phone: '0555569876',
      status: 'مؤجل',
      priority: 'متوسط',
      countdown: '15 د',
      direction: 'تمت',
      tags: ['سكني'],
      lastContact: 'أمس',
      lastResult: 'مهتم',
      history: []
    },
    {
      id: 4,
      name: 'سالم سعيد',
      phone: '0555564321',
      status: 'في الانتظار',
      priority: 'عالي الأهمية',
      countdown: '20 د',
      direction: 'صادر',
      tags: ['B2B'],
      lastContact: '3 أيام',
      lastResult: 'غير مهتم',
      history: []
    },
    {
      id: 5,
      name: 'علي حسن',
      phone: '0555565078',
      status: 'لا يرد',
      priority: 'منخفض',
      countdown: '30 د',
      direction: 'تمت',
      tags: ['تجاري'],
      lastContact: 'اليوم',
      lastResult: 'لا يرد',
      history: []
    },
    {
      id: 6,
      name: 'خالد المطيري',
      phone: '0555565678',
      status: 'مؤجل',
      priority: 'متوسط',
      countdown: '45 د',
      direction: 'صادر',
      tags: ['سكني'],
      lastContact: 'أمس',
      lastResult: 'إعادة جدولة',
      history: []
    },
    {
      id: 7,
      name: 'رنا الغامدي',
      phone: '0557654321',
      status: 'في الانتظار',
      priority: 'عالي الأهمية',
      countdown: '55 د',
      direction: 'وارد',
      tags: ['B2C'],
      lastContact: 'منذ يومين',
      lastResult: 'مهتم',
      history: []
    }
  ]

  const filteredCalls = computed(() => {
    if (!searchQuery.value.trim()) return callsList
    const q = searchQuery.value.toLowerCase()
    return callsList.filter(c => c.name.includes(q) || c.phone.includes(q))
  })

  const selectedCall = computed(() => callsList.find(c => c.id === selectedCallId.value) ?? null)

  const customerFields = computed(() => {
    if (!selectedCall.value) return []
    return [
      { label: 'الاسم الكامل', value: selectedCall.value.name },
      { label: 'رقم الجوال', value: selectedCall.value.phone },
      { label: 'آخر تواصل', value: selectedCall.value.lastContact },
      { label: 'الحالة', value: selectedCall.value.status },
      { label: 'التصنيف', value: selectedCall.value.tags.join('، ') },
      { label: 'آخر نتيجة', value: selectedCall.value.lastResult }
    ]
  })

  function selectCall(call) {
    selectedCallId.value = call.id
    selectedOutcome.value = ''
    activeTab.value = 'data'
  }

  function directionClass(direction) {
    if (direction === 'وارد') return 'bg-emerald-50 text-emerald-600'
    if (direction === 'صادر') return 'bg-indigo-50 text-indigo-600'
    if (direction === 'تمت') return 'bg-gray-100 text-gray-500'
    return 'bg-gray-100 text-gray-500'
  }

  function callStatusClass(status) {
    const map = {
      'في الانتظار': 'bg-amber-50 text-amber-600',
      'على الأعمدة': 'bg-indigo-50 text-indigo-600',
      منتظم: 'bg-emerald-50 text-emerald-600',
      مكتمل: 'bg-gray-100 text-gray-500'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }

  function historyIcon(type) {
    if (type === 'مكالمة صادر') return PhoneOutgoing
    if (type === 'مكالمة وارد') return PhoneIncoming
    if (type === 'مكالمة فائتة') return PhoneMissed
    if (type === 'رسالة صادر') return MessageSquare
    return Phone
  }

  function historyIconBg(type) {
    if (type === 'مكالمة صادر') return 'bg-indigo-50'
    if (type === 'مكالمة وارد') return 'bg-teal-50'
    if (type === 'مكالمة فائتة') return 'bg-red-50'
    if (type === 'رسالة صادر') return 'bg-purple-50'
    return 'bg-gray-100'
  }

  function historyIconColor(type) {
    if (type === 'مكالمة صادر') return 'text-indigo-500'
    if (type === 'مكالمة وارد') return 'text-teal-500'
    if (type === 'مكالمة فائتة') return 'text-red-500'
    if (type === 'رسالة صادر') return 'text-purple-500'
    return 'text-gray-400'
  }

  function historyResultClass(result) {
    const map = {
      مهتم: 'bg-emerald-50 text-emerald-600',
      'غير مهتم': 'bg-red-50 text-red-500',
      'لا يرد': 'bg-gray-100 text-gray-500',
      'تم الإرسال': 'bg-blue-50 text-blue-600',
      'متابعة مجدولة': 'bg-amber-50 text-amber-600',
      'إعادة جدولة': 'bg-indigo-50 text-indigo-600'
    }
    return map[result] ?? 'bg-gray-100 text-gray-500'
  }
</script>
