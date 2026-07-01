<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">هل نسيت كلمة المرور</h1>
        <p class="text-sm text-gray-400 leading-relaxed">
          برجاء كتابة بريدك الإلكتروني و سيصلك رسالة با رابط تعديل كلمة السرا
        </p>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleSubmit">

        <!-- Email -->
        <div class="space-y-1.5">
          <Label for="email">البريد الإلكتروني *</Label>
          <div class="relative">
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="ادخل بريدك الإلكتروني"
              class="ps-10"
            />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Mail :size="16" />
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <Button type="submit" size="full" class="mt-2">
          تشغيل
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

const router = useRouter()

const email = ref('')

function handleSubmit() {
  router.push({ name: 'OTP' })
}
</script>
