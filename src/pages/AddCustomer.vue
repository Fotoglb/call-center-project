<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">إضافة عميل محتمل جديد</h1>
        <p class="text-xs text-gray-400 mt-0.5">إضافة جديدة</p>
      </div>
      <button
        class="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
        @click="router.back()"
      >
        <ArrowRight :size="14" />
        العودة
      </button>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-3 gap-5">
      <!-- Form — col-span-2 -->
      <div class="col-span-2 space-y-5">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-900 mb-5">معلومات العميل</h2>

          <div class="space-y-4">
            <!-- Row 1: Full Name + Email -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  الاسم بالكامل <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="أدخل الاسم الكامل"
                    class="w-full h-10 ps-4 pe-9 bg-gray-50 border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors"
                    :class="errors.name ? 'border-red-300' : 'border-gray-200'"
                  />
                  <User :size="14" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                    class="w-full h-10 ps-4 pe-9 bg-gray-50 border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors"
                    :class="errors.email ? 'border-red-300' : 'border-gray-200'"
                  />
                  <Mail :size="14" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p v-if="errors.email" class="text-xs text-red-500">{{ errors.email }}</p>
              </div>
            </div>

            <!-- Row 2: Mobile + Source -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  الجوال <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <div class="relative shrink-0">
                    <select
                      v-model="form.countryCode"
                      class="appearance-none h-10 ps-3 pe-7 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="+966">+966</option>
                      <option value="+971">+971</option>
                      <option value="+965">+965</option>
                      <option value="+973">+973</option>
                    </select>
                    <ChevronDown :size="12" class="absolute inset-e-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <div class="relative flex-1">
                    <input
                      v-model="form.phone"
                      type="tel"
                      placeholder="أدخل رقم الجوال"
                      class="w-full h-10 ps-4 pe-9 bg-gray-50 border rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors"
                      :class="errors.phone ? 'border-red-300' : 'border-gray-200'"
                    />
                    <Phone :size="14" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                    class="w-full appearance-none h-10 ps-4 pe-9 bg-gray-50 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer transition-colors"
                    :class="errors.source ? 'border-red-300' : 'border-gray-200'"
                  >
                    <option value="">اختر المصدر</option>
                    <option v-for="src in sourceOptions" :key="src" :value="src">{{ src }}</option>
                  </select>
                  <ChevronDown :size="12" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p v-if="errors.source" class="text-xs text-red-500">{{ errors.source }}</p>
              </div>
            </div>

            <!-- Row 3: Project Type + Creation Date -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">نوع مشروع العميل</label>
                <div class="relative">
                  <select
                    v-model="form.projectType"
                    class="w-full appearance-none h-10 ps-4 pe-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer transition-colors"
                  >
                    <option value="">اختر نوع المشروع</option>
                    <option v-for="t in projectTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                  <ChevronDown :size="12" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">تاريخ الإنشاء</label>
                <div class="relative">
                  <input
                    v-model="form.createdAt"
                    type="date"
                    class="w-full h-10 ps-4 pe-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors"
                  />
                  <CalendarDays :size="14" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Row 4: Mandatory Requirements + City -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">متطلبات العميل الإلزامية</label>
                <textarea
                  v-model="form.requirements"
                  rows="3"
                  placeholder="موجز الشراء المتوقع تقارب مقارنة سابقة"
                  class="w-full ps-4 pe-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-medium text-gray-700">
                  المدينة
                  <span class="text-gray-400 font-normal">(الاختياري)</span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.city"
                    class="w-full appearance-none h-10 ps-4 pe-9 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 cursor-pointer transition-colors"
                  >
                    <option value="">اختر المدينة</option>
                    <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
                  </select>
                  <ChevronDown :size="12" class="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700">ملاحظات</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="موجز الشراء المتوقع تقارب مقارنة سابقة"
                class="w-full ps-4 pe-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 focus:bg-white transition-colors resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
              أح
            </div>
            <div class="text-end leading-tight">
              <p class="text-xs font-semibold text-gray-800">أحمد الراشد</p>
              <p class="text-xs text-gray-400">الموظف المسؤول</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="text-xs text-gray-600 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
              @click="router.back()"
            >
              إلغاء / العودة
            </button>
            <button
              class="text-xs text-white bg-gray-900 rounded-xl px-5 py-2.5 hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? 'جارٍ الإضافة...' : 'إضافة هذا العميل' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Duplicate Detection -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">الكشف عن النسخ المكررة</h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            ستظهر أرقام الهاتف من السجل، ستظهر بيانات المتطابقين المحتملين ما يجب أن تتجنب إنشاء نسخ مكررة
          </p>

          <div v-if="duplicates.length > 0" class="mt-4 space-y-2">
            <div
              v-for="d in duplicates"
              :key="d.id"
              class="flex items-center gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                {{ d.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-800 truncate">{{ d.name }}</p>
                <p class="text-xs text-gray-400">{{ d.phone }}</p>
              </div>
              <span class="text-xs text-amber-600 font-medium shrink-0">مطابق</span>
            </div>
          </div>

          <div v-else class="mt-4 flex flex-col items-center justify-center py-6 text-center">
            <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <CheckCircle :size="18" class="text-emerald-500" />
            </div>
            <p class="text-xs text-gray-500">لا توجد نسخ مكررة</p>
          </div>
        </div>

        <!-- Important Rules -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">القواعد المهمة</h3>
          <ul class="space-y-3">
            <li v-for="(rule, i) in importantRules" :key="i" class="flex items-start gap-2">
              <span class="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0 mt-0.5">
                {{ i + 1 }}
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight, User, Mail, Phone, ChevronDown,
  CalendarDays, CheckCircle,
} from '@lucide/vue'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  countryCode: '+966',
  phone: '',
  source: '',
  projectType: '',
  createdAt: new Date().toISOString().split('T')[0],
  requirements: '',
  city: '',
  notes: '',
})

