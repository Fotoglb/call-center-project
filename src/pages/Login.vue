<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <!-- Header -->
      <div class="mb-8">
        <p class="text-xs text-gray-400 mb-1">مرحباً بعودتك !!</p>
        <h1 class="text-2xl font-bold text-gray-900">سجل دخولك للمتابعة!</h1>
      </div>

      <!-- Form -->
      <form class="space-y-5" @submit.prevent="handleLogin">

        <!-- Email -->
        <div class="space-y-1.5">
          <Label for="email">البريد الإلكتروني *</Label>
          <div class="relative">
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="ادخل بريدك الإلكتروني"
              class="ps-10"
            />
            <span class="absolute inset-y-0 inset-s-3 flex items-center text-gray-400 pointer-events-none">
              <Mail :size="16" />
            </span>
          </div>
        </div>

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

        <!-- Remember me + Forgot password -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer select-none text-gray-600">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-gray-900"
            />
            تذكرني
          </label>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
            @click="router.push({ name: 'ForgotPassword' })"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        <!-- Login Button -->
        <Button type="submit" size="full" class="mt-2">
          تسجيل الدخول
        </Button>
      </form>

      <!-- Register Link -->
      <p class="text-center text-sm text-gray-500 mt-6">
        ليس لديك حساب؟
        <button
          type="button"
          class="text-gray-900 font-semibold hover:underline ms-1 cursor-pointer"
          @click="goToRegister"
        >
          إنشاء حساب
        </button>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'

const router = useRouter()

const showPassword = ref(false)
const rememberMe = ref(false)

const form = ref({
  email: '',
  password: '',
})

function handleLogin() {
  // TODO: connect to auth service
}

function goToRegister() {
  router.push({ name: 'Register' })
}
</script>
