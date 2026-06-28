<script setup>
  defineProps({
    variant: {
      type: String,
      default: 'primary',
      validator: v => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
    },
    size: {
      type: String,
      default: 'md',
      validator: v => ['sm', 'md', 'lg'].includes(v),
    },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
  })
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2',
      size === 'sm' && 'px-3 py-1.5 text-xs',
      size === 'md' && 'px-4 py-2.5 text-sm',
      size === 'lg' && 'px-6 py-3 text-base',
      variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      variant === 'secondary' &&
        'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      variant === 'ghost' && 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>
