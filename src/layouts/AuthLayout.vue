<script setup>
  import { RouterView } from 'vue-router'
  import AppNotifications from '@/components/common/AppNotifications.vue'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">📞</div>
        <h1 class="text-3xl font-bold text-gray-900">CallCenter</h1>
        <p class="text-gray-500 mt-1 text-sm">Manage your call center operations</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <RouterView />
      </div>
    </div>

    <AppNotifications />
  </div>
</template>
