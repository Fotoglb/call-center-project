<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">

      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">التحقق من الرمز</h1>
        <p class="text-sm text-gray-400">
          ادخل الرقم المرسل إليك عبر البريد الإلكتروني
        </p>
      </div>

      <!-- OTP Inputs -->
      <form class="space-y-6" :aria-busy="isSubmitting || isResending" @submit.prevent="handleSubmit">
        <p v-if="error" role="alert" class="text-sm text-red-dark">{{ error }}</p>
        <RouterLink v-if="!validEmail" :to="{ name: 'ForgotPassword' }" class="block text-sm text-blue underline">أدخل بريدك لطلب رمز التحقق</RouterLink>
        <div class="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
          <input
            v-for="(_, index) in otp"
            :key="index"
            :ref="el => inputs[index] = el"
            v-model="otp[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            required
            pattern="[0-9]"
            :aria-label="`الرقم ${index + 1} من رمز التحقق`"
            :disabled="isSubmitting || isResending || !validEmail"
            class="w-11 h-11 sm:w-14 sm:h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            @input="onInput(index, $event)"
            @keydown="onKeydown(index, $event)"
            @paste="onPaste"
          />
        </div>

        <!-- Submit -->
        <Button type="submit" size="full" :disabled="isSubmitting || isResending || !validEmail || !completeCode">
          {{ isSubmitting ? 'جارٍ التحقق...' : 'تحقق من الرمز' }}
        </Button>

        <!-- Resend -->
        <p class="text-center text-sm text-gray-400">
          <button
            type="button"
            class="hover:text-gray-700 hover:underline cursor-pointer disabled:opacity-50"
            :disabled="isResending || isSubmitting || !validEmail"
            @click="handleResend"
          >
            {{ isResending ? 'جارٍ الإرسال...' : 'إعادة إرسال الكود' }}
          </button>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { authService } from '@/services/auth.service'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const route = useRoute()
const notification = useNotification()

const otp = ref(['', '', '', ''])
const inputs = ref([])
const isSubmitting = ref(false)
const isResending = ref(false)
const error = ref('')
const email = computed(() => typeof route.query.email === 'string' ? route.query.email.trim() : '')
const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const completeCode = computed(() => otp.value.every(digit => /^[0-9]$/.test(digit)))

function onInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  otp.value[index] = val.slice(-1)
  event.target.value = otp.value[index]
  if (val && index < 3) {
    inputs.value[index + 1]?.focus()
  }
}

function onKeydown(index, event) {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    inputs.value[index - 1]?.focus()
  }
}

function onPaste(event) {
  const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
  otp.value = ['', '', '', '']
  text.split('').forEach((char, i) => { otp.value[i] = char })
  inputs.value[Math.min(text.length, 3)]?.focus()
  event.preventDefault()
}

async function handleSubmit() {
  if (isSubmitting.value || isResending.value) return
  error.value = ''
  if (!validEmail.value || !completeCode.value) {
    error.value = 'يلزم بريد إلكتروني صحيح ورمز تحقق مكتمل من أربعة أرقام'
    return
  }
  isSubmitting.value = true
  try {
    await authService.verifyOtp({ email: email.value, verificationCode: otp.value.join('') })
    otp.value = ['', '', '', '']
    notification.success('تم التحقق من الرمز بنجاح')
    await router.push({ name: 'ChangePassword', query: { email: email.value } })
  } catch (err) {
    error.value = err?.message || 'الرمز غير صحيح، حاول مرة أخرى'
  } finally {
    isSubmitting.value = false
  }
}

async function handleResend() {
  if (isResending.value || isSubmitting.value || !validEmail.value) return
  error.value = ''
  isResending.value = true
  try {
    await authService.forgotPassword({ email: email.value })
    otp.value = ['', '', '', '']
    notification.success('تم إعادة إرسال الكود')
  } catch (err) {
    error.value = err?.message || 'تعذّر إعادة إرسال الكود'
  } finally {
    isResending.value = false
  }
}
</script>
