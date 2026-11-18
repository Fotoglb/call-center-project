<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">هل نسيت كلمة المرور</h1>
        <p class="text-sm text-gray-400 leading-relaxed">
          أدخل بريدك الإلكتروني لطلب رمز التحقق واستعادة كلمة المرور.
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-5" :aria-busy="isSubmitting" @submit.prevent="handleSubmit">
        <p v-if="error" role="alert" class="rounded-lg bg-red-light p-3 text-sm text-red-dark">{{ error }}</p>

        <!-- Email -->
        <div class="space-y-1.5">
          <Label for="email">البريد الإلكتروني *</Label>
          <div class="relative">
            <Input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              :disabled="isSubmitting"
              placeholder="ادخل بريدك الإلكتروني"
              class="ps-10"
            />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Mail :size="16" />
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" size="full" class="mt-2" :disabled="isSubmitting">
          {{ isSubmitting ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق' }}
        </Button>
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
import { Mail } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { authService } from '@/services/auth.service'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const notification = useNotification()

const email = ref('')
const isSubmitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (isSubmitting.value) return
  error.value = ''
  const normalizedEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    error.value = 'يرجى إدخال بريد إلكتروني صحيح'
    return
  }
  isSubmitting.value = true
  try {
    const response = await authService.forgotPassword({ email: normalizedEmail })
    notification.success(response?.message || 'تم قبول طلب استعادة كلمة المرور. تحقّق من بريدك الإلكتروني.')
    await router.push({ name: 'OTP', query: { email: normalizedEmail } })
  } catch (err) {
    error.value = err?.message || 'تعذّر إرسال رمز التحقق'
  } finally {
    isSubmitting.value = false
  }
}
</script>
