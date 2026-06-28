<script setup>
  defineProps({
    modelValue: { type: String, default: '' },
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    error: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    autocomplete: { type: String, default: 'off' },
  })

  defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :class="[
        'w-full px-3 py-2.5 rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
        error
          ? 'border-red-400 focus:ring-red-400 bg-red-50'
          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white',
        disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
