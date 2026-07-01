<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs text-gray-400 mb-1">إنشاء حساب</p>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">هل نسيت كلمة المرور</h1>
        <p class="text-sm text-gray-400 leading-relaxed">
          برجاء كتابة بريدك الإلكتروني و سيصلك رسالة با رابط تعديل كلمة السرا
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">

        <!-- Password -->
        <div class="space-y-1.5">
          <Label for="password">كلمة المرور *</Label>
          <div class="relative">
            <Input
              id="password"
              v-model="form.password"
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
            >
              <EyeOff v-if="showConfirm" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <!-- Submit -->
        <Button type="submit" size="full" class="mt-2">
          تفعيل
        </Button>

        <!-- Resend -->
        <p class="text-center text-sm text-gray-400">
          <button type="button" class="hover:text-gray-700 hover:underline cursor-pointer">
            أعادة إرسال الكود
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
import { Lock, Eye, EyeOff } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()

const showPassword = ref(false)
const showConfirm = ref(false)

const form = ref({
  password: '',
  confirmPassword: '',
})

function handleSubmit() {
  // TODO: connect to auth service
}
</script>
