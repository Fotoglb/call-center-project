<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مركز الاتصالات</h1>
        <p class="text-xs text-gray-400 mt-1">
          نظرة عامة على جميع مكالمات العملاء وتصنيفها حسب الحالة
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 text-xs text-white bg-gray-900 rounded-lg px-3 py-2 hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <ListChecks :size="14" />
          قائمة المكالمات
        </button>
        <button
          class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="router.push({ name: 'Reports' })"
        >
          <BarChart2 :size="14" />
          تحليل المكالمات
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-6 gap-3">
      <button
        v-for="stat in stats"
        :key="stat.key"
        class="bg-white rounded-xl border p-4 text-start transition-colors cursor-pointer"
        :class="
          statusFilter === stat.key
            ? 'border-indigo-400 ring-2 ring-indigo-100'
            : 'border-gray-200 hover:border-gray-300'
        "
        @click="toggleStatusFilter(stat.key)"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center mb-2" :class="stat.iconBg">
          <component :is="stat.icon" :size="15" :class="stat.iconColor" />
        </div>
        <p class="text-lg font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Toolbar: search + filters (rightmost in RTL) beside Excel/PDF export (leftmost) -->
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="relative flex-1 min-w-48">
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
          <div class="relative shrink-0">
            <select
              v-model="typeFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">النوع : الكل</option>
              <option v-for="t in callTypes" :key="t" :value="t">{{ t }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative shrink-0">
            <select
              v-model="agentFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">الموظف : الكل</option>
              <option v-for="a in agentsList" :key="a" :value="a">{{ a }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative shrink-0">
            <select
              v-model="statusFilter"
              class="appearance-none w-36 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="">النتيجة : الكل</option>
              <option v-for="s in stats" :key="s.key" :value="s.key">{{ s.label }}</option>
            </select>
            <ChevronDown
              :size="12"
              class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <FileSpreadsheet :size="14" />
            Excel
          </button>
          <button
            class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <FileText :size="14" />
            PDF
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                اسم العميل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                رقم الهاتف
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الموظف المسؤول
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                النوع
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                التاريخ
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الحالة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                ملاحظات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="call in paginatedCalls"
              :key="call.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  @click="router.push({ name: 'CustomerProfile', params: { id: call.id } })"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0"
                  >
                    {{ call.name.charAt(0) }}
                  </div>
                  <span
                    class="font-medium text-gray-800 whitespace-nowrap hover:text-indigo-600 hover:underline transition-colors"
                    >{{ call.name }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ call.phone }}</td>
              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ call.agent }}</td>
              <td class="px-4 py-3">
                <span class="font-medium whitespace-nowrap" :class="typeClass(call.type)">{{
                  call.type
                }}</span>
              </td>
              <td class="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                {{ call.date }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="statusClass(call.status)"
                >
                  {{ call.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500 max-w-55 truncate" :title="call.note">
                {{ call.note }}
              </td>
            </tr>

            <tr v-if="paginatedCalls.length === 0">
              <td colspan="7" class="text-center text-gray-400 py-8">لا توجد نتائج</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-400">
          عرض {{ filteredCalls.length === 0 ? 0 : startIndex + 1 }}-{{ endIndex }} من أصل
          {{ filteredCalls.length }} مكالمة
        </p>
        <div class="flex items-center gap-1">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronRight :size="14" />
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors"
            :class="
              p === currentPage ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            "
            @click="currentPage = p"
          >
            {{ p }}
          </button>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <ChevronLeft :size="14" />
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">عدد السجلات:</span>
          <select
            v-model="pageSize"
            class="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none cursor-pointer"
            @change="currentPage = 1"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ListChecks,
    BarChart2,
    FileSpreadsheet,
    FileText,
    Calendar,
    RefreshCw,
    PhoneOff,
    XCircle,
    CheckCircle2,
    PhoneCall
  } from '@lucide/vue'

  const router = useRouter()

  const searchQuery = ref('')
  const typeFilter = ref('')
  const agentFilter = ref('')
  const statusFilter = ref('غير مهتم')
  const currentPage = ref(1)
  const pageSize = ref(10)

  const callTypes = ['وارد', 'صادر']

  const callsList = [
    {
      id: 1,
      name: 'عبد الله الخالدي',
      phone: '0505551234',
      agent: 'سارة أحمد',
      type: 'وارد',
      date: '10/6/2026',
      status: 'زيارة مجدولة',
      note: 'تم الاتفاق على موعد الزيارة الميدانية للمشروع'
    },
    {
      id: 2,
      name: 'نورا محمد',
      phone: '0555561234',
      agent: 'محمد علي',
      type: 'صادر',
      date: '14/6/2026',
      status: 'إعادة الجدولة',
      note: 'طلب العميل تأجيل الموعد لظروف طارئة'
    },
    {
      id: 3,
      name: 'فاطمة علي',
      phone: '0555569876',
      agent: 'هند الفضل',
      type: 'وارد',
      date: '16/6/2026',
      status: 'لا يرد',
      note: 'لم يتم الرد، تم ترك رسالة صوتية'
    },
    {
      id: 4,
      name: 'سالم سعيد',
      phone: '0555564321',
      agent: 'إبراهيم أحمد',
      type: 'صادر',
      date: '17/6/2026',
      status: 'غير مهتم',
      note: 'أفاد العميل بعدم رغبته في المتابعة حالياً'
    },
    {
      id: 5,
      name: 'علي حسن',
      phone: '0555565078',
      agent: 'فاطمة حسن',
      type: 'وارد',
      date: '18/6/2026',
      status: 'مهتم',
      note: 'أبدى اهتماماً كبيراً وطلب إرسال عرض السعر'
    },
    {
      id: 6,
      name: 'خالد المطيري',
      phone: '0555565678',
      agent: 'يوسف سالم',
      type: 'صادر',
      date: '18/6/2026',
      status: 'إعادة الجدولة',
      note: 'تعذر التواصل، سيُعاد الاتصال غداً'
    },
    {
      id: 7,
      name: 'رنا الغامدي',
      phone: '0557654321',
      agent: 'سارة أحمد',
      type: 'وارد',
      date: '19/6/2026',
      status: 'مهتم',
      note: 'طلبت جدولة زيارة ميدانية خلال الأسبوع'
    },
    {
      id: 8,
      name: 'فهد القحطاني',
      phone: '0511223344',
      agent: 'محمد علي',
      type: 'صادر',
      date: '20/6/2026',
      status: 'غير مهتم',
      note: 'الميزانية غير متوفرة حالياً'
    },
    {
      id: 9,
      name: 'منى الشمري',
      phone: '0522334455',
      agent: 'طارق محمد',
      type: 'وارد',
      date: '20/6/2026',
      status: 'زيارة مجدولة',
      note: 'تم تحديد موعد الزيارة الأربعاء القادم'
    },
    {
      id: 10,
      name: 'ياسر العتيبي',
      phone: '0533445566',
      agent: 'هند الفضل',
      type: 'صادر',
      date: '21/6/2026',
      status: 'لا يرد',
      note: 'حاولنا الاتصال 3 مرات دون رد'
    },
    {
      id: 11,
      name: 'لمياء الحربي',
      phone: '0544556677',
      agent: 'إبراهيم أحمد',
      type: 'وارد',
      date: '21/6/2026',
      status: 'مهتم',
      note: 'وافقت على استلام العرض عبر البريد الإلكتروني'
    },
    {
      id: 12,
      name: 'ماجد السبيعي',
      phone: '0555667788',
      agent: 'فاطمة حسن',
      type: 'صادر',
      date: '22/6/2026',
      status: 'غير مهتم',
      note: 'يفضل التعامل مع مزود آخر'
    },
    {
      id: 13,
      name: 'ريم الدوسري',
      phone: '0566778899',
      agent: 'يوسف سالم',
      type: 'وارد',
      date: '22/6/2026',
      status: 'زيارة مجدولة',
      note: 'مهتمة بمشروع سكني، تم جدولة زيارة'
    },
    {
      id: 14,
      name: 'بندر الحارثي',
      phone: '0577889900',
      agent: 'سارة أحمد',
      type: 'صادر',
      date: '23/6/2026',
      status: 'إعادة الجدولة',
      note: 'طلب التواصل بعد نهاية الشهر'
    },
    {
      id: 15,
      name: 'هيا العنزي',
      phone: '0588990011',
      agent: 'محمد علي',
      type: 'وارد',
      date: '23/6/2026',
      status: 'مهتم',
      note: 'أبدت اهتماماً وطلبت مزيداً من التفاصيل'
    },
    {
      id: 16,
      name: 'عمر الزهراني',
      phone: '0599001122',
      agent: 'طارق محمد',
      type: 'صادر',
      date: '24/6/2026',
      status: 'لا يرد',
      note: 'الرقم غير متاح حالياً'
    }
  ]

  const agentsList = [...new Set(callsList.map(c => c.agent))]

  const statConfig = {
    'زيارة مجدولة': { icon: Calendar, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    'إعادة الجدولة': { icon: RefreshCw, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    'لا يرد': { icon: PhoneOff, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    'غير مهتم': { icon: XCircle, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    مهتم: { icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' }
  }

  const stats = computed(() => {
    const entries = Object.keys(statConfig).map(key => ({
      key,
      label: key,
      value: String(callsList.filter(c => c.status === key).length),
      ...statConfig[key]
    }))
    entries.push({
      key: '',
      label: 'إجمالي المكالمات',
      value: String(callsList.length),
      icon: PhoneCall,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500'
    })
    return entries
  })

  function toggleStatusFilter(key) {
    statusFilter.value = statusFilter.value === key ? '' : key
    currentPage.value = 1
  }

  const filteredCalls = computed(() => {
    return callsList.filter(c => {
      if (statusFilter.value && c.status !== statusFilter.value) return false
      if (typeFilter.value && c.type !== typeFilter.value) return false
      if (agentFilter.value && c.agent !== agentFilter.value) return false
      const q = searchQuery.value.trim().toLowerCase()
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.phone.includes(q) &&
        !c.agent.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredCalls.value.length / pageSize.value))
  )
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() =>
    Math.min(startIndex.value + pageSize.value, filteredCalls.value.length)
  )

  const paginatedCalls = computed(() => filteredCalls.value.slice(startIndex.value, endIndex.value))

  function typeClass(type) {
    return type === 'وارد' ? 'text-emerald-600' : 'text-indigo-600'
  }

  function statusClass(status) {
    const map = {
      'زيارة مجدولة': 'bg-amber-50 text-amber-600',
      'إعادة الجدولة': 'bg-indigo-50 text-indigo-600',
      'لا يرد': 'bg-gray-100 text-gray-500',
      'غير مهتم': 'bg-red-50 text-red-500',
      مهتم: 'bg-emerald-50 text-emerald-600'
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }
</script>
