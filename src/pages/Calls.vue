<template>
  <div class="flex flex-col lg:h-full gap-4">
    <!-- Page Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-bold text-gray-900">مركز الاتصالات</h2>
        <p class="text-xs text-gray-400 mt-0.5 leading-relaxed">
          قائمة مكالمات العملاء المخصصة لك اليوم – مرتبة تلقائياً حسب الأولوية
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 text-xs font-medium text-blue bg-blue-light rounded-lg px-4 py-2 hover:bg-blue-light/70 cursor-pointer transition-colors"
          @click="router.push({ name: 'Customers' })"
        >
          <Plus :size="14" />
          ملخص العملاء
        </button>
        <button
          class="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2 cursor-pointer transition-colors"
          @click="router.push({ name: 'CallHistory' })"
        >
          <Plus :size="14" />
          قائمة المكالمات
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
      <!-- LEFT: Calls List -->
      <div class="bg-gray-50 rounded-xl flex flex-col min-h-0">
        <!-- Scheduled Label -->
        <p class="text-base font-medium text-gray-900 px-4 pt-4">
          قائمة المكالمات المجدولة – {{ todayLabel }}
        </p>

        <!-- Search -->
        <div class="px-4 py-2.5 shrink-0">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث عن عميل، رقم هاتف، موظف..."
              class="w-full h-9 ps-3 pe-8 bg-muted border border-accent/50 rounded-[10px] text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-secondary"
            />
            <Search
              :size="13"
              class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 px-4 py-2 shrink-0 overflow-x-auto">
          <button
            v-for="f in permittedFilterTabs"
            :key="f.key"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            :class="
              activeFilter === f.key
                ? 'bg-blue-light text-blue-dark'
                : 'text-gray-500 hover:bg-gray-100'
            "
            @click="activeFilter = f.key"
            :disabled="isSaving"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Customer List -->
        <div class="flex-1 overflow-y-auto">
          <p v-if="isLoading" class="text-center text-xs text-gray-400 py-8">...جارٍ التحميل</p>
          <div v-else-if="loadError" class="flex flex-col items-center gap-2 py-8">
            <p role="alert" class="text-center text-xs text-red-500">{{ loadError.message || 'تعذر تحميل قائمة المكالمات' }}</p>
            <button
              class="text-xs text-white bg-gray-900 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-700 transition-colors"
              @click="loadCalls"
            >
              إعادة المحاولة
            </button>
          </div>
          <template v-else>
          <button
            v-for="(call, idx) in filteredCalls"
            :key="call.id"
            class="relative w-full flex items-center gap-3 px-4 py-3 transition-colors text-start cursor-pointer rounded-[10px] mb-2 border-r-4"
            :class="
              selectedCallId === call.id
                ? 'bg-blue-light border-blue-dark'
                : 'border-transparent hover:bg-white'
            "
            @click="selectCall(call)"
          >
            <!-- Number badge -->
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gray-100 text-gray-500"
            >
              {{ idx + 1 }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold truncate text-gray-800">
                {{ call.name }}
              </p>
              <p class="text-xs tabular-nums mt-0.5 text-end text-gray-400" dir="ltr">
                {{ call.phone }}
              </p>
              <!-- Badges row -->
              <div class="flex items-center flex-wrap gap-1 mt-1.5">
                <span
                  class="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  :class="priorityClass(call.priority)"
                >
                  {{ call.priority }}
                </span>
                <span
                  class="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  :class="callStatusClass(call.status)"
                >
                  {{ call.status }}
                </span>
              </div>
            </div>

            <!-- Countdown + Avatar -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- New badge -->
              <span
                v-if="call.isNew"
                class="text-xs font-semibold px-2 py-1 rounded-lg shrink-0 bg-emerald-50 text-emerald-600"
                >جديد</span
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
          </template>
        </div>
      </div>

      <!-- RIGHT: Customer Detail -->
      <div class="lg:col-span-2 flex flex-col gap-4 min-h-0">
        <!-- No Selection State -->
        <div
          v-if="!selectedCall"
          class="flex-1 bg-gray-50 rounded-xl flex items-center justify-center"
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
          <!-- Customer Header + Tabs/Content Card -->
          <div class="flex-1 bg-gray-50 rounded-xl flex flex-col min-h-0">
            <div class="p-5 shrink-0">
              <div class="flex items-start justify-between flex-wrap gap-3">
                <!-- Info -->
                <div class="flex items-start gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-sm font-bold text-secondary shrink-0"
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
                      <p class="text-xs text-gray-400 tabular-nums" dir="ltr">
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
                    v-if="permissions.can('customerProfile.view') && resultLeadId"
                    class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white cursor-pointer transition-colors"
                    @click="
                      router.push({ name: 'CustomerProfile', params: { id: resultLeadId } })
                    "
                  >
                    <UserRound :size="13" />
                    عرض الملف
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabs + History -->
            <div class="flex-1 flex flex-col min-h-0 border-t border-gray-200">
              <!-- Tabs -->
              <div class="flex items-center gap-1 px-5 pt-4 shrink-0 overflow-x-auto">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  class="px-4 py-2 font-medium rounded-t-lg transition-colors cursor-pointer shrink-0"
                  :class="
                    activeTab === tab.key
                      ? 'text-blue-dark border-b-2 border-blue-dark font-bold '
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
                  <p v-if="historyLoading" class="text-sm text-gray-500">جارٍ تحميل سجل المكالمات...</p>
                  <div v-else-if="historyError" role="alert" class="text-sm text-red-500">
                    <p>{{ historyError }}</p>
                    <button type="button" class="mt-2 text-blue underline" @click="loadHistory">إعادة المحاولة</button>
                  </div>
                  <p v-else-if="!historyEntries.length" class="text-sm text-gray-500">لا توجد مكالمات في هذه الصفحة</p>
                  <div v-for="entry in historyEntries" :key="entry.id" class="flex gap-3">
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
                    <div class="flex-1 min-w-0 bg-white rounded-xl p-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-semibold text-gray-800">{{
                              entry.type
                            }}</span>
                            <div class="flex items-center gap-1 text-gray-400">
                              <Clock :size="11" />
                              <span class="text-xs tabular-nums">{{ entry.duration }}</span>
                            </div>
                          </div>
                          <p class="text-xs text-gray-500 leading-relaxed">{{ entry.note }}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1 shrink-0">
                          <span
                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            :class="historyResultClass(entry.result)"
                            >{{ entry.result }}</span
                          >
                          <span class="text-xs text-gray-400 tabular-nums">{{ entry.date }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="activeTab === 'history'" class="flex items-center justify-between gap-3 mt-4">
                  <button type="button" :disabled="historyLoading || historyPage === 1" class="text-blue disabled:opacity-40" @click="historyPage--">السابق</button>
                  <span class="text-xs text-gray-500">الصفحة {{ historyPage }}</span>
                  <button type="button" :disabled="historyLoading || !!historyError || historyEntries.length < historyLimit" class="text-blue disabled:opacity-40" @click="historyPage++">التالي</button>
                </div>

                <!-- Notes Tab -->
                <div v-if="activeTab === 'notes'" class="space-y-3">
                  <textarea
                    v-model="noteText"
                    rows="5"
                    placeholder="أضف ملاحظة حول هذا العميل..."
                    class="w-full ps-4 pe-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors resize-none"
                  ></textarea>
                  <button
                    class="text-xs text-white bg-gray-900 rounded-lg px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!noteText.trim() || isSavingNote"
                    v-if="permissions.can('callCenter.logCall')"
                    @click="saveNote"
                  >
                    {{ isSavingNote ? 'جارٍ الحفظ...' : 'حفظ الملاحظة' }}
                  </button>
                </div>

                <!-- Customer Data Tab -->
                <div v-if="activeTab === 'data'" class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <Label for="dataFullName">الاسم بالكامل <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <Input id="dataFullName" v-model="selectedCall.name" type="text" class="ps-10" />
                        <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
                          <UserRound :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataPhone">رقم الجوال <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <Input id="dataPhone" v-model="selectedCall.phone" type="text" dir="ltr" class="ps-10 pe-12" />
                        <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
                          <Phone :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataWorkType">نوع العمل</Label>
                      <Input id="dataWorkType" v-model="selectedCall.workType" type="text" />
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataSource">مصدر العميل</Label>
                      <Input id="dataSource" v-model="selectedCall.source" type="text" />
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataCreatedAt">تاريخ الإنشاء</Label>
                      <div class="relative">
                        <Input id="dataCreatedAt" v-model="selectedCall.createdAt" type="text" class="pe-10" />
                        <span class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 pointer-events-none">
                          <Calendar :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataProjectType">نوع مشروع العميل <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <select
                          id="dataProjectType"
                          v-model="selectedCall.projectType"
                          class="flex h-10 w-full appearance-none rounded-md border border-gray-200 bg-white ps-3 pe-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                        >
                          <option v-for="type in projectTypes" :key="type" :value="type">{{ type }}</option>
                        </select>
                        <span class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 pointer-events-none">
                          <ChevronDown :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataCallAttempts">محاولات الاتصال</Label>
                      <div class="relative">
                        <Input id="dataCallAttempts" v-model="callAttemptsText" type="text" inputmode="numeric" class="pe-16" />
                        <span class="absolute inset-y-0 inset-e-3 flex items-center text-xs text-gray-400 pointer-events-none">اتصالات</span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataPriority">الأولوية</Label>
                      <Input id="dataPriority" v-model="selectedCall.priority" type="text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            <details class="mt-4 text-xs text-gray-500">
              <summary class="cursor-pointer">بيانات تسجيل المكالمة</summary>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div class="space-y-1.5">
                <Label for="resultLeadId">معرّف العميل (Lead ID)</Label>
                <Input id="resultLeadId" v-model="resultLeadId" :disabled="isSaving" dir="ltr" placeholder="معرّف العميل من النظام" />
              </div>
              <div class="space-y-1.5">
                <Label for="durationSec">مدة المكالمة الصادرة بالثواني</Label>
                <Input id="durationSec" v-model="durationSec" :disabled="isSaving" type="number" min="0" step="1" />
              </div>
            </div>
            </details>

          <!-- Call Result Card -->
          <div class="call-result-card bg-white rounded-2xl p-6 shrink-0" dir="rtl">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-semibold text-gray-700">حالة العميل</p>
              <span class="text-xs text-gray-400">اختر نتيجة واحدة</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <button
                v-for="outcome in callOutcomes"
                :key="outcome.key"
                type="button"
                :disabled="isSaving"
                :aria-pressed="selectedOutcome === outcome.key"
                :data-outcome="outcome.key"
                class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
                :class="
                  selectedOutcome === outcome.key
                    ? outcome.activeClass
                    : 'border-transparent'
                "
                @click="selectedOutcome = outcome.key"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="outcome.iconBg"
                >
                  <component :is="outcome.icon" :size="22" :class="outcome.iconColor" />
                </div>
                <span class="font-semibold">{{ outcome.label }}</span>
                <span class="text-[10px] text-gray-400 font-normal leading-tight text-center">{{
                  outcome.sub
                }}</span>
              </button>
            </div>


              <div v-if="selectedOutcome === 'reschedule'" class="space-y-3 mt-6">
                <p class="text-sm">موعد الاتصال القادم<span class="text-red-500">*</span></p>
                <div class="space-y-1.5">
                  <Label for="nextCallAt">التاريخ<span class="text-red-500">*</span></Label>
                  <Input id="nextCallAt" v-model="nextCallAt" :disabled="isSaving" type="datetime-local" />
                </div>
                <div class="space-y-1.5">
                  <Label for="rescheduleReason">سبب إعادة الجدولة</Label>
                  <textarea id="rescheduleReason" v-model="rescheduleReason" :disabled="isSaving" rows="2" class="w-full" placeholder="اكتب ملاحظات العميل هنا ..."></textarea>
                </div>
            </div>

            <div class="space-y-1.5 mt-4">
              <p class="text-xs text-gray-500 font-medium">
                نتيجة المكالمة <span class="text-red-400">*</span>
              </p>
              <textarea
                v-model="resultNote"
                :disabled="isSaving"
                rows="5"
                placeholder="اكتب ملاحظات العميل هنا ..."
                class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              class="result-save flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2.5 mt-3 cursor-pointer transition-colors hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!selectedOutcome || !resultNote.trim() || isSaving"
              v-if="permissions.can('callCenter.logCall')"
              @click="saveCallResult"
            >
              <span>{{ isSaving ? 'جارٍ الحفظ...' : 'حفظ نتيجة المكالمة ثم الانتقال للعميل التالي' }}</span>
              <ArrowLeft :size="14" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth.store'
  const permissions = useAuthStore()
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Search,
    Phone,
    PhoneIncoming,
    PhoneOutgoing,
    PhoneMissed,
    MessageSquare,
    UserRound,
    CheckCircle2,
    Star,
    ThumbsDown,
    XCircle,
    Clock,
    Calendar,
    CalendarClock,
    PhoneOff,
    Plus,
    ArrowLeft,
    ChevronDown
  } from '@lucide/vue'
  import Input from '@/components/ui/Input.vue'
  import Label from '@/components/ui/Label.vue'
  import { callsService } from '@/services/calls.service'
  import { useNotification } from '@/composables/useNotification'

  const router = useRouter()
  const notification = useNotification()

  const todayLabel = new Intl.DateTimeFormat('ar', {
    calendar: 'gregory',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
    .format(new Date())
    .replace('، ', ' ')

  const searchQuery = ref('')
  const selectedCallId = ref(null)
  const activeTab = ref('data')
  const selectedOutcome = ref('')
  const resultNote = ref('')
  const resultLeadId = ref('')
  const durationSec = ref('')
  const nextCallAt = ref('')
  const rescheduleReason = ref('')
  const noteText = ref('')
  const activeFilter = ref(permissions.can('callCenter.queue') ? 'all' : 'إعادة جدولة')
  const isLoading = ref(true)
  const loadError = ref(null)
  const isSaving = ref(false)
  const isSavingNote = ref(false)
  const historyEntries = ref([])
  const historyLoading = ref(false)
  const historyError = ref('')
  const historyPage = ref(1)
  const historyLimit = 20
  let historyVersion = 0

  const filterTabs = [
    { key: 'all', label: 'الكل' },
    { key: 'إعادة جدولة', label: 'إعادة جدولة' },
    { key: 'لا يرد', label: 'لا يرد' },
    { key: 'غير مهتم', label: 'غير مهتم' },
    { key: 'مهتم', label: 'مهتم' }
  ]

  const tabs = [
    { key: 'history', label: 'تاريخ التواصل' },
    { key: 'notes', label: 'ملاحظات العميل' },
    { key: 'data', label: 'بيانات العميل' }
  ]
  const permittedFilterTabs = computed(() => filterTabs.filter(tab => permissions.can(tab.key === 'إعادة جدولة' ? 'callCenter.rescheduleList' : 'callCenter.queue')))

  const projectTypes = computed(() => [...new Set(callsList.value.map(call => call.projectType).filter(Boolean))])

  /*
   * الترتيب معكوس عشان أول عنصر في الـ DOM يظهر أقصى اليمين مع RTL
   * (مهتم يمين، إعادة جدولة يسار) زي فيجما بالظبط.
   */
  const callOutcomes = [
    {
      key: 'interested',
      label: 'مهتم',
      sub: 'أبدى اهتمام بالشراء',
      icon: Star,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-600'
    },
    {
      key: 'not_interested',
      label: 'غير مهتم',
      sub: 'لا رغبة في الشراء',
      icon: ThumbsDown,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      activeClass: 'border-red-400 bg-red-50 text-red-600'
    },
    {
      key: 'no_answer',
      label: 'لا يرد',
      sub: 'لم يرد على المكالمة',
      icon: PhoneOff,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
      activeClass: 'border-gray-400 bg-gray-100 text-gray-700'
    },
    {
      key: 'reschedule',
      label: 'إعادة جدولة',
      sub: 'طلب موعد آخر',
      icon: CalendarClock,
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      activeClass: 'border-secondary bg-secondary/10 text-secondary'
    }
  ]

  const callsList = ref([])
  const isRescheduleList = computed(() => activeFilter.value === 'إعادة جدولة')
  let loadVersion = 0

  async function loadCalls() {
    const requestVersion = ++loadVersion
    isLoading.value = true
    loadError.value = null
    callsList.value = []
    selectedCallId.value = null
    selectedOutcome.value = ''
    resultNote.value = ''
    noteText.value = ''
    try {
      const queue = isRescheduleList.value
        ? await callsService.getRescheduled()
        : await callsService.getQueue()
      if (requestVersion !== loadVersion) return
      if (!Array.isArray(queue)) {
        throw new Error('تعذّر قراءة استجابة قائمة المكالمات. يلزم تأكيد تنسيق البيانات من توثيق الخدمة.')
      }
      callsList.value = queue
      if (!selectedCallId.value && callsList.value.length) {
        selectedCallId.value = callsList.value[0].id
      }
    } catch (err) {
      if (requestVersion !== loadVersion) return
      callsList.value = []
      selectedCallId.value = null
      loadError.value = err
    } finally {
      if (requestVersion === loadVersion) isLoading.value = false
    }
  }

  onMounted(loadCalls)
  watch(isRescheduleList, loadCalls, { flush: 'sync' })
  onUnmounted(() => { loadVersion++; historyVersion++ })

  const filteredCalls = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase()
    return callsList.value.filter(call => {
      const matchesSearch = !query || [call.name, call.phone, call.agent]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query))
      const matchesOutcome = activeFilter.value === 'all' || isRescheduleList.value || call.lastResult === activeFilter.value
      return matchesSearch && matchesOutcome
    })
  })

  const selectedCall = computed(() => callsList.value.find(c => c.id === selectedCallId.value) ?? null)
  watch(selectedCall, call => {
    resultLeadId.value = typeof call?.leadId === 'string' ? call.leadId : ''
    durationSec.value = ''
    nextCallAt.value = ''
    rescheduleReason.value = ''
  })

  async function loadHistory() {
    const version = ++historyVersion
    historyEntries.value = []
    historyError.value = ''
    historyLoading.value = false
    if (activeTab.value !== 'history' || !selectedCall.value) return
    if (!resultLeadId.value.trim()) {
      historyError.value = 'أدخل معرّف العميل في حقل Lead ID لعرض سجل مكالماته'
      return
    }
    historyLoading.value = true
    try {
      const response = await callsService.getCustomerHistory({ leadId: resultLeadId.value, page: historyPage.value, limit: historyLimit })
      if (version !== historyVersion) return
      // Do not guess an undocumented pagination envelope or silently show an empty list.
      const entries = Array.isArray(response) ? response : response?.data
      if (!Array.isArray(entries)) {
        throw new Error('تم استلام الرد، لكن يلزم تأكيد تنسيق استجابة سجل المكالمات لعرض بياناته')
      }
      historyEntries.value = entries
    } catch (error) {
      if (version === historyVersion) historyError.value = error.message || 'تعذّر تحميل سجل المكالمات'
    } finally {
      if (version === historyVersion) historyLoading.value = false
    }
  }

  watch([selectedCallId, resultLeadId, activeTab], () => {
    if (historyPage.value !== 1) historyPage.value = 1
    else loadHistory()
  })
  watch(historyPage, loadHistory)

  const callAttemptsText = computed({
    get: () => (selectedCall.value?.callAttempts ? String(selectedCall.value.callAttempts) : ''),
    set: val => {
      if (!selectedCall.value) return
      selectedCall.value.callAttempts = val === '' ? null : Number(val)
    }
  })

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
    if (isSaving.value) return
    selectedCallId.value = call.id
    selectedOutcome.value = ''
    resultNote.value = ''
    noteText.value = ''
    activeTab.value = 'data'
  }

  async function saveNote() {
    if (!permissions.can('callCenter.logCall')) return
    if (!noteText.value.trim() || !selectedCall.value || isSavingNote.value) return
    isSavingNote.value = true
    try {
      await callsService.addNote(selectedCall.value.id, noteText.value.trim())
      notification.success('تم حفظ الملاحظة')
      noteText.value = ''
    } catch (err) {
      notification.error(err?.message || 'تعذر حفظ الملاحظة')
    } finally {
      isSavingNote.value = false
    }
  }

  async function saveCallResult() {
    if (!permissions.can('callCenter.logCall')) return
    if (!selectedOutcome.value || !resultNote.value.trim() || !selectedCall.value || isSaving.value) return
    const seconds = Number(durationSec.value)
    if (!resultLeadId.value.trim() || durationSec.value === '' || !Number.isInteger(seconds) || seconds < 0) {
      notification.error('أدخل معرّف العميل ومدة صحيحة للمكالمة بالثواني')
      return
    }
    const payload = {
      leadId: resultLeadId.value.trim(),
      direction: 'outbound',
      outcome: selectedOutcome.value,
      resultNotes: resultNote.value.trim(),
      durationSec: seconds,
    }
    if (selectedOutcome.value === 'reschedule') {
      const nextDate = new Date(nextCallAt.value)
      if (!nextCallAt.value || !Number.isFinite(nextDate.getTime()) || nextDate.getTime() <= Date.now() || !rescheduleReason.value.trim()) {
        notification.error('أدخل موعدًا قادمًا صحيحًا وسبب إعادة الجدولة')
        return
      }
      payload.nextCallAt = nextDate.toISOString()
      payload.rescheduleReason = rescheduleReason.value.trim()
    }

    isSaving.value = true
    try {
      const currentIndex = filteredCalls.value.findIndex(call => call.id === selectedCallId.value)
      const nextId = filteredCalls.value[currentIndex + 1]?.id
      await callsService.saveOutcome(payload)
      notification.success('تم حفظ نتيجة المكالمة')
      await loadCalls()
      if (nextId && callsList.value.some(call => call.id === nextId)) selectedCallId.value = nextId
    } catch (err) {
      notification.error(err?.message || 'تعذر حفظ نتيجة المكالمة')
    } finally {
      isSaving.value = false
    }
  }

  function callStatusClass(status) {
    const map = {
      'في الانتظار': 'bg-amber-50 text-amber-600',
      'على الأعمدة': 'bg-secondary/10 text-secondary',
      منتظم: 'bg-emerald-50 text-emerald-600',
      مكتمل: 'bg-gray-100 text-gray-500'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }

  function priorityClass(priority) {
    const map = {
      'عالي الأهمية': 'bg-red-50 text-red-500',
      'متوسط الأهمية': 'bg-amber-50 text-amber-600',
      'منخفض الأهمية': 'bg-emerald-50 text-emerald-600'
    }
    return map[priority] ?? 'bg-gray-100 text-gray-500'
  }

  function historyIcon(type) {
    if (type === 'مكالمة صادر') return PhoneOutgoing
    if (type === 'مكالمة وارد') return PhoneIncoming
    if (type === 'مكالمة فائتة') return PhoneMissed
    if (type === 'رسالة صادر') return MessageSquare
    return Phone
  }

  function historyIconBg(type) {
    if (type === 'مكالمة صادر') return 'bg-secondary/10'
    if (type === 'مكالمة وارد') return 'bg-teal-50'
    if (type === 'مكالمة فائتة') return 'bg-red-50'
    if (type === 'رسالة صادر') return 'bg-purple-50'
    return 'bg-gray-100'
  }

  function historyIconColor(type) {
    if (type === 'مكالمة صادر') return 'text-secondary'
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
      'إعادة جدولة': 'bg-secondary/10 text-secondary'
    }
    return map[result] ?? 'bg-gray-100 text-gray-500'
  }
