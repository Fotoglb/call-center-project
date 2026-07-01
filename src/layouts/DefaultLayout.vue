<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar (right in RTL) -->
    <AppSidebar />

    <!-- Main Area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-6">
          <RouterView />
        </div>
      </main>
    </div>

    <AppNotifications />
  </div>
</template>

<script setup>
  import { RouterView } from 'vue-router'
  import AppSidebar from '@/components/layout/AppSidebar.vue'
  import AppHeader from '@/components/layout/AppHeader.vue'
  import AppNotifications from '@/components/common/AppNotifications.vue'
</script>
