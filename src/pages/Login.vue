<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth.store'
  import { useNotification } from '@/composables/useNotification'
  import AppButton from '@/components/common/AppButton.vue'
  import AppInput from '@/components/common/AppInput.vue'

  const router = useRouter()
  const authStore = useAuthStore()
  const notify = useNotification()

  const email = ref('')
  const password = ref('')
  const isLoading = ref(false)
  const errors = ref({})

  function validate() {
    errors.value = {}
    if (!email.value.trim()) errors.value.email = 'Email is required'
    if (!password.value) errors.value.password = 'Password is required'
    return Object.keys(errors.value).length === 0
  }

  async function handleLogin() {
    if (!validate()) return
    isLoading.value = true
    try {
      await authStore.login({ email: email.value, password: password.value })
      router.push({ name: 'Dashboard' })
    } catch (err) {
      notify.error(err.message || 'Invalid credentials. Please try again.')
    } finally {
      isLoading.value = false
    }
  }
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleLogin">
    <h2 class="text-xl font-bold text-gray-900">Sign in to your account</h2>

    <AppInput
      v-model="email"
      label="Email address"
      type="email"
      placeholder="agent@company.com"
      :error="errors.email"
      autocomplete="email"
    />

    <AppInput
      v-model="password"
      label="Password"
      type="password"
      placeholder="••••••••"
      :error="errors.password"
      autocomplete="current-password"
    />

    <div class="flex items-center justify-between text-sm">
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" class="rounded border-gray-300" />
        <span class="text-gray-600">Remember me</span>
      </label>
      <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
    </div>

    <AppButton type="submit" class="w-full" :loading="isLoading">Sign In</AppButton>
  </form>
</template>
