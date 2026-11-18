<template>
  <div class="register-page" dir="rtl">
    <main class="register-card">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs text-gray-500 mb-1">إنشاء حساب !</p>
        <h1 class="text-2xl font-bold text-gray-900">{{ headings[currentStep - 1] }}</h1>
      </div>

      <!-- Stepper -->
      <div class="register-steps flex items-center justify-between" aria-label="خطوات إنشاء الحساب">
        <template v-for="(step, index) in steps" :key="step.number">
          <div class="flex flex-col items-center gap-3" :aria-current="step.number === currentStep ? 'step' : undefined">
            <div
              :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                step.number <= currentStep
                  ? 'bg-blue border-blue text-white'
                  : 'bg-white border-gray-300 text-gray-400',
              ]"
            >
              {{ step.number }}
            </div>
            <span
              class="text-xs"
              :class="step.number <= currentStep ? 'text-blue' : 'text-gray-400'"
            >{{ step.label }}</span>
          </div>

          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-px mx-2 mb-5"
            :class="step.number < currentStep ? 'bg-blue' : 'bg-gray-200'"
          />
        </template>
      </div>

      <!-- ────────── Step 1: بيانات الحساب ────────── -->
      <p v-if="formError" role="alert" class="mb-4 rounded-lg bg-red-light p-3 text-sm text-red-dark">{{ formError }}</p>
      <form v-if="currentStep === 1" class="register-form space-y-5" @submit.prevent="nextStep">

        <div class="space-y-1.5">
          <Label for="fullName">الاسم بالكامل *</Label>
          <div class="relative">
            <Input id="fullName" v-model="form.fullName" required autocomplete="name" maxlength="120" type="text" placeholder="ادخل اسمك بالكامل" class="ps-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <User :size="16" />
            </span>
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="email">البريد الإلكتروني *</Label>
          <div class="relative">
            <Input id="email" v-model="form.email" required autocomplete="email" type="email" placeholder="ادخل بريدك الإلكتروني" class="ps-10" />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Mail :size="16" />
            </span>
          </div>
        </div>

        <Button type="submit" size="full" class="mt-6 flex items-center justify-center gap-2">
          <span>التالي</span>
          <ArrowLeft :size="16" />
        </Button>

        <p class="text-center text-sm text-blue mt-4">
          إدارة الحسابات
          <button
            type="button"
            class="text-blue font-semibold hover:underline ms-1 cursor-pointer"
            @click="goToEmployees"
          >
            قائمة الموظفين
          </button>
        </p>
      </form>

      <!-- ────────── Step 2: اختيار الدور ────────── -->
      <form v-else-if="currentStep === 2" class="space-y-5" @submit.prevent="nextStep">

        <div class="grid grid-cols-2 gap-3">
          <label
            v-for="role in roles"
            :key="role.value"
            class="relative flex flex-col items-center justify-between gap-2 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue"
            :class="form.role === role.value ? 'border-blue bg-blue' : 'border-gray-200 bg-white'"
          >
            <input type="radio" v-model="form.role" :value="role.value" class="sr-only" />
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="form.role === role.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'"
            >
              <component :is="role.icon" :size="22" />
            </div>
            <span
              class="text-xs font-semibold text-center leading-tight"
              :class="form.role === role.value ? 'text-white' : 'text-gray-800'"
            >{{ role.label }}</span>
            <span
              class="text-xs flex items-center gap-1"
              :class="form.role === role.value ? 'text-white' : 'text-gray-400'"
            >
              <ChevronLeft :size="12" />
              {{ role.sub }}
            </span>
          </label>
        </div>

        <div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
          <Info :size="14" class="mt-0.5 shrink-0" />
          <span>اختر دور الحساب؛ يحدد السيرفر صلاحية إنشاء الحساب بهذا الدور</span>
        </div>

        <div class="space-y-3 pt-1">
          <Button type="submit" size="full" class="flex items-center justify-center gap-2">
            <span>التالي</span>
            <ArrowLeft :size="16" />
          </Button>
          <Button type="button" variant="outline" size="full" :disabled="isSubmitting" class="flex items-center justify-center gap-2" @click="prevStep">
            <span>السابق</span>
            <ArrowRight :size="16" />
          </Button>
        </div>
      </form>

      <!-- ────────── Step 3: مراجعة البيانات ────────── -->
      <div v-else class="space-y-5">

        <div class="border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-gray-400 truncate max-w-50">{{ form.fullName }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium shrink-0 ms-3">
              <span>الاسم</span>
              <User :size="16" class="text-gray-400" />
            </div>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-gray-400 truncate max-w-50">{{ form.email }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium shrink-0 ms-3">
              <span>البريد الإلكتروني</span>
              <Mail :size="16" class="text-gray-400" />
            </div>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <span class="text-sm text-gray-400">{{ roleLabel[form.role] }}</span>
            <div class="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span>الدور</span>
              <ClipboardList :size="16" class="text-gray-400" />
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-1">
          <Button
            size="full"
            class="flex items-center justify-center gap-2"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب الآن' }}
          </Button>
          <Button type="button" variant="outline" size="full" class="flex items-center justify-center gap-2" @click="prevStep">
            <span>السابق</span>
            <ArrowRight :size="16" />
          </Button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, Mail,
  ArrowLeft, ArrowRight, ChevronLeft,
  PhoneCall, ClipboardList, ShieldCheck, Info,
} from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { usersService } from '@/services/users.service'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const notification = useNotification()

