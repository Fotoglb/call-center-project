<script setup>
  import { onMounted, onUnmounted } from 'vue'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    size: {
      type: String,
      default: 'md',
      validator: v => ['sm', 'md', 'lg', 'xl'].includes(v),
    },
  })

  const emit = defineEmits(['update:modelValue'])

  function close() {
    emit('update:modelValue', false)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close()
  }

  onMounted(() => document.addEventListener('keydown', onKeyDown))
  onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />
        <div
          :class="[
            'relative bg-white rounded-2xl shadow-2xl w-full',
            size === 'sm' && 'max-w-sm',
            size === 'md' && 'max-w-md',
            size === 'lg' && 'max-w-lg',
            size === 'xl' && 'max-w-2xl',
          ]"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <button
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              @click="close"
            >
              ✕
            </button>
          </div>

          <div class="p-6">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-6 pb-6 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
</style>
