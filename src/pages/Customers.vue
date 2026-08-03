<template>
  <div class="space-y-5">
    <!-- Actions + Filters Card -->
    <div class="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      <div class="sm:flex sm:space-y-0 space-y-3 items-start justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">إدارة العملاء المحتملين</h1>
          <p class="text-xs text-gray-400 mt-1">جميع العملاء من حملات الإعلانات والإدخال اليدوي</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-blue border border-blue bg-white rounded-lg sm:px-3 px-1 py-2 hover:bg-blue-light cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            تحميل الملف
          </button>
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-blue bg-blue-light rounded-lg sm:px-3 px-1 py-2 hover:opacity-90 cursor-pointer transition-colors"
          >
            <Plus :size="14" />
            تنزيل الملف
          </button>
          <button
            class="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-dark rounded-lg px-3 py-2 hover:opacity-90 cursor-pointer transition-colors"
            @click="router.push({ name: 'AddCustomer' })"
          >
            <Plus :size="14" />
            إضافة عميل
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <div v-for="filter in filters" :key="filter.key" class="relative">
          <select
            v-model="activeFilters[filter.key]"
            class="appearance-none text-xs text-gray-600 bg-white border border-gray-200 rounded-lg ps-3 pe-7 py-2 hover:border-gray-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="">{{ filter.label }} : الكل</option>
            <option v-for="opt in filter.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <ChevronDown
            :size="12"
            class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <div class="relative flex-1 min-w-48">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث عن عميل، رقم هاتف، موظف..."
            class="w-full h-9 ps-3 pe-8 bg-muted border border-accent/50 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-secondary"
          />
          <Search
            :size="13"
            class="absolute inset-e-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <button
          v-if="hasActiveFilter"
          class="text-xs text-red-500 hover:text-red-600 cursor-pointer px-2 py-2"
          @click="clearFilters"
        >
          مسح الكل
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead class="bg-white border-b border-gray-200">
            <tr>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                اسم العميل
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                رقم الهاتف
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                البريد الإلكتروني
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                المصدر
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                النوع
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                المدينة
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الموظف المسؤول
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                التاريخ
              </th>
              <th class="text-start px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="customer in paginatedCustomers"
              :key="customer.id"
              class="hover:bg-gray-100 transition-colors"
            >
              <td class="px-4 py-3">
                <div
                  class="flex items-center gap-2 cursor-pointer"
                  @click="router.push({ name: 'CustomerProfile', params: { id: customer.id } })"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0"
                  >
                    {{ customer.name.charAt(0) }}
                  </div>
                  <span
                    class="font-medium text-gray-800 whitespace-nowrap hover:text-indigo-600 hover:underline transition-colors"
                    >{{ customer.name }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.phone }}</td>
              <td class="px-4 py-3 text-gray-500 tabular-nums" dir="ltr">{{ customer.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer"
                  :class="sourceClass(customer.source)"
                >
                  {{ customer.source }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ customer.type }}</td>
              <td class="px-4 py-3 text-gray-500">{{ customer.city }}</td>
              <td class="px-4 py-3 text-gray-600">{{ customer.agent }}</td>
              <td class="px-4 py-3 text-gray-400 tabular-nums whitespace-nowrap">
                {{ customer.date }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    class="text-blue hover:text-blue-dark cursor-pointer transition-colors"
                    title="تعديل"
                    @click="handleEdit(customer)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="text-red hover:text-red-dark cursor-pointer transition-colors"
                    title="حذف"
                    @click="handleDelete(customer)"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between flex-wrap gap-2 px-4 py-3 border-t border-gray-200">
        <p class="text-xs text-gray-400">
          عرض {{ startIndex + 1 }}-{{ endIndex }} من أصل {{ filteredCustomers.length }} سجل
        </p>
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
              p === currentPage ? 'bg-blue text-white' : 'text-gray-500 hover:bg-gray-100'
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
      </div>
    </div>

    <ConfirmDialog
      v-model="isDeleteDialogOpen"
      title="حذف العميل"
      :message="`هل أنت متأكد من حذف “${customerToDelete?.name}”؟`"
      confirm-text="حذف"
      cancel-text="إلغاء"
    />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from '@lucide/vue'
  import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

  const router = useRouter()

  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')

  const activeFilters = ref({
    date: 'آخر 30 يوم',
    status: '',
    city: '',
    agent: '',
    source: ''
  })

  const filters = [
    {
      key: 'source',
      label: 'المصدر',
      options: [
        'جوجل أدز',
        'وسائل التواصل',
        'الاتصال المباشر',
        'إعلانات تويتر',
        'التسويق الخارجي',
        'مجتمع ميتا',
        'تسويق الشبكات'
      ]
    },
    {
      key: 'agent',
      label: 'الموظف',
      options: ['سارة أحمد', 'محمد علي', 'هند الفضل', 'فاطمة حسن', 'إبراهيم أحمد', 'طارق محمد', 'يوسف سالم']
    },
    {
      key: 'city',
      label: 'المدينة',
      options: ['الرياض', 'جدة', 'الطائف', 'المدينة المنورة', 'أبها', 'الدمام']
    },
    {
      key: 'status',
      label: 'الحالة',
      options: ['منتظم', 'عميل جديد', 'زيارة مجدولة', 'قيد التحويل', 'قيد الدراسة', 'تم الإغلاق']
    },
    {
      key: 'date',
      label: 'التاريخ',
      options: ['اليوم', 'آخر 7 أيام', 'آخر 30 يوم', 'هذا الشهر']
    }
  ]

  const customers = ref([
    {
      id: 1,
      name: 'عبد الله المطيري',
      phone: '0551234567',
      source: 'جوجل أدز',
      type: 'B2B',
      city: 'أبها',
      agent: 'سارة أحمد',
      date: '10/4/2026',
      status: 'منتظم'
    },
    {
      id: 2,
      name: 'نورا المحمد',
      phone: '0569801234',
      source: 'وسائل التواصل',
      type: 'B2C',
      city: 'الرياض',
      agent: 'محمد علي',
      date: '14/4/2026',
      status: 'عميل جديد'
    },
    {
      id: 3,
      name: 'خالد الزهراني',
      phone: '0533456789',
      source: 'الاتصال المباشر',
      type: 'Enterprise',
      city: 'الطائف',
      agent: 'محمد علي',
      date: '9/4/2026',
      status: 'زيارة مجدولة'
    },
    {
      id: 4,
      name: 'سلمان العلي',
      phone: '0561022334',
      source: 'الاتصال المباشر',
      type: 'SME',
      city: 'المدينة المنورة',
      agent: 'هند الفضل',
      date: '17/4/2026',
      status: 'قيد التحويل'
    },
    {
      id: 5,
      name: 'من الزرقاء',
      phone: '0564433667',
      source: 'إعلانات تويتر',
      type: 'Startup',
      city: 'الرياض',
      agent: 'فاطمة حسن',
      date: '18/4/2026',
      status: 'قيد الدراسة'
    },
    {
      id: 6,
      name: 'ليلى السيسي',
      phone: '0569876543',
      source: 'إعلانات جوجل',
      type: 'E-commerce',
      city: 'جدة',
      agent: 'إبراهيم أحمد',
      date: '19/4/2026',
      status: 'عميل جديد'
    },
    {
      id: 7,
      name: 'فيصل المثنى',
      phone: '0367654321',
      source: 'التسويق الخارجي',
      type: 'Retail',
      city: 'جدة',
      agent: 'إبراهيم أحمد',
      date: '20/4/2026',
      status: 'قيد الدراسة'
    },
    {
      id: 8,
      name: 'فاطمة الحربي',
      phone: '0559876543',
      source: 'إعلانات ميتا',
      type: 'Manufacturing',
      city: 'الطائف',
      agent: 'فاطمة حسن',
      date: '19/9/2026',
      status: 'قيد الدراسة'
    },
    {
      id: 9,
      name: 'طارق العزيزي',
      phone: '0559898034',
      source: 'مجتمع ميتا',
      type: 'Service',
      city: 'المدينة المنورة',
      agent: 'طارق محمد',
      date: '22/5/2026',
      status: 'منتظم'
    },
    {
      id: 10,
      name: 'فاطمة القامر',
      phone: '0952345699',
      source: 'تسويق الشبكات',
      type: 'Non-profit',
      city: 'الرياض',
      agent: 'سارة أحمد',
      date: '23/5/2026',
      status: 'تم الإغلاق'
    },
    {
      id: 11,
      name: 'يوسف القاسم',
      phone: '0312345678',
      source: 'إعلانات جوجل',
      type: 'Education',
      city: 'الطائف',
      agent: 'يوسف سالم',
      date: '24/4/2026',
      status: 'منتظم'
    },
    {
      id: 12,
      name: 'عمر الشمري',
      phone: '0505551234',
      source: 'الاتصال المباشر',
      type: 'B2B',
      city: 'الدمام',
      agent: 'هند الفضل',
      date: '1/5/2026',
      status: 'زيارة مجدولة'
    },
    {
      id: 13,
      name: 'رنا الغامدي',
      phone: '0557654321',
      source: 'وسائل التواصل',
      type: 'B2C',
      city: 'أبها',
      agent: 'محمد علي',
      date: '3/5/2026',
      status: 'عميل جديد'
    },
    {
      id: 14,
      name: 'أحمد الراشد',
      phone: '0543219876',
      source: 'جوجل أدز',
      type: 'Enterprise',
      city: 'الرياض',
      agent: 'إبراهيم أحمد',
      date: '5/5/2026',
      status: 'قيد التحويل'
    },
    {
      id: 15,
      name: 'هدى الأحمد',
      phone: '0512345678',
      source: 'إعلانات تويتر',
      type: 'SME',
      city: 'جدة',
      agent: 'سارة أحمد',
      date: '7/5/2026',
      status: 'منتظم'
    },
    {
      id: 16,
      name: 'سالم المطيري',
      phone: '0598765432',
      source: 'التسويق الخارجي',
      type: 'Startup',
      city: 'الدمام',
      agent: 'يوسف سالم',
      date: '10/5/2026',
      status: 'قيد الدراسة'
    },
    {
      id: 17,
      name: 'مريم الجهني',
      phone: '0534567890',
      source: 'مجتمع ميتا',
      type: 'Retail',
      city: 'المدينة المنورة',
      agent: 'فاطمة حسن',
      date: '12/5/2026',
      status: 'زيارة مجدولة'
    },
    {
      id: 18,
      name: 'بدر الزهراني',
      phone: '0561234567',
      source: 'تسويق الشبكات',
      type: 'Service',
      city: 'الطائف',
      agent: 'طارق محمد',
      date: '15/5/2026',
      status: 'عميل جديد'
    },
    {
      id: 19,
      name: 'لطيفة السبيعي',
      phone: '0556789012',
      source: 'الاتصال المباشر',
      type: 'Manufacturing',
      city: 'أبها',
      agent: 'هند الفضل',
      date: '17/5/2026',
      status: 'تم الإغلاق'
    },
    {
      id: 20,
      name: 'ناصر العتيبي',
      phone: '0501234567',
      source: 'جوجل أدز',
      type: 'Education',
      city: 'الرياض',
      agent: 'محمد علي',
      date: '20/5/2026',
      status: 'منتظم'
    }
  ])

  customers.value.forEach(c => {
    c.email = 'example@email.com'
  })

  function handleEdit(customer) {
    router.push({
      name: 'AddCustomer',
      query: {
        editId: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        source: customer.source,
        projectType: customer.type,
        city: customer.city
      }
    })
  }

  const isDeleteDialogOpen = ref(false)
  const customerToDelete = ref(null)

  function handleDelete(customer) {
    customerToDelete.value = customer
    isDeleteDialogOpen.value = true
  }

  function sourceClass(source) {
    const map = {
      'جوجل أدز': 'bg-blue-light text-blue',
      'إعلانات جوجل': 'bg-blue-light text-blue',
      'وسائل التواصل': 'bg-emerald-50 text-emerald-600',
      'الاتصال المباشر': 'bg-amber-50 text-amber-600',
      'إعلانات تويتر': 'bg-sky-light text-blue-dark',
      'التسويق الخارجي': 'bg-violet-light text-violet',
      'إعلانات ميتا': 'bg-indigo-50 text-indigo-600',
      'مجتمع ميتا': 'bg-indigo-50 text-indigo-600',
      'تسويق الشبكات': 'bg-pink-50 text-pink-600'
    }
    return map[source] ?? 'bg-gray-100 text-gray-600'
  }

  const defaultFilters = { date: 'آخر 30 يوم', status: '', city: '', agent: '', source: '' }

  const hasActiveFilter = computed(
    () =>
      searchQuery.value.trim() !== '' ||
      Object.keys(activeFilters.value).some(k => activeFilters.value[k] !== defaultFilters[k])
  )

  function clearFilters() {
    activeFilters.value = { ...defaultFilters }
    searchQuery.value = ''
    currentPage.value = 1
  }

  const filteredCustomers = computed(() => {
    return customers.value.filter(c => {
      if (activeFilters.value.source && c.source !== activeFilters.value.source) return false
      if (activeFilters.value.status && c.status !== activeFilters.value.status) return false
      if (activeFilters.value.city && c.city !== activeFilters.value.city) return false
      if (activeFilters.value.agent && c.agent !== activeFilters.value.agent) return false
      const q = searchQuery.value.trim().toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.agent.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  })

  const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value))
  const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
  const endIndex = computed(() =>
    Math.min(startIndex.value + pageSize.value, filteredCustomers.value.length)
  )

  const paginatedCustomers = computed(() =>
    filteredCustomers.value.slice(startIndex.value, endIndex.value)
  )
</script>
