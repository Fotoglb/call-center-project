<script setup>
  const stats = [
    { label: 'Active Calls', value: '24', change: '+12%', trend: 'up' },
    { label: 'Agents Online', value: '18', change: '+3', trend: 'up' },
    { label: 'Avg Wait Time', value: '2:34', change: '-8%', trend: 'down' },
    { label: 'Resolved Today', value: '142', change: '+24%', trend: 'up' },
  ]
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
        <p
          :class="[
            'mt-1 text-sm font-medium',
            stat.trend === 'up' ? 'text-green-600' : 'text-red-500',
          ]"
        >
          {{ stat.trend === 'up' ? '↑' : '↓' }} {{ stat.change }}
        </p>
      </div>
    </div>

    <!-- Content Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Recent Calls</h2>
        <div class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">📞</div>
          <p class="text-sm">No recent calls to display</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Agent Status</h2>
        <div class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">No agent data available</p>
        </div>
      </div>
    </div>
  </div>
</template>
