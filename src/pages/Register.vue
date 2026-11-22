<template>
  <div class="register-page" dir="rtl">
    <div class="register-decoration" aria-hidden="true"></div>
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

      </form>

      <!-- ────────── Step 2: اختيار الدور ────────── -->
      <form v-else-if="currentStep === 2" class="register-role-form" @submit.prevent="nextStep">

        <div class="role-options">
          <label
            v-for="role in roles"
            :key="role.value"
            class="role-option relative flex flex-col items-center border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-blue"
            :class="form.role === role.value ? 'border-blue bg-blue' : 'border-gray-200 bg-white'"
          >
            <input type="radio" v-model="form.role" :value="role.value" class="sr-only" />
            <div
              class="role-icon flex items-center justify-center"
              :class="form.role === role.value ? 'text-white' : 'text-gray-800'"
            >
              <component :is="role.icon" :size="22" />
            </div>
            <span
              class="role-title text-center"
              :class="form.role === role.value ? 'text-white' : 'text-gray-400'"
            >{{ role.label }}</span>
            <span
              class="role-subtitle flex items-center justify-between"
              :class="form.role === role.value ? 'text-white' : 'text-gray-400'"
            >
              {{ role.sub }}
              <ArrowLeft :size="14" />
            </span>
          </label>
        </div>

        <div class="role-notice flex items-center gap-2 text-xs text-gray-400">
          <Info :size="20" class="shrink-0" />
          <span>أدوار المشرف والمدير يتم تعيينها من قبل إدارة النظام</span>
        </div>

        <div class="role-actions">
          <Button type="submit" size="full" class="flex items-center justify-center gap-2">
            <span>التالي</span>
            <ArrowLeft :size="16" />
          </Button>
          <Button type="button" variant="outline" size="full" :disabled="isSubmitting" class="flex items-center justify-center gap-2" @click="prevStep">
            <ArrowRight :size="16" />
            <span>السابق</span>
          </Button>
        </div>
      </form>

      <!-- ────────── Step 3: مراجعة البيانات ────────── -->
      <div v-else class="register-review">

        <div class="review-details">
          <div class="review-row">
            <User :size="24" aria-hidden="true" />
            <p><span>الاسم | </span><bdi dir="auto">{{ form.fullName }}</bdi></p>
          </div>

          <div class="review-row">
            <Mail :size="24" aria-hidden="true" />
            <p><span>البريد الإلكتروني | </span><bdi dir="ltr">{{ form.email }}</bdi></p>
          </div>

          <div class="review-row">
            <ClipboardList :size="24" aria-hidden="true" />
            <p><span>الدور | </span>{{ roleLabel[form.role] }}</p>
          </div>
        </div>

        <div class="review-actions">
          <Button
            size="full"
            class="flex items-center justify-center gap-2"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب الآن' }}
          </Button>
          <Button type="button" variant="outline" size="full" class="flex items-center justify-center gap-2" @click="prevStep">
            <ArrowRight :size="16" />
            <span>السابق</span>
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
  ArrowLeft, ArrowRight,
  PhoneCall, ClipboardList, Info,
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
const headings = ['أدخل بياناتك للبدء', 'أدخل بياناتك للبدء', 'أدخل بياناتك للبدء']

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
  { value: 'data_entry', label: 'موظف إدخال بيانات', sub: 'قائمة العملاء', icon: User, apiRole: 'data_entry' },
  { value: 'call_center', label: 'موظف الكول سنتر', sub: 'قائمة الاتصالات', icon: PhoneCall, apiRole: 'call_center' },
  { value: 'admin', label: 'المشرف / الأدمن', sub: 'لوحة التحكم', icon: PhoneCall, apiRole: 'admin' },
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
.register-page { min-height: 100vh; position: relative; isolation: isolate; overflow: hidden; background: #f0f5f9; padding: 40px 20px; display: flex; align-items: center; justify-content: center; }
.register-decoration { position: absolute; z-index: -1; inset: 0 0 0 auto; width: 26%; background: #e3f1fb; overflow: hidden; }
.register-decoration::before, .register-decoration::after { content: ''; position: absolute; width: 280px; height: 280px; background: #dceefa; border-radius: 50%; }
.register-decoration::before { top: -110px; right: -150px; }
.register-decoration::after { bottom: -90px; right: -120px; width: 480px; height: 480px; }
.register-card { width: 100%; max-width: 700px; padding: 44px 60px 60px; border: 0; border-radius: 24px; background: #fcfcfc; box-shadow: none; }
.register-steps { max-width: 430px; margin: 52px 0 50px; }
.register-steps > div > div { width: 48px; height: 48px; font-size: 20px; font-weight: 400; }
.register-steps > div > div.bg-white { background: transparent; color: #121212; border-color: #dedede; }
.register-steps > div > div.bg-blue { background: #4098f4; border-color: #b7d9fb; }
.register-steps > .flex-1 { margin-inline: 0; margin-bottom: 27px; }
.role-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; direction: rtl; }
.role-option { min-width: 0; min-height: 148px; padding: 26px 12px 22px; border-radius: 10px; border-color: #d4d4d4; background: transparent; }
.role-option.bg-blue { background: #4098f4; border-color: #b7d9fb; }
.role-icon { margin-bottom: 22px; }
.role-title { font-size: 13px; font-weight: 400; line-height: 1.5; overflow-wrap: anywhere; }
.role-subtitle { width: 100%; margin-top: 8px; font-size: 11px; }
.role-notice { min-height: 56px; margin-top: 24px; padding: 14px 20px; border-radius: 10px; background: #f6f6f6; }
.role-actions { display: grid; gap: 8px; margin-top: 48px; }
.role-actions :deep(button) { min-height: 52px; border-radius: 10px; box-shadow: none; font-size: 14px; }
.role-actions :deep(button[type='submit']) { background: #4098f4; }
.role-actions :deep(button[type='button']) { background: transparent; border: 1px solid #d4d4d4; color: #4098f4; }
.register-card { text-align: start; }
.register-review { padding-top: 20px; }
.review-details { padding: 12px 24px; background: #fafafa; border-radius: 12px; }
.review-row { display: flex; align-items: center; justify-content: flex-start; gap: 10px; min-height: 56px; color: #a3a3a3; font-size: 14px; font-weight: 400; }
.review-row + .review-row { border-top: 1px solid #e5e5e5; }
.review-row > svg { flex-shrink: 0; stroke-width: 1.5; }
.review-row > p { min-width: 0; overflow-wrap: anywhere; margin: 0; }
.review-row bdi { unicode-bidi: isolate; }
.review-actions { display: grid; gap: 8px; margin-top: 68px; }
.review-actions :deep(button) { width: 100%; min-height: 50px; border-radius: 10px; font-size: 14px; box-shadow: none; }
.review-actions :deep(button:first-child) { background: #4098f4; color: white; }
.review-actions :deep(button:last-child) { background: transparent; border: 1px solid #b7d9fb; color: #4098f4; }
.register-steps > div:first-child, .register-steps > div:last-child { min-width: 50px; }
.register-form :deep(input) { height: 54px; border-radius: 10px; border-color: #d6d6d6; background: transparent; }
.register-form :deep(label) { font-size: 14px; font-weight: 600; }
.register-form :deep(button[type='submit']) { height: 52px; border-radius: 10px; margin-top: 26px; box-shadow: none; }
.register-form :deep(svg) { width: 21px; height: 21px; stroke-width: 1.5; }
@media (max-width: 600px) {
  .role-options { gap: 8px; }
  .role-option { min-height: 138px; padding: 22px 6px 18px; }
  .role-title { font-size: 11px; }
  .role-subtitle { font-size: 10px; gap: 4px; }
  .register-page { padding: 16px; align-items: flex-start; }
  .register-card { min-height: auto; padding: 32px 22px; border-radius: 18px; }
  .register-steps { margin: 36px 0; }
}
</style>