</script>

<style scoped>
.call-result-card { padding: 24px; border-radius: 16px; }
.call-result-card [data-outcome] { min-height: 132px; justify-content: center; gap: 8px; border-radius: 16px; font-size: 14px; }
.call-result-card [data-outcome] > span:first-of-type { font-weight: 400; }
.call-result-card [data-outcome] > span:last-child { font-size: 12px; }
.call-result-card [data-outcome='interested'] { background: #ecfdf5; color: #00a779; }
.call-result-card [data-outcome='not_interested'] { background: #fff0ee; color: #dc2626; }
.call-result-card [data-outcome='no_answer'] { background: #f3f4f8; color: #4b5563; }
.call-result-card [data-outcome='reschedule'] { background: #f6f2ff; color: #9254ff; }
.call-result-card [data-outcome][aria-pressed='true'] { border-color: currentColor; }
.call-result-card [data-outcome] > div { background: transparent; }
.call-result-card :deep(label), .call-result-card > div > p { font-size: 14px; font-weight: 400; color: #222; }
.call-result-card :deep(input) { min-height: 52px; border: 1px solid #e7e7e7; background: white; border-radius: 10px; }
.call-result-card textarea { border: 1px solid #e7e7e7; background: white; border-radius: 10px; padding: 14px 18px; font-size: 12px; resize: vertical; }
.call-result-card textarea::placeholder { color: #a3a3a3; }
.call-result-card #rescheduleReason { min-height: 72px; }
.call-result-card textarea[rows='5'] { min-height: 144px; }
.result-save { width: min(100%, 402px); min-height: 48px; border-radius: 9px; }
@media (max-width: 640px) { .call-result-card { padding: 16px; } .result-save { width: 100%; } }
</style>