const errors = ref({})
const isSubmitting = ref(false)
const duplicates = ref([])

const sourceOptions = [
  'جوجل أدز', 'وسائل التواصل', 'الاتصال المباشر',
  'إعلانات تويتر', 'التسويق الخارجي', 'مجتمع ميتا', 'تسويق الشبكات',
]

const projectTypes = [
  'B2B', 'B2C', 'Enterprise', 'SME', 'Startup',
  'E-commerce', 'Retail', 'Manufacturing', 'Service', 'Non-profit', 'Education',
]

const cityOptions = ['الرياض', 'جدة', 'الطائف', 'المدينة المنورة', 'أبها', 'الدمام']

const importantRules = [
  'السيناريو الأول: أرقام الهاتف من السجل، ستظهر بيانات المتطابقين المحتملين ما يجب أن تتجنب إنشاء نسخ مكررة.',
  'الحالة الثانية: حسب نسبة إدخال الجوال.',
  'الضرورة أن يكون البريد الإلكتروني (الثانوي) صالحاً.',
]

const mockCustomers = [
  { id: 1, name: 'عبد الله المطيري', phone: '0551234567' },
  { id: 2, name: 'نورا المحمد',      phone: '0569801234' },
  { id: 3, name: 'خالد الزهراني',    phone: '0533456789' },
]

watch(() => form.value.phone, (val) => {
  if (val.length >= 7) {
    duplicates.value = mockCustomers.filter(c => c.phone.includes(val.slice(0, 7)))
  } else {
    duplicates.value = []
  }
})

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = 'الاسم مطلوب'
  if (!form.value.phone.trim()) e.phone = 'رقم الجوال مطلوب'
  if (!form.value.source) e.source = 'المصدر مطلوب'
  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    e.email = 'بريد إلكتروني غير صالح'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 800))
  isSubmitting.value = false
  router.push({ name: 'Customers' })
}
</script>
