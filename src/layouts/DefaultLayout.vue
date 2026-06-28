<script setup>
  import { RouterLink, RouterView, useRouter } from 'vue-router'
  import { useUiStore } from '@/stores/ui.store'
  import { useAuthStore } from '@/stores/auth.store'
  import AppNotifications from '@/components/common/AppNotifications.vue'

  const router = useRouter()
  const uiStore = useUiStore()
  const authStore = useAuthStore()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Calls', path: '/calls', icon: '📞' },
    { name: 'Agents', path: '/agents', icon: '👥' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  function handleLogout() {
    authStore.logout()
    router.push({ name: 'Login' })
  }
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out flex-shrink-0',
        uiStore.isSidebarOpen ? 'w-64' : 'w-16',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0">
        <span class="text-xl">📞</span>
        <span
          v-show="uiStore.isSidebarOpen"
          class="ml-3 text-lg font-semibold text-blue-400 truncate"
        >
          CallCenter
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          active-class="bg-blue-600 text-white"
        >
          <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
          <span v-show="uiStore.isSidebarOpen" class="ml-3 text-sm font-medium truncate">
            {{ item.name }}
          </span>
        </RouterLink>
      </nav>

      <!-- Logout -->
      <div class="border-t border-gray-700 p-3 flex-shrink-0">
        <button
          class="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          @click="handleLogout"
        >
          <span class="text-xl flex-shrink-0">🚪</span>
          <span v-show="uiStore.isSidebarOpen" class="ml-3 text-sm">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="flex items-center h-16 px-6 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <button
          class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg"
          @click="uiStore.toggleSidebar()"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <div class="ml-auto flex items-center gap-3">
          <span class="text-sm text-gray-600 hidden sm:block">
            {{ authStore.user?.name || 'User' }}
          </span>
          <div
            class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
          </div>
        </div>
      </header>

      <!-- Page -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>

    <AppNotifications />
  </div>
</template>
