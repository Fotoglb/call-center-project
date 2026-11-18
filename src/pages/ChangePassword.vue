<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs text-gray-400 mb-1">استعادة الحساب</p>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">إعادة تعيين كلمة المرور</h1>
        <p class="text-sm text-gray-400 leading-relaxed">
          أدخل كلمة المرور الجديدة وأعد كتابتها للتأكيد.
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-5" :aria-busy="isSubmitting" @submit.prevent="handleSubmit">
        <p v-if="error" role="alert" class="rounded-lg bg-red-light p-3 text-sm text-red-dark">{{ error }}</p>

        <!-- Password -->
        <div class="space-y-1.5">
          <Label for="password">كلمة المرور *</Label>
          <div class="relative">
            <Input
              id="password"
              v-model="form.password"
              required
              autocomplete="new-password"
              :disabled="isSubmitting"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••"
              class="px-10"
            />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Lock :size="16" />
            </span>
            <button
              type="button"
              class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
              :aria-pressed="showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-1.5">
          <Label for="confirmPassword">تأكيد كلمة المرور *</Label>
          <div class="relative">
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              required
              autocomplete="new-password"
              :disabled="isSubmitting"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="••••••••••"
              class="px-10"
            />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Lock :size="16" />
            </span>
            <button
              type="button"
              class="absolute inset-y-0 inset-e-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              @click="showConfirm = !showConfirm"
              :aria-label="showConfirm ? 'إخفاء التأكيد' : 'إظهار التأكيد'"
              :aria-pressed="showConfirm"
            >
              <EyeOff v-if="showConfirm" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <!-- Submit -->
        <Button type="submit" size="full" class="mt-2" :disabled="isSubmitting">
          {{ isSubmitting ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة' }}
        </Button>

        <!-- Resend -->
        <p class="text-center text-sm text-gray-400">
          <RouterLink :to="{ name: 'ForgotPassword' }" class="hover:text-gray-700 hover:underline">طلب رمز تحقق جديد</RouterLink>
        </p>
      </form>

      <!-- Login Link -->
      <p class="text-center text-sm text-gray-500 mt-6">
        هل لديك حساب؟
        <button
          type="button"
          class="text-gray-900 font-semibold hover:underline ms-1 cursor-pointer"
          @click="router.push({ name: 'Login' })"
        >
          تسجيل الدخول
        </button>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Eye, EyeOff } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { authService } from '@/services/auth.service'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const notification = useNotification()

const showPassword = ref(false)
const showConfirm = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  password: '',
  confirmPassword: '',
})

async function handleSubmit() {
  if (isSubmitting.value) return
  error.value = ''
  if (!form.value.password || !form.value.confirmPassword) {
    error.value = 'يرجى إدخال كلمة المرور الجديدة وتأكيدها'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'كلمتا المرور غير متطابقتين'
    return
  }
  isSubmitting.value = true
  try {
    await authService.resetPassword({
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
    })
    notification.success('تم تغيير كلمة المرور بنجاح')
    form.value.password = ''
    form.value.confirmPassword = ''
    await router.replace({ name: 'Login' })
  } catch (err) {
    error.value = err?.status === 401
      ? 'تصريح إعادة التعيين مفقود أو غير صالح. يلزم التحقق من الرمز وإعدادات المصادقة.'
      : err?.message || 'تعذّر تغيير كلمة المرور'
  } finally {
    isSubmitting.value = false
  }
}
</script>
