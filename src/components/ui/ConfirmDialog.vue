<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="onCancel"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
        <div
          class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"
        >
          <TriangleAlert :size="22" class="text-red-500" />
        </div>
        <h3 class="text-sm font-bold text-gray-900">{{ title }}</h3>
        <p class="text-xs text-gray-500 mt-2 leading-relaxed">{{ message }}</p>

        <div class="flex items-center gap-3 mt-6">
          <button
            class="flex-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="onCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="flex-1 text-xs font-medium text-white bg-red-500 rounded-lg py-2.5 hover:bg-red-600 cursor-pointer transition-colors"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { TriangleAlert } from '@lucide/vue'

  defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: 'تأكيد الحذف' },
    message: { type: String, default: 'هل أنت متأكد من هذا الإجراء؟' },
    confirmText: { type: String, default: 'حذف' },
    cancelText: { type: String, default: 'إلغاء' }
  })

  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

  function onConfirm() {
    emit('update:modelValue', false)
    emit('confirm')
  }

  function onCancel() {
    emit('update:modelValue', false)
    emit('cancel')
  }
</script>