const currentStep = ref(1)
const isSubmitting = ref(false)
const formError = ref('')
const headings = ['أدخل بياناتك للبدء', 'أدخل بياناتك للبدء', 'راجع بياناتك لإنشاء الحساب']

const form = ref({
  fullName: '',
  email: '',
  role: '',
})

const steps = [
  { number: 1, label: 'إدخال البيانات' },
  { number: 2, label: 'اختيار الدور' },
  { number: 3, label: 'اختيار الدور' },
]

const roles = [
  { value: 'data_entry', label: 'موظف إدخال بيانات', sub: 'قائمة العملاء', icon: ClipboardList, apiRole: 'data_entry' },
  { value: 'call_center', label: 'موظف الكول سنتر', sub: 'قائمة الاتصالات', icon: PhoneCall, apiRole: 'call_center' },
  { value: 'admin', label: 'مدير', sub: 'إدارة النظام', icon: ShieldCheck, apiRole: 'admin' },
  { value: 'super_admin', label: 'مدير النظام الرئيسي', sub: 'إدارة النظام', icon: ShieldCheck, apiRole: 'super_admin' },
]
const roleLabel = Object.fromEntries(roles.map(role => [role.value, role.label]))

function nextStep() {
  formError.value = ''
  if (currentStep.value === 1 && !validateDetails()) return
  if (currentStep.value === 2 && !form.value.role) {
    formError.value = 'يرجى اختيار دورك للمتابعة'
    return
  }
  if (currentStep.value < 3) currentStep.value++
}

function validateDetails() {
  form.value.fullName = form.value.fullName.trim()
  form.value.email = form.value.email.trim()
  if (form.value.fullName.length < 2) formError.value = 'يرجى إدخال الاسم بالكامل'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) formError.value = 'يرجى إدخال بريد إلكتروني صحيح'
  return !formError.value
}

function prevStep() {
  if (isSubmitting.value) return
  formError.value = ''
  if (currentStep.value > 1) currentStep.value--
}

function goToEmployees() {
  router.push({ name: 'Reports' })
}

async function handleSubmit() {
  if (isSubmitting.value) return
  formError.value = ''
  if (!validateDetails()) { currentStep.value = 1; return }
  if (!roles.some(role => role.value === form.value.role)) {
    currentStep.value = 2
    formError.value = 'يرجى اختيار دورك للمتابعة'
    return
  }
  const selectedRole = roles.find(role => role.value === form.value.role)
  if (!selectedRole.apiRole) {
    formError.value = 'إنشاء الحساب بهذا الدور غير متاح حاليًا؛ يرجى الرجوع لإدارة النظام'
    return
  }
  isSubmitting.value = true
  try {
    const response = await usersService.create({
      name: form.value.fullName,
      email: form.value.email,
      role: selectedRole.apiRole
    })
    notification.success(response?.message || 'تم إنشاء الحساب بنجاح', {
      duration: 0,
      details: [
        { label: 'البريد الإلكتروني', value: response?.data?.email || form.value.email },
        ...(typeof response?.data?.temporaryPassword === 'string' && response.data.temporaryPassword
          ? [{ label: 'كلمة المرور المؤقتة', value: response.data.temporaryPassword }]
          : [])
      ]
    })
    router.push({ name: 'Reports' })
  } catch (err) {
    formError.value = err?.status === 403 ? 'ليس لديك صلاحية إنشاء حسابات' : err?.message || 'تعذّر إنشاء الحساب، حاول مرة أخرى'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.register-page { min-height: 100vh; position: relative; isolation: isolate; overflow: hidden; background: #f8f9fa; padding: 32px 20px; display: flex; align-items: center; justify-content: center; }
.register-decoration { position: absolute; z-index: -1; inset: 0 0 0 auto; width: 26%; background: #e3f1fb; overflow: hidden; }
.register-decoration::before, .register-decoration::after { content: ''; position: absolute; width: 360px; height: 360px; border: 70px solid #d9ecfa; border-radius: 45%; transform: rotate(30deg); }
.register-decoration::before { top: -110px; right: -150px; }
.register-decoration::after { bottom: -90px; right: -120px; width: 480px; height: 480px; }
.register-card { width: 100%; max-width: 512px; padding: 32px; border: 1px solid #e2e5eb; border-radius: 16px; background: #fff; box-shadow: 0 3px 5px #00000026; }
.register-steps { margin: 32px 0; }
.register-steps > div:first-child, .register-steps > div:last-child { min-width: 50px; }
.register-form :deep(input) { height: 54px; border-radius: 10px; border-color: #d6d6d6; background: transparent; }
.register-form :deep(label) { font-size: 14px; font-weight: 600; }
.register-form :deep(button[type='submit']) { height: 52px; border-radius: 10px; margin-top: 26px; box-shadow: none; }
.register-form :deep(svg) { width: 21px; height: 21px; stroke-width: 1.5; }
@media (max-width: 600px) {
  .register-page { padding: 16px; align-items: flex-start; }
  .register-card { min-height: auto; padding: 32px 22px; border-radius: 18px; }
  .register-steps { margin: 36px 0; }
}
</style>
