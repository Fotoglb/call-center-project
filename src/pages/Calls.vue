<template>
  <div class="flex flex-col min-h-0 gap-4">
    <!-- Page Header -->
    <div class="flex flex-wrap items-start justify-between gap-3 shrink-0">
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
    <div class="calls-columns grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0" dir="rtl">
      <!-- LEFT: Calls List -->
      <div class="call-queue bg-white rounded-2xl flex flex-col min-h-0 min-w-0">
        <!-- Scheduled Label -->
        <p class="text-base font-medium text-gray-900 px-4 pt-4">
          {{ activeFilter === 'all' ? 'قائمة العملاء' : 'قائمة المكالمات المجدولة' }} – {{ queueDateLabel || todayLabel }}
        </p>

        <!-- Search -->
        <div class="px-4 py-2.5 shrink-0">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث عن عميل، رقم هاتف، موظف..."
              class="w-full h-[52px] ps-10 pe-3 bg-white border border-gray-300 rounded-[10px] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-secondary"
            />
            <Search
              :size="22"
              class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 px-4 py-2 shrink-0 overflow-x-auto">
          <button
            v-for="f in permittedFilterTabs"
            :key="f.key"
            class="px-3 py-4 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
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
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-auto px-4 pb-4">
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
            class="queue-entry relative w-full flex items-start gap-3 px-3 py-4 transition-colors text-start cursor-pointer rounded-md border-r-4"
            :class="
              selectedCallId === call.id
                ? 'bg-blue-light border-blue-dark'
                : 'border-transparent hover:bg-white'
            "
            @click="selectCall(call)"
          >
            <!-- Number badge -->
            <div
              class="text-sm shrink-0 text-gray-400"
            >
              {{ call.position ?? idx + 1 }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-3">
              <p class="text-base font-bold truncate text-gray-700">
                {{ call.name }}
              </p>
              <span class="text-xs px-3 py-1.5 rounded-lg shrink-0" :class="call.callStatus === 'new' ? 'bg-emerald-50 text-emerald-600' : historyResultClass(call.lastResult)">{{ call.callStatus === 'new' ? 'جديد' : call.lastResult }}</span>
              </div>
              <p class="text-sm tabular-nums mt-2 text-end text-gray-600" dir="ltr">
                {{ call.phone }}
              </p>
              <!-- Badges row -->
              <div class="flex items-center justify-between gap-2 mt-4">
                <span
                  class="text-xs px-4 py-1.5 rounded-lg font-medium"
                  :class="priorityClass(call.priority)"
                >
                  {{ call.priority }}
                </span>
                <span class="flex items-center gap-2 text-xs text-gray-400" title="مدة آخر مكالمة مسجلة"><Clock :size="14" /><span>{{ formatCallDuration(call.lastCallDurationSec ?? call.lastDurationSec) }}</span></span>
              </div>
            </div>

          </button>

          <p v-if="filteredCalls.length === 0" class="text-center text-xs text-gray-400 py-8">
            لا توجد نتائج
          </p>
          <div v-else-if="canLoadMore" class="flex justify-center pt-2">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoadingMore"
              @click="loadMoreCalls"
            >
              {{ isLoadingMore ? 'جارٍ تحميل المزيد...' : 'عرض المزيد' }}
            </button>
          </div>
          </template>
        </div>
      </div>

      <!-- RIGHT: Customer Detail -->
      <div class="call-detail-column lg:col-span-2 flex flex-col gap-4 min-w-0">
        <!-- No Selection State -->
        <div
          v-if="!selectedCall"
          class="min-h-80 sm:min-h-96 bg-white rounded-2xl border border-gray-100 flex items-center justify-center px-6 py-12"
          role="status"
          aria-live="polite"
          :aria-busy="isLoading"
        >
          <div class="text-center max-w-sm">
            <div
              class="w-20 h-20 rounded-2xl bg-blue-light flex items-center justify-center mx-auto mb-6"
            >
              <RefreshCw v-if="isLoading" :size="28" class="text-blue motion-safe:animate-spin" aria-hidden="true" />
              <Phone v-else :size="28" class="text-blue" aria-hidden="true" />
            </div>
            <h3 class="text-base font-bold text-gray-800 mb-2">
              {{ isLoading ? 'جارٍ تحميل المكالمات' : loadError ? 'تعذّر تحميل المكالمات' : !callsList.length ? 'لا توجد مكالمات لعرضها' : !filteredCalls.length ? 'لا توجد نتائج مطابقة' : 'اختر عميلاً لعرض التفاصيل' }}
            </h3>
            <p class="text-sm text-gray-400 leading-7">
              {{ isLoading ? 'ستظهر بيانات العملاء هنا عند اكتمال التحميل.' : loadError ? 'أعد المحاولة من قائمة المكالمات.' : !callsList.length ? 'عند توفر مكالمات في القائمة، يمكنك اختيار عميل لعرض بياناته وسجل التواصل.' : !filteredCalls.length ? 'جرّب تغيير البحث أو الفلتر لعرض العملاء.' : 'اختر عميلاً من قائمة المكالمات لعرض بياناته وسجل التواصل وتسجيل نتيجة المكالمة.' }}
            </p>
          </div>
        </div>

        <!-- Selected Customer -->
        <template v-else>
          <!-- Customer Header + Tabs/Content Card -->
          <div class="call-customer-card shrink-0 bg-white rounded-2xl flex flex-col">
            <div class="p-6 shrink-0">
              <div class="flex items-start justify-between flex-wrap gap-3">
                <!-- Info -->
                <div class="flex items-center gap-4">
                  <div
                    class="w-16 h-16 rounded-xl border border-blue bg-blue-light flex items-center justify-center text-xl font-bold text-blue shrink-0"
                  >
                    {{ selectedCall.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-xl font-bold text-gray-700">{{ selectedCall.name }}</h2>
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium"
                        :class="callStatusClass(selectedCall.status)"
                      >
                        {{ selectedCall.status }}
                      </span>
                    </div>
                    <div class="customer-summary flex items-center flex-wrap gap-1.5 mt-2">
                      <p class="tabular-nums" dir="ltr">
                        {{ selectedCall.phone }}
                      </p>

                      <span
                        v-for="tag in headerTags"
                        :key="tag"
                        class="summary-tag"
                        >· {{ tag }}</span
                      >
                      <span
                        >· آخر تواصل: {{ lastContactLabel }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    v-if="permissions.can('callCenter.logCall') && resultLeadId"
                    type="button"
                    class="flex items-center justify-center gap-2 text-sm text-white bg-blue rounded-xl px-4 h-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isDialing || isSaving"
                    @click="startCall"
                  >
                    <Phone :size="16" />
                    {{ isDialing ? 'جارٍ بدء الاتصال...' : 'الاتصال الآن' }}
                  </button>
                  <button
                    v-if="permissions.can('customerProfile.view') && resultLeadId"
                    class="flex items-center justify-center text-sm text-gray-900 bg-slate-50 border border-slate-200 rounded-xl w-28 h-12 hover:bg-white cursor-pointer transition-colors"
                    @click="
                      router.push({ name: 'CustomerProfile', params: { id: resultLeadId } })
                    "
                  >
                    عرض الملف
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabs + History -->
            <div class="flex-1 flex flex-col min-h-0 border-t border-gray-200">
              <!-- Tabs -->
              <div class="flex items-center gap-1 mx-6 pt-3 border-b border-gray-100 shrink-0 overflow-x-auto">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  class="px-4 py-4 text-sm font-medium transition-colors cursor-pointer shrink-0"
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
              <div class="p-6">
                <!-- Contact History Tab -->
                <div v-if="activeTab === 'history'" class="space-y-3">
                  <div class="flex items-center justify-between gap-3 mb-3">
                    <p class="text-base font-medium text-gray-900">سجل المحادثات</p>
                    <span v-if="!historyLoading && !historyError" class="text-sm text-gray-400">{{ historyTotal }} تفاعلات</span>
                  </div>
                  <p v-if="historyLoading" class="text-sm text-gray-500">جارٍ تحميل سجل المكالمات...</p>
                  <div v-else-if="historyError" role="alert" class="text-sm text-red-500">
                    <p>{{ historyError }}</p>
                    <button type="button" class="mt-2 text-blue underline" @click="loadHistory">إعادة المحاولة</button>
                  </div>
                  <p v-else-if="!historyEntries.length" class="text-sm text-gray-500">لا توجد مكالمات في هذه الصفحة</p>
                  <div v-for="entry in historyEntries" :key="entry.id" class="history-entry flex items-center gap-4 py-4">
                    <!-- Icon -->
                    <div
                      class="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                      :class="historyIconBg(entry.type)"
                    >
                      <component
                        :is="historyIcon(entry.type)"
                        :size="24"
                        :class="historyIconColor(entry.type)"
                      />
                    </div>

                    <!-- Body -->
                    <div class="flex-1 min-w-0 bg-white rounded-xl p-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-bold text-gray-800">{{
                              entry.type
                            }}</span>
                            <div class="flex items-center gap-1 text-gray-400">
                              <Clock :size="11" />
                              <span class="text-xs tabular-nums">{{ entry.duration }}</span>
                            </div>
                          </div>
                          <p class="text-xs text-gray-500 leading-relaxed">{{ entry.note }}</p>
                          <p class="text-xs text-gray-400 mt-1">بواسطة {{ entry.agent }}</p>
                        </div>
                        <div class="history-meta flex items-center gap-2 shrink-0">
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

                <!-- Customer Data Tab -->
                <div v-if="activeTab === 'data'" class="customer-call-data space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <Label for="dataAgent">الموظف المسؤول</Label>
                      <select id="dataAgent" v-model="selectedCall.assignedTo" disabled class="w-full border border-gray-200 rounded-lg bg-white">
                        <option value="">اختر الموظف المسؤول</option>
                        <option v-if="selectedCall.assignedTo && !employeeOptions.some(item => item.id === selectedCall.assignedTo)" :value="selectedCall.assignedTo">{{ selectedCall.agent }}</option>
                        <option v-for="employee in employeeOptions" :key="employee.id" :value="employee.id">{{ employee.name }}</option>
                      </select>
                      <p v-if="employeeOptionsError" class="text-xs text-red-500">{{ employeeOptionsError }}</p>
                    </div>
                    <div class="space-y-1.5">
                      <Label for="dataDirection">نوع المكالمة</Label>
                      <select id="dataDirection" v-model="callDirection" disabled class="w-full border border-gray-200 rounded-lg bg-white">
                        <option value="outbound">صادر</option>
                        <option value="inbound">وارد</option>
                      </select>
                    </div>
                    <div class="space-y-1.5">
                      <Label for="dataFullName">الاسم بالكامل <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <Input id="dataFullName" v-model="selectedCall.name" disabled type="text" class="ps-10" />
                        <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
                          <UserRound :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataPhone">رقم الجوال <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <Input id="dataPhone" v-model="selectedCall.phone" disabled type="text" dir="ltr" class="text-right" />
                        <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
                          <Phone :size="16" />
                        </span>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataWorkType">نوع العمل</Label>
                      <Input id="dataWorkType" v-model="selectedCall.workType" disabled type="text" />
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataSource">مصدر العميل</Label>
                      <select id="dataSource" v-model="selectedCall.sourceId" disabled class="w-full border border-gray-200 rounded-lg bg-white">
                        <option value="">اختر المصدر</option>
                        <option v-if="selectedCall.sourceId && !sourceOptions.some(item => item.value === selectedCall.sourceId)" :value="selectedCall.sourceId">{{ selectedCall.source }}</option>
                        <option v-for="source in sourceOptions" :key="source.value" :value="source.value">{{ source.label }}</option>
                      </select>
                      <p v-if="sourceOptionsError" class="text-xs text-red-500">{{ sourceOptionsError }}</p>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataCreatedAt">تاريخ الإنشاء</Label>
                      <div class="relative">
                        <Input id="dataCreatedAt" v-model="selectedCall.projectCreatedAt" disabled type="date" dir="ltr" />
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataProjectType">نوع مشروع العميل <span class="text-red-400">*</span></Label>
                      <div class="relative">
                        <select
                          id="dataProjectType"
                          v-model="selectedCall.projectType"
                          disabled
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
                      <Label for="durationSec">مدة المكالمة بالثواني</Label>
                      <div class="relative">
                        <Input id="durationSec" v-model="durationSec" :disabled="isSaving" type="number" min="0" step="1" />
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <Label for="dataTalkTime">وقت الحديث</Label>
                      <Input id="dataTalkTime" v-model="selectedCall.priority" disabled />
                    </div>
                    <div class="space-y-1.5">
                      <Label for="dataOutcome">الحالة</Label>
                      <select id="dataOutcome" v-model="selectedOutcome" disabled class="w-full border border-gray-200 rounded-lg bg-white">
                        <option value="">اختر الحالة</option>
                        <option v-for="outcome in callOutcomes" :key="outcome.key" :value="outcome.key">{{ outcome.label }}</option>
                      </select>
                    </div>
                    <div class="space-y-1.5">
                      <Label for="dataNotes">ملاحظات</Label>
                      <Input id="dataNotes" v-model="resultNote" disabled />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


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

            <p v-if="saveError" role="alert" class="mt-3 text-sm text-red-500">{{ saveError }}</p>
            <button
              type="button"
              class="result-save flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue rounded-lg px-4 py-2.5 mt-3 cursor-pointer transition-colors hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
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
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Search,
    Phone,
    RefreshCw,
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
  import { customersService } from '@/services/customers.service'
  import { usersService } from '@/services/users.service'
  import { useNotification } from '@/composables/useNotification'
  import { useCallDial } from '@/composables/useCallDial'

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
  const saveError = ref('')
  function reportSaveError(message) {
    saveError.value = message
    notification.error(message)
  }
  const resultLeadId = ref('')
  const { isDialing, startCall } = useCallDial(() => resultLeadId.value)
  const durationSec = ref('')
  const callDirection = ref('outbound')
  const nextCallAt = ref('')
  const rescheduleReason = ref('')
  const activeFilter = ref(permissions.can('callCenter.queue') ? 'all' : 'reschedule')
  const isLoading = ref(true)
  const loadError = ref(null)
  const isSaving = ref(false)
  const historyEntries = ref([])
  const historyTotal = ref(0)
  const headerTags = computed(() => [...new Set([
    selectedCall.value?.source,
    selectedCall.value?.workType,
    ...(selectedCall.value?.tags ?? [])
  ].filter(Boolean))])
  const lastContactLabel = computed(() => selectedCall.value?.lastContact)
  const historyLoading = ref(false)
  const historyError = ref('')
  const historyPage = ref(1)
  const historyLimit = 20
  let historyVersion = 0

  const filterTabs = [
    { key: 'all', label: 'الكل' },
    { key: 'interested', label: 'مهتم' },
    { key: 'not_interested', label: 'غير مهتم' },
    { key: 'no_answer', label: 'لا يرد' },
    { key: 'reschedule', label: 'إعادة جدولة' }
  ]

  const tabs = [
    { key: 'history', label: 'تاريخ التواصل' },
    { key: 'data', label: 'بيانات العميل' }
  ]
  const permittedFilterTabs = computed(() => filterTabs.filter(tab => permissions.can('callCenter.queue')))

  const projectTypes = ['B2B', 'B2C', 'SME', 'Enterprise', 'Startup', 'E-commerce', 'Retail', 'Manufacturing', 'Service', 'Non-profit', 'Education']
  const sourceOptions = ref([])
  const employeeOptions = ref([])
  const sourceOptionsError = ref('')
  const employeeOptionsError = ref('')
  onMounted(async () => {
    await Promise.allSettled([
      (async () => {
        if (!permissions.can('customers.list|customers.create|customers.viewEdit')) return
        try { sourceOptions.value = (await customersService.getMeta()).sources }
        catch (error) { sourceOptionsError.value = error.message }
      })(),
      (async () => {
        if (!permissions.can('employees.manage')) return
        try {
          const seen = new Set()
          for (let page = 1; ; page++) {
            const response = await usersService.list({ page, limit: 100 })
            const rows = Array.isArray(response) ? response : response?.data
            if (!Array.isArray(rows)) throw new Error('تعذّر قراءة قائمة الموظفين')
            const fresh = rows.filter(row => !seen.has(row.id ?? row._id))
            for (const row of fresh) {
              const id = row.id ?? row._id
              seen.add(id)
              employeeOptions.value.push({ id, name: row.name })
            }
            if (rows.length < 100 || !fresh.length) break
          }
        } catch (error) { employeeOptionsError.value = error.message }
      })(),
    ])
  })

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
  const queuePage = ref(1)
  const queueLimit = 10
  const queueTotal = ref(null)
  const isLoadingMore = ref(false)
  const queueDate = ref('')
  const queueDateLabel = computed(() => {
    if (!queueDate.value) return ''
    const parsed = new Date(queueDate.value)
    if (Number.isNaN(parsed.getTime())) return queueDate.value
    // The API date is the queue's calendar date. Keep its UTC day instead of
    // allowing the browser timezone to shift midnight to the previous day.
    const calendarDate = new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 12)
    return new Intl.DateTimeFormat('ar', { calendar: 'gregory', dateStyle: 'full' }).format(calendarDate)
  })
  function formatCallDuration(seconds) {
    if (seconds == null || !Number.isInteger(Number(seconds)) || Number(seconds) < 0) return '—'
    const minutes = Math.floor(Number(seconds) / 60)
    const remaining = Number(seconds) % 60
    return minutes ? `${minutes} د${remaining ? ` ${remaining} ث` : ''}` : `${remaining} ث`
  }
  const isRescheduleList = computed(() => activeFilter.value === 'reschedule')
  let loadVersion = 0

  const canLoadMore = computed(() => !searchQuery.value.trim() && queueTotal.value != null && callsList.value.length < queueTotal.value)

  async function loadCalls({ append = false } = {}) {
    const requestVersion = ++loadVersion
    const query = searchQuery.value.trim()
    const page = append ? queuePage.value + 1 : 1
    if (!append) {
      isLoading.value = true
      loadError.value = null
      callsList.value = []
      selectedCallId.value = null
      selectedOutcome.value = ''
      resultNote.value = ''
      queuePage.value = 1
      queueTotal.value = null
    } else {
      isLoadingMore.value = true
    }
    try {
      let queue
      if (query) {
        const customers = await customersService.search(query, { limit: 10 })
        queue = {
          items: customers.map((customer, index) => callsService.mapCustomer(customer, index + 1)),
          date: null,
          meta: {},
          counts: {},
        }
      } else if (activeFilter.value === 'all') {
        const customers = await customersService.getList({ page, limit: queueLimit })
        queue = {
          items: customers.items.map((customer, index) => callsService.mapCustomer(customer, (page - 1) * queueLimit + index + 1)),
          date: null,
          meta: { total: customers.total },
          counts: {},
        }
      } else {
        queue = await callsService.getQueue({ status: activeFilter.value, page, limit: queueLimit })
      }
      if (requestVersion !== loadVersion) return
      if (!Array.isArray(queue?.items)) {
        throw new Error('تعذّر قراءة استجابة قائمة المكالمات. يلزم تأكيد تنسيق البيانات من توثيق الخدمة.')
      }
      const previousLength = callsList.value.length
      const nextItems = append ? [...callsList.value, ...queue.items] : queue.items
      callsList.value = nextItems.filter((item, index, items) => items.findIndex(candidate => candidate.id === item.id) === index)
      if (!query) {
        queuePage.value = page
        const rawTotal = queue.meta?.total ?? queue.meta?.count ?? queue.meta?.pagination?.total
        queueTotal.value = Number.isFinite(Number(rawTotal))
          ? Number(rawTotal)
          : queue.items.length < queueLimit || (append && callsList.value.length === previousLength)
            ? callsList.value.length
            : callsList.value.length + 1
      } else {
        queueTotal.value = queue.items.length
      }
      queueDate.value = queue.date ?? ''
      if (!selectedCallId.value && callsList.value.length) {
        selectedCallId.value = callsList.value[0].id
      }
    } catch (err) {
      if (requestVersion !== loadVersion) return
      if (!append) {
        callsList.value = []
        selectedCallId.value = null
      }
      loadError.value = err
    } finally {
      if (requestVersion === loadVersion) {
        isLoading.value = false
        isLoadingMore.value = false
      }
    }
  }

  function loadMoreCalls() {
    if (isLoadingMore.value || !canLoadMore.value) return
    loadCalls({ append: true })
  }

  onMounted(loadCalls)
  let queueSearchTimer = null
  watch([searchQuery, activeFilter], () => {
    clearTimeout(queueSearchTimer)
    queueSearchTimer = setTimeout(() => loadCalls(), 250)
  })
  onUnmounted(() => { loadVersion++; historyVersion++ })

  const filteredCalls = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase()
    return callsList.value.filter(call => {
      const matchesSearch = !query || [call.name, call.phone, call.agent]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query))
      const matchesOutcome = activeFilter.value === 'all' || call.callStatus === activeFilter.value || call.lastResult === activeFilter.value
      return matchesSearch && matchesOutcome
    })
  })

  const selectedCall = computed(() => callsList.value.find(c => c.id === selectedCallId.value) ?? null)
  const originalCustomerFields = ref({})
  function editableCustomerFields(call) {
    return {
      fullName: call?.name ?? '', phone: call?.phone ?? '',
      sourceId: call?.sourceId ?? '', assignedTo: call?.assignedTo ?? '',
      businessType: call?.workType ?? '', projectType: call?.projectType ?? '',
      projectCreatedAt: call?.projectCreatedAt ?? '',
    }
  }
  watch(selectedCall, call => {
    saveError.value = ''
    originalCustomerFields.value = editableCustomerFields(call)
    selectedOutcome.value = callOutcomes.some(outcome => outcome.key === call?.callStatus) ? call.callStatus : ''
    resultNote.value = ''
    resultLeadId.value = typeof call?.leadId === 'string' ? call.leadId : ''
    durationSec.value = ''
    callDirection.value = 'outbound'
    nextCallAt.value = ''
    rescheduleReason.value = ''
  })

  async function loadHistory() {
    const version = ++historyVersion
    historyEntries.value = []
    historyTotal.value = 0
    historyError.value = ''
    historyLoading.value = false
    if (activeTab.value !== 'history' || !selectedCall.value) return
    if (!resultLeadId.value.trim()) {
      historyError.value = 'أدخل معرّف العميل في حقل Lead ID لعرض سجل مكالماته'
      return
    }
    historyLoading.value = true
    try {
      const response = await callsService.getCustomerHistory({ leadId: resultLeadId.value, page: historyPage.value, limit: historyLimit, includeMeta: true })
      if (version !== historyVersion) return
      const entries = response.items
      if (!Array.isArray(entries)) {
        throw new Error('تم استلام الرد، لكن يلزم تأكيد تنسيق استجابة سجل المكالمات لعرض بياناته')
      }
      historyEntries.value = entries
      historyTotal.value = response.total
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
    get: () => (selectedCall.value?.callAttempts != null ? String(selectedCall.value.callAttempts) : ''),
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
    activeTab.value = 'data'
  }

  async function saveCallResult() {
    if (isSaving.value) return
    saveError.value = ''
    if (!permissions.can('callCenter.logCall')) {
      reportSaveError('ليس لديك صلاحية حفظ نتيجة المكالمة')
      return
    }
    if (!selectedCall.value) {
      reportSaveError('اختر العميل أولًا')
      return
    }
    if (!selectedOutcome.value) {
      reportSaveError('اختر حالة العميل أولًا')
      return
    }
    if (!resultNote.value.trim()) {
      reportSaveError('اكتب نتيجة المكالمة أولًا')
      return
    }
    const leadId = selectedCall.value.leadId
    if (typeof leadId !== 'string' || !leadId.trim()) {
      reportSaveError('معرّف العميل غير موجود في بيانات القائمة؛ أعد تحميلها')
      return
    }
    const seconds = Number(durationSec.value)
    if (durationSec.value === '' || durationSec.value == null || !Number.isInteger(seconds) || seconds < 0) {
      reportSaveError('أدخل مدة المكالمة بالثواني في تبويب بيانات العميل')
      activeTab.value = 'data'
      await nextTick()
      document.getElementById('durationSec')?.focus()
      return
    }
    const payload = {
      leadId: leadId.trim(),
      direction: callDirection.value,
      outcome: selectedOutcome.value,
      resultNotes: resultNote.value.trim(),
      durationSec: seconds,
    }
    if (selectedOutcome.value === 'reschedule') {
      const nextDate = new Date(nextCallAt.value)
      if (!nextCallAt.value || !Number.isFinite(nextDate.getTime()) || nextDate.getTime() <= Date.now() || !rescheduleReason.value.trim()) {
        reportSaveError('أدخل موعدًا قادمًا صحيحًا وسبب إعادة الجدولة')
        return
      }
      payload.nextCallAt = nextDate.toISOString()
      payload.rescheduleReason = rescheduleReason.value.trim()
    }

    const fields = editableCustomerFields(selectedCall.value)
    const customerPatch = Object.fromEntries(Object.entries(fields).filter(([key, value]) => value !== originalCustomerFields.value[key]))
    if (Object.keys(customerPatch).length && !permissions.can('customers.viewEdit')) {
      reportSaveError('ليس لديك صلاحية تعديل بيانات العميل')
      return
    }
    if ('fullName' in customerPatch && customerPatch.fullName.trim().length < 3) {
      reportSaveError('اسم العميل يجب أن يحتوي على 3 أحرف على الأقل')
      return
    }
    if ('phone' in customerPatch && !/^\+[1-9]\d{7,14}$/.test(customerPatch.phone.trim())) {
      reportSaveError('أدخل رقم الجوال بالصيغة الدولية مثل +9665…')
      return
    }
    if (('sourceId' in customerPatch && !customerPatch.sourceId) || ('projectType' in customerPatch && !customerPatch.projectType)) {
      reportSaveError('اختر المصدر ونوع المشروع قبل الحفظ')
      return
    }
    if ('projectCreatedAt' in customerPatch) {
      const date = new Date(`${customerPatch.projectCreatedAt}T00:00:00.000Z`)
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== customerPatch.projectCreatedAt) {
        reportSaveError('أدخل تاريخ الإنشاء بصيغة YYYY-MM-DD')
        return
      }
      customerPatch.projectCreatedAt = date.toISOString()
    }
    isSaving.value = true
    let customerSaved = false
    try {
      if ('phone' in customerPatch) {
        const matches = await customersService.checkDuplicates(customerPatch.phone.trim())
        if (matches.some(item => (item.id ?? item._id) !== leadId)) throw new Error('رقم الجوال مسجل لعميل آخر')
      }
      if (Object.keys(customerPatch).length) {
        await customersService.update(leadId, customerPatch)
        originalCustomerFields.value = fields
        customerSaved = true
      }
      const response = await callsService.saveOutcome(payload)
      notification.success(response?.message || 'تم حفظ نتيجة المكالمة')
      await loadCalls()
      const savedLead = response?.data?.lead
      const savedLeadId = savedLead?.id ?? savedLead?._id
      const savedCall = response?.data?.call
      const savedDetails = savedLeadId ? {
        ...savedLead,
        ...(savedCall?.leadId === savedLeadId ? { lastCallDurationSec: savedCall.durationSec, lastDurationSec: savedCall.durationSec } : {}),
      } : null
      if (savedDetails) {
        const savedIndex = callsList.value.findIndex(call => call.leadId === savedLeadId)
        if (savedIndex >= 0) {
          callsList.value.splice(savedIndex, 1, callsService.mapNextLead(savedDetails, callsList.value[savedIndex]))
        }
      }
      const returnedNextLead = response?.data?.nextLead
      // The updated lead is authoritative if nextLead repeats the same customer.
      const nextLead = savedDetails && (returnedNextLead?.id ?? returnedNextLead?._id) === savedLeadId
        ? { ...returnedNextLead, ...savedDetails } : returnedNextLead
      if (nextLead && (nextLead.id || nextLead._id)) {
        const nextLeadId = nextLead.id ?? nextLead._id
        const index = callsList.value.findIndex(call => call.leadId === nextLeadId)
        const nextCall = callsService.mapNextLead(nextLead, index >= 0 ? callsList.value[index] : {})
        if (index >= 0) callsList.value.splice(index, 1, nextCall)
        else callsList.value.push(nextCall)
        if (!isRescheduleList.value) activeFilter.value = 'all'
        searchQuery.value = ''
        selectedCallId.value = nextCall.id
      } else if (response?.data && Object.hasOwn(response.data, 'nextLead')) {
        selectedCallId.value = null
      }
    } catch (err) {
      reportSaveError(`${customerSaved ? 'تم حفظ بيانات العميل، لكن لم تُحفظ نتيجة المكالمة: ' : ''}${err?.message || 'تعذر حفظ نتيجة المكالمة'}`)
    } finally {
      isSaving.value = false
    }
  }

  function callStatusClass(status) {
    const map = {
      'في الانتظار': 'bg-blue-50 text-blue-500',
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
.customer-summary { font-size: 14px; font-weight: 400; color: #737373; line-height: 1.7; }
.queue-entry { min-height: 132px; }
.history-entry { min-height: 104px; }
@media (max-width: 1280px) { .history-meta { flex-direction: column; align-items: flex-end; white-space: normal; } }
.call-queue { overflow: hidden; height: clamp(460px, 78vh, 800px); align-self: start; }
@media (min-width: 1024px) {
  .calls-columns { align-items: start; }
}
.customer-call-data > .grid { gap: 24px; }
.customer-call-data :deep(input), .customer-call-data select { height: 56px; border-radius: 10px; padding-inline: 16px; font-size: 13px; border-color: #d4d4d4; background-color: white; color: #737373; }
.customer-call-data select { appearance: none; padding-inline-end: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: left 16px center; }
.customer-call-data .relative:has(select) > span { display: none; }
.customer-call-data :deep(#dataPhone) { padding-right: 40px; padding-left: 16px; }
.customer-call-data :deep(label) { font-size: 13px; font-weight: 600; }
.customer-call-data :deep(#dataFullName), .customer-call-data :deep(#dataPhone) { padding-inline-start: 40px; }
.customer-call-data > .grid > :has(#dataFullName) { order: 1; }
.customer-call-data > .grid > :has(#dataPhone) { order: 2; }
.customer-call-data > .grid > :has(#dataAgent) { order: 3; }
.customer-call-data > .grid > :has(#dataDirection) { order: 4; }
.customer-call-data > .grid > :has(#dataSource) { order: 5; }
.customer-call-data > .grid > :has(#dataWorkType) { order: 6; }
.customer-call-data > .grid > :has(#dataProjectType) { order: 7; }
.customer-call-data > .grid > :has(#dataCreatedAt) { order: 8; }
.customer-call-data > .grid > :has(#dataTalkTime) { order: 9; }
.customer-call-data > .grid > :has(#durationSec) { order: 10; }
.customer-call-data > .grid > :has(#dataOutcome) { order: 11; }
.customer-call-data > .grid > :has(#dataNotes) { order: 12; }
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
