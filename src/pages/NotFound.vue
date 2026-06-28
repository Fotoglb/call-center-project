<script setup>
  import { useRouter } from 'vue-router'
  import AppButton from '@/components/common/AppButton.vue'

  const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <div class="text-center max-w-md">
      <p class="text-8xl font-bold text-blue-500">404</p>
      <h1 class="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p class="mt-3 text-gray-500">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <div class="mt-8">
        <AppButton size="lg" @click="router.push('/')">Go to Dashboard</AppButton>
      </div>
    </div>
  </div>
</template>
