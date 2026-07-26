<template>
  <div class="flex h-screen bg-muted overflow-hidden">
    <!-- Sidebar (right in RTL) -->
    <AppSidebar />

    <!-- Main Area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div class="p-4 lg:p-6">
          <RouterView />
        </div>
      </main>
    </div>

    <AppBottomNav />
    <AppNotifications />
  </div>
</template>

<script setup>
  import { RouterView } from 'vue-router'
  import AppSidebar from '@/components/layout/AppSidebar.vue'
  import AppHeader from '@/components/layout/AppHeader.vue'
  import AppBottomNav from '@/components/layout/AppBottomNav.vue'
  import AppNotifications from '@/components/common/AppNotifications.vue'
</script>
