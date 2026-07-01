<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  for: { type: String, default: '' },
  class: { type: String, default: '' },
})
</script>

<template>
  <label
    :for="props.for"
    :class="cn('text-sm font-medium leading-none text-gray-700', props.class)"
  >
    <slot />
  </label>
</template>
