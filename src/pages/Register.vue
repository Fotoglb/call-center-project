<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs text-gray-400 mb-1">إنشاء حساب 1</p>
        <h1 class="text-2xl font-bold text-gray-900">أدخل بياناتك للبدء</h1>
      </div>

      <!-- Stepper -->
      <div class="flex items-center justify-between mb-8">
        <template v-for="(step, index) in steps" :key="step.number">
          <div class="flex flex-col items-center gap-1">
            <div
              :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                step.number === currentStep
                  ? 'bg-gray-700 border-gray-700 text-white'
                  : step.number < currentStep
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-400',
              ]"
            >
              {{ step.number }}
            </div>
            <span class="text-xs text-gray-500">{{ step.label }}</span>
          </div>

          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-px mx-2 mb-5"
            :class="step.number < currentStep ? 'bg-gray-900' : 'bg-gray-200'"
          />
        </template>
      </div>

      <!-- ────────── Step 1: بيانات الحساب ────────── -->
      <form v-if="currentStep === 1" class="space-y-5" @submit.prevent="nextStep">

        <div class="space-y-1.5">
          <Label for="fullName">الاسم بالكامل *</Label>
          <div class="relative">
            <Input id="fullName" v-model="form.fullName" type="text" placeholder="ادخل اسمك الكامل" class="ps-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <User :size="16" />
            </span>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="email">البريد الإلكتروني *</Label>
          <div class="relative">
            <Input id="email" v-model="form.email" type="email" placeholder="ادخل بريدك الإلكتروني" class="ps-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Mail :size="16" />
            </span>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="password">كلمة المرور *</Label>
          <div class="relative">
            <Input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••••" class="px-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Lock :size="16" />
            </span>
            <button type="button" class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="confirmPassword">تأكيد كلمة المرور *</Label>
          <div class="relative">
            <Input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••••" class="px-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Lock :size="16" />
            </span>
            <button type="button" class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer" @click="showConfirmPassword = !showConfirmPassword">
              <EyeOff v-if="showConfirmPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <Button type="submit" size="full" class="mt-6 flex items-center justify-center gap-2">
          <ChevronLeft :size="16" />
          <span>التالي</span>
        </Button>

        <p class="text-center text-sm text-gray-500 mt-4">
          هل لديك حساب؟
          <button
            type="button"
            class="text-gray-900 font-semibold hover:underline ms-1 cursor-pointer"
            @click="goToLogin"
          >
            تسجيل الدخول
          </button>
        </p>
      </form>

      <!-- ────────── Step 2: اختيار الدور ────────── -->
      <form v-else-if="currentStep === 2" class="space-y-5" @submit.prevent="nextStep">

        <div class="grid grid-cols-3 gap-3">
          <label
            v-for="role in roles"
            :key="role.value"
            class="relative flex flex-col items-center justify-between gap-2 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-400"
            :class="form.role === role.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
          >
            <input type="radio" v-model="form.role" :value="role.value" class="sr-only" />
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <component :is="role.icon" :size="22" />
            </div>
            <span class="text-xs font-semibold text-gray-800 text-center leading-tight">{{ role.label }}</span>
            <span class="text-xs text-gray-400 flex items-center gap-1">
              <ChevronLeft :size="12" />
              {{ role.sub }}
            </span>
          </label>
        </div>

        <div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
          <Info :size="14" class="mt-0.5 shrink-0" />
          <span>أدوار المشرف والمدير يتم تعيينها من قبل إدارة النظام</span>
        </div>

        <div class="space-y-3 pt-1">
          <Button type="submit" size="full" class="flex items-center justify-center gap-2">
            <ChevronLeft :size="16" />
            <span>التالي</span>
          </Button>
          <Button type="button" variant="outline" size="full" class="flex items-center justify-center gap-2" @click="prevStep">
            <span>السابق</span>
            <ChevronRight :size="16" />
          </Button>
        </div>
      </form>

      <!-- ────────── Step 3: مراجعة البيانات ────────── -->
      <div v-else class="space-y-5">

        <div class="space-y-3">
          <div class="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
            <span class="text-sm text-gray-400">{{ form.fullName }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span>الاسم</span>
              <User :size="16" class="text-gray-400" />
            </div>
          </div>

          <div class="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
            <span class="text-sm text-gray-400 truncate max-w-50">{{ form.email }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium shrink-0 ms-3">
              <span>البريد الإلكتروني</span>
              <Mail :size="16" class="text-gray-400" />
            </div>
          </div>

          <div class="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
            <span class="text-sm text-gray-400">{{ roleLabel[form.role] }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span>الدور</span>
              <Briefcase :size="16" class="text-gray-400" />
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-1">
          <Button size="full" class="flex items-center justify-center gap-2">
            إنشاء الحساب الآن
          </Button>
          <Button type="button" variant="outline" size="full" class="flex items-center justify-center gap-2" @click="prevStep">
            <span>السابق</span>
            <ChevronRight :size="16" />
          </Button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, Mail, Lock, Eye, EyeOff,
  ChevronLeft, ChevronRight,
  PhoneCall, ClipboardList, ShieldCheck, Info, Briefcase,
} from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()

const currentStep = ref(1)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const steps = [
  { number: 1, label: 'إدخال البيانات' },
  { number: 2, label: 'اختيار الدور' },
  { number: 3, label: 'اختيار الدور' },
]

const roles = [
  { value: 'data-entry', label: 'موظف إدخال بيانات', sub: 'قائمة العملاء', icon: ClipboardList },
  { value: 'call-center', label: 'موظف الكول سنتر', sub: 'قائمة الاتصالات', icon: PhoneCall },
  { value: 'supervisor', label: 'المشرف / الأمن', sub: 'لوحة التحكم', icon: ShieldCheck },
]

const roleLabel = {
  'data-entry': 'موظف إدخال بيانات',
  'call-center': 'موظف كول سنتر',
  'supervisor': 'المشرف / الأمن',
}

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function goToLogin() {
  router.push({ name: 'Login' })
}
</script>
