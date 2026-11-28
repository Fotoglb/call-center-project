<template>
  <div class="customer-editor space-y-5" dir="rtl">
    <!-- Page Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 class="text-xl font-bold text-gray-900">
          {{ isEditMode ? 'تعديل بيانات العميل' : 'إضافة عميل محتمل جديد' }}
        </h1>
        <p class="text-xs text-gray-400 mt-0.5">{{ isEditMode ? 'تعديل عميل حالي' : 'إضافة جديدة' }}</p>
      </div>
      <button
        v-if="authStore.can('customers.list')"
        class="flex items-center gap-2 text-xs text-white bg-blue rounded-lg px-6 py-2.5 hover:bg-blue-dark cursor-pointer transition-colors"
        @click="router.push({ name: 'Customers' })"
      >
        العودة إلى العملاء
        <ArrowLeft :size="14" />
      </button>
    </div>

    <!-- Main Content -->
    <div class="customer-columns grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form — col-span-2 -->
      <div class="col-span-2 space-y-5">
        <div class="customer-form-card bg-white rounded-2xl p-6">
          <h2 class="text-sm font-semibold text-gray-900">معلومات العميل</h2>
          <p class="text-xs text-gray-500 mt-1 mb-6">جميع الحقول التي تحمل علامة <span class="text-red-500">*</span> مطلوبة.</p>

          <div class="customer-fields space-y-4">
            <!-- Row 1: Full Name + Email -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  الاسم بالكامل <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="أدخل اسمك بالكامل"
                    class="w-full h-10 ps-4 pe-9 bg-white border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                    :class="errors.name ? 'border-red-300' : 'border-gray-200'"
                  />
                  <User
                    :size="14"
                    class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">البريد الإلكتروني</label>
                <div class="relative">
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    class="w-full h-10 ps-4 pe-9 bg-white border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                    :class="errors.email ? 'border-red-300' : 'border-gray-200'"
                  />
                  <Mail
                    :size="14"
                    class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
              </div>
            </div>

            <!-- Row 2: Mobile + Source -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  رقم الجوال <span class="text-red-500">*</span>
                </label>
                <div class="phone-field flex flex-row-reverse">
                  <div class="relative shrink-0">
                    <select
                      v-model="form.countryCode"
                      class="appearance-none h-10 ps-3 pe-7 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="+966">+966</option>
                      <option value="+971">+971</option>
                      <option value="+965">+965</option>
                      <option value="+973">+973</option>
                    </select>
                    <ChevronDown
                      :size="12"
                      class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  <div class="relative flex-1">
                    <input
                      v-model="form.phone"
                      type="tel"
                      dir="rtl"
                      placeholder="أدخل رقم الجوال"
                      class="w-full h-10 ps-9 pe-4 text-right bg-white border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                      :class="errors.phone ? 'border-red-300' : 'border-gray-200'"
                    />
                    <Phone
                      :size="14"
                      class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
                <p v-if="errors.phone" class="text-xs text-red-500">{{ errors.phone }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  المصدر <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.source"
                    data-source-select
                    class="w-full appearance-none h-10 ps-4 pe-9 bg-white border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer transition-colors"
                    :class="errors.source ? 'border-red-300' : 'border-gray-200'"
                  >
                    <option value="">اختر المصدر</option>
                    <option v-for="src in sourceOptions" :key="src.value" :value="src.value">{{ src.label }}</option>
                  </select>
                  <Mail :size="20" class="absolute inset-s-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <ChevronDown
                    :size="12"
                    class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <p v-if="errors.source" class="text-xs text-red-500">{{ errors.source }}</p>
              </div>
            <div class="space-y-1.5">
                <label for="priority" class="text-xs font-medium text-gray-700">حالة العميل</label>
                <div class="relative">
                  <select id="priority" v-model="form.priority" class="w-full appearance-none h-10 ps-4 pe-9 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer">
                    <option value="">اختر الأولوية</option>
                    <option value="high">عالي الأهمية</option>
                    <option value="medium">متوسط الأهمية</option>
                    <option value="low">منخفض الأهمية</option>
                  </select>
                  <ChevronDown :size="12" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Row 3: Project Type + Creation Date -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">نوع مشروع العميل <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select
                    v-model="form.projectType"
                    class="w-full appearance-none h-10 ps-4 pe-9 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer transition-colors"
                  >
                    <option value="">اختر نوع المشروع</option>
                    <option v-for="t in projectTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                  <ChevronDown
                    :size="12"
                    class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                <p v-if="errors.projectType" class="text-xs text-red-500">{{ errors.projectType }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">تاريخ الإنشاء</label>
                <div class="relative">
                  <input
                    v-model="form.createdAt"
                    type="date"
                    class="w-full h-10 ps-4 pe-9 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                  />
                </div>
                <p v-if="errors.createdAt" class="text-xs text-red-500">{{ errors.createdAt }}</p>
              </div>
            </div>

            <!-- Row 4: Mandatory Requirements + City -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  المدينة
                  <span>(اختياري)</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.city"
                    type="text"
                    placeholder="اكتب اسم المدينة"
                    class="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">متطلبات العميل (اختياري)</label>
                <textarea
                  v-model="form.requirements"
                  rows="1"
                  placeholder="أدخل متطلبات العميل"
                  class="w-full ps-4 pe-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label for="businessType" class="text-xs font-medium text-gray-700">نوع النشاط</label>
                <input id="businessType" v-model="form.businessType" type="text" class="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" />
              </div>
              
              <div class="space-y-1.5">
                <label for="budget" class="text-xs font-medium text-gray-700">الميزانية</label>
                <input id="budget" v-model="form.budget" type="number" min="0" step="any" class="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" />
                <p v-if="errors.budget" class="text-xs text-red-500">{{ errors.budget }}</p>
              </div>
              <div v-if="authStore.can('employees.manage')" class="space-y-1.5">
                <label for="assignedTo" class="text-xs font-medium text-gray-700">الموظف المسؤول</label>
                <div class="relative">
                  <select id="assignedTo" v-model="form.assignedTo" :aria-busy="employeesLoading" class="w-full appearance-none h-10 ps-4 pe-9 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer">
                    <option value="">اختر الموظف</option>
                    <option v-if="employeesLoading" disabled>جارٍ تحميل الموظفين...</option>
                    <option v-for="employee in employees" :key="employee.id" :value="employee.id">{{ employee.name }}</option>
                  </select>
                  <ChevronDown :size="12" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p v-if="employeesError" class="text-xs text-red-500">{{ employeesError }} <button type="button" class="underline" @click="loadEmployees">إعادة المحاولة</button></p>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700">ملاحظات</label>
              <textarea
                v-model="form.notes"
                rows="5"
                placeholder="أدخل ملاحظات العميل"
                class="w-full ps-4 pe-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors resize-none"
              ></textarea>
            </div>
          </div>
          <div class="flex flex-wrap justify-end gap-3 mt-6">
            <button v-if="!isEditMode" type="button" class="rounded-lg bg-blue-light text-blue text-xs px-6 py-3 disabled:opacity-50" :disabled="isSubmitting || isLoadingCustomer || !!customerLoadError" @click="handleSubmit(true)">الحفظ كمسودة</button>
            <button type="button" class="rounded-lg bg-blue text-white text-xs px-6 py-3 hover:bg-blue-dark disabled:opacity-50" :disabled="isSubmitting || isLoadingCustomer || !!customerLoadError" @click="handleSubmit(false)">{{ isSubmitting ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إنشاء ملف عميل' }}</button>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Duplicate Detection -->
        <div class="customer-side-card bg-white rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">الكشف عن النسخ المكررة</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            تتم مطابقة أرقام الهواتف مباشرة مع السجل. ستظهر بيانات العملاء المحتملين المطابقة هنا فورًا لتجنب إنشاء بيانات مكررة.
          </p>

          <div v-if="duplicates.length > 0" class="mt-4 space-y-2">
            <div
              v-for="d in duplicates"
              :key="d.id"
              class="flex items-center gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <div
                class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0"
              >
                {{ (d.fullName || d.name || '').charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-800 truncate">{{ d.fullName || d.name }}</p>
                <p class="text-xs text-gray-400">{{ d.phone }}</p>
              </div>
              <span class="text-xs text-amber-600 font-medium shrink-0">مطابق</span>
            </div>
          </div>


        </div>

        <!-- Important Rules -->
        <div class="customer-side-card bg-white rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">القواعد المهمة</h3>
          <ul class="space-y-3">
            <li v-for="(rule, i) in importantRules" :key="i" class="flex items-start gap-2">
              <span
                class="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0 mt-0.5"
              >
                ·
              </span>
              <p class="text-xs text-gray-500 leading-relaxed">{{ rule }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    ArrowRight,
    ArrowLeft,
    User,
    Mail,
    Phone,
    ChevronDown,
    CheckCircle
  } from '@lucide/vue'
  import { customersService } from '@/services/customers.service'
  import { useEmployees } from '@/composables/useEmployees'
  import { useAuthStore } from '@/stores/auth.store'
  import { useNotification } from '@/composables/useNotification'

  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const notification = useNotification()
  const { employees, loading: employeesLoading, error: employeesError, loadEmployees, limit: employeeLimit } = useEmployees()
  employeeLimit.value = 100

  const isEditMode = !!route.query.editId

  const currentAgentName = computed(() => authStore.user?.name || '—')
  const currentAgentInitials = computed(() => (authStore.user?.name || '؟').slice(0, 2))

  const form = ref({
    name: '',
    email: '',
    countryCode: '+966',
    phone: '',
    source: '',
    projectType: '',
    businessType: '',
    priority: '',
    budget: '',
    assignedTo: '',
    createdAt: new Date().toISOString().split('T')[0],
    isDraft: null,
    requirements: '',
    city: '',
    notes: ''
  })

  const errors = ref({})
  const isSubmitting = ref(false)
  const isLoadingCustomer = ref(isEditMode)
  const customerLoadError = ref('')
  const originalPhone = ref('')
  const duplicates = ref([])

  const sourceOptions = ref([])
  const projectTypes = ['B2B', 'B2C', 'SME', 'Enterprise', 'Startup', 'E-commerce', 'Retail', 'Manufacturing', 'Service', 'Non-profit', 'Education']

  onMounted(async () => {
    if (!isEditMode) return
    // Strip legacy links containing customer details; only the identifier is used.
    if (Object.keys(route.query).some(key => key !== 'editId')) {
      await router.replace({ name: 'AddCustomer', query: { editId: route.query.editId } })
    }
    try {
      const response = await customersService.getById(route.query.editId)
      const lead = response?.data ?? response
      if (!lead || typeof lead !== 'object' || Array.isArray(lead) || typeof lead.fullName !== 'string') {
        throw new Error('تعذّر قراءة بيانات العميل من استجابة السيرفر')
      }
      Object.assign(form.value, {
        name: lead.fullName,
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        source: typeof lead.sourceId === 'object' ? lead.sourceId?.id ?? lead.sourceId?._id ?? '' : lead.sourceId ?? '',
        projectType: lead.projectType ?? '',
        businessType: lead.businessType ?? '',
        priority: lead.priority ?? '',
        budget: lead.budget ?? '',
        assignedTo: typeof lead.assignedTo === 'object' ? lead.assignedTo?.id ?? lead.assignedTo?._id ?? '' : lead.assignedTo ?? '',
        createdAt: lead.createdAt ? String(lead.createdAt).slice(0, 10) : '',
        isDraft: typeof lead.isDraft === 'boolean' ? lead.isDraft : null,
        requirements: lead.requirements ?? '',
        city: lead.city ?? '',
        notes: lead.notes ?? '',
      })
      originalPhone.value = internationalPhone(form.value.phone, form.value.countryCode)
    } catch (error) {
      customerLoadError.value = error.message || 'تعذّر تحميل بيانات العميل'
      notification.error(customerLoadError.value)
    } finally {
      isLoadingCustomer.value = false
    }
  })

  onMounted(async () => {
    try {
      const meta = await customersService.getMeta()
      sourceOptions.value = meta.sources
      const selectedSource = meta.sources.find(source => source.value === form.value.source || source.label === form.value.source)
      if (selectedSource) form.value.source = selectedSource.value
    } catch (error) {
      notification.error(error.message || 'تعذّر تحميل مصادر العملاء')
    }
  })

  const importantRules = [
    'الاسم الكامل 3 أحرف كحد أدنى.',
    'الهاتف بتنسيق E.164 الدولي.',
    'يجب أن يكون البريد الإلكتروني صالحًا (اختياري).',
    'المصدر والنوع مطلوبان.'
  ]

  let duplicateCheckDebounce = null
  let duplicateCheckVersion = 0
  function internationalPhone(value, countryCode) {
    const digits = value.trim().replace(/[\s()-]/g, '')
    return digits.startsWith('+') ? digits : `${countryCode}${digits.replace(/^0+/, '')}`
  }
  watch(
    () => [form.value.phone, form.value.countryCode],
    ([val, countryCode]) => {
      const version = ++duplicateCheckVersion
      clearTimeout(duplicateCheckDebounce)
      duplicates.value = []
      const digits = val.trim().replace(/[\s()-]/g, '')
      const phone = internationalPhone(val, countryCode)
      if (!digits || !/^\+[1-9]\d{1,14}$/.test(phone)) return
      if (isEditMode && phone === originalPhone.value) return
      duplicateCheckDebounce = setTimeout(async () => {
        try {
          const result = await customersService.checkDuplicates(phone)
          if (version === duplicateCheckVersion) duplicates.value = Array.isArray(result) ? result : []
        } catch {
          if (version === duplicateCheckVersion) duplicates.value = []
        }
      }, 300)
    }
  )

  function validate() {
    const e = {}
    if (!form.value.name.trim()) e.name = 'الاسم مطلوب'
    else if (form.value.name.trim().length < 3) e.name = 'الاسم يجب أن يكون 3 أحرف على الأقل'
    if (!form.value.phone.trim()) e.phone = 'رقم الجوال مطلوب'
    else if (!/^\+[1-9]\d{1,14}$/.test(internationalPhone(form.value.phone, form.value.countryCode))) e.phone = 'أدخل رقم جوال دوليًا صحيحًا'
    if (!form.value.source) e.source = 'المصدر مطلوب'
    if (!projectTypes.includes(form.value.projectType)) e.projectType = 'اختر نوع مشروع العميل'
    if (form.value.createdAt) {
      const date = new Date(`${form.value.createdAt}T00:00:00.000Z`)
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.value.createdAt) e.createdAt = 'أدخل تاريخًا صحيحًا'
    }
    if (form.value.budget !== '' && (!Number.isFinite(Number(form.value.budget)) || Number(form.value.budget) < 0)) e.budget = 'أدخل ميزانية صحيحة لا تقل عن صفر'
    if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      e.email = 'بريد إلكتروني غير صالح'
    }
    errors.value = e
    return Object.keys(e).length === 0
  }

  async function handleSubmit(saveAsDraft = false) {
    if (isSubmitting.value || isLoadingCustomer.value || customerLoadError.value || !validate()) return
    isSubmitting.value = true
    clearTimeout(duplicateCheckDebounce)
    ++duplicateCheckVersion
    try {
      const payload = {
        fullName: form.value.name.trim(),
        phone: internationalPhone(form.value.phone, form.value.countryCode),
        email: form.value.email.trim(),
        sourceId: form.value.source,
        projectType: form.value.projectType,
        ...(form.value.createdAt ? { createdAt: new Date(`${form.value.createdAt}T00:00:00.000Z`).toISOString() } : {}),
        city: form.value.city,
        requirements: form.value.requirements,
        notes: form.value.notes,
        ...(form.value.businessType.trim() ? { businessType: form.value.businessType.trim() } : {}),
        ...(form.value.priority.trim() ? { priority: form.value.priority.trim() } : {}),
        ...(form.value.budget !== '' ? { budget: Number(form.value.budget) } : {}),
        ...(form.value.assignedTo ? { assignedTo: form.value.assignedTo } : {}),
        ...(!isEditMode ? { isDraft: saveAsDraft === true } : typeof form.value.isDraft === 'boolean' ? { isDraft: form.value.isDraft } : {}),
      }
      const matches = isEditMode && payload.phone === originalPhone.value
        ? []
        : await customersService.checkDuplicates(payload.phone)
      if (!Array.isArray(matches)) {
        errors.value.phone = 'تعذّر تأكيد نتيجة فحص التكرار؛ لم يتم حفظ العميل'
        notification.error(errors.value.phone)
        return
      }
      const otherCustomers = matches.filter(customer => !isEditMode || (customer?.id ?? customer?._id) !== route.query.editId)
      duplicates.value = otherCustomers
      if (otherCustomers.length) {
        errors.value.phone = 'رقم الجوال مسجل لعميل آخر؛ لا يمكن حفظه مرة أخرى'
        notification.error(errors.value.phone)
        return
      }
      if (payload.phone !== internationalPhone(form.value.phone, form.value.countryCode)) {
        errors.value.phone = 'تغير رقم الجوال أثناء الفحص؛ اضغط حفظ للتحقق من الرقم الجديد'
        return
      }
      if (isEditMode) {
        await customersService.update(route.query.editId, payload)
        notification.success('تم حفظ التعديلات بنجاح')
      } else {
        await customersService.create(payload)
        notification.success('تمت إضافة العميل بنجاح')
      }
      router.push(authStore.can('customers.list') ? { name: 'Customers' } : { name: 'Home' })
    } catch (err) {
      notification.error(err?.message || 'تعذر حفظ بيانات العميل')
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<style scoped>
.customer-editor { padding: 4px 0 16px; }
.customer-columns { align-items: start; }
.customer-form-card { padding: 24px; }
.customer-form-card h2 { font-size: 20px; font-weight: 700; }
.customer-fields > * + * { margin-top: 24px; }
.customer-fields > .grid { gap: 22px; }
.customer-form-card label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 14px; }
.customer-form-card input,
.customer-form-card select { height: 56px; border-radius: 11px; font-size: 14px; text-align: right; }
.customer-form-card input { padding-inline: 20px; }
.customer-form-card input[type='text']:has(+ svg),
.customer-form-card input[type='email'],
.customer-form-card input[type='tel'] { padding-inline: 48px 20px; }
.customer-form-card select { padding-inline: 20px 44px; }
.customer-form-card select[data-source-select] { padding-inline-start: 48px; }
.customer-form-card textarea { border-radius: 11px; font-size: 14px; padding: 16px 20px; }
.customer-form-card textarea[rows='1'] { height: 56px; }
.customer-form-card textarea[rows='5'] { min-height: 158px; }
.customer-fields .relative > svg { width: 20px; height: 20px; }
.customer-form-card input[type='date'] { direction: ltr; }
.customer-form-card input[type='date']::-webkit-datetime-edit { text-align: right; padding-right: 10px; }
.customer-form-card input[type='date']::-webkit-calendar-picker-indicator { width: 20px; height: 20px; opacity: .5; cursor: pointer; }
.phone-field { border: 1px solid #e5e7eb; border-radius: 11px; background: white; align-items: center; }
.phone-field input,
.phone-field select { border: 0; background: transparent; }
.phone-field > .shrink-0 { width: 64px; border-inline-start: 1px solid #d1d5db; }
.phone-field > .shrink-0 select { height: 24px; }
.phone-field select { width: 100%; padding: 0 6px; direction: ltr; text-align: center; appearance: none; }
.phone-field > .shrink-0 svg { display: none; }
.phone-field > .flex-1 { min-width: 0; }
.customer-side-card { border-radius: 18px; padding: 24px; }
.customer-side-card p { color: #999; line-height: 1.8; }
.customer-side-card li > span { background: transparent; width: 8px; height: auto; }
@media (min-width: 1024px) {
  .customer-columns { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(260px, 1fr); }
}
@media (max-width: 639px) {
  .customer-form-card, .customer-side-card { padding: 18px; }
}
</style>
