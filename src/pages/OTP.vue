<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">تفعيل كلمة السر / المرور</h1>
        <p class="text-sm text-gray-400">
          ادخل الرقم المرسل إليك عبر البريد الإلكتروني
        </p>
      </div>

      <!-- OTP Inputs -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="flex items-center justify-center gap-3" dir="ltr">
          <input
            v-for="(_, index) in otp"
            :key="index"
            :ref="el => inputs[index] = el"
            v-model="otp[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            @input="onInput(index, $event)"
            @keydown="onKeydown(index, $event)"
            @paste="onPaste"
          />
        </div>

        <!-- Submit -->
        <Button type="submit" size="full">
          تفعيل
        </Button>

        <!-- Resend -->
        <p class="text-center text-sm text-gray-400">
          <button type="button" class="hover:text-gray-700 hover:underline cursor-pointer">
            إعادة إرسال الكود
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

const otp = ref(['', '', '', ''])
const inputs = ref([])

function onInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  otp.value[index] = val.slice(-1)
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
  text.split('').forEach((char, i) => { otp.value[i] = char })
  inputs.value[Math.min(text.length, 3)]?.focus()
  event.preventDefault()
}

function handleSubmit() {
  router.push({ name: 'ChangePassword' })
}
</script>
