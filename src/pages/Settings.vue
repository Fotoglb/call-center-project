<template>
  <main class="max-w-xl mx-auto space-y-6" dir="rtl">
    <h1 class="text-xl font-bold">الإعدادات</h1>
    <form class="rounded-2xl bg-white border border-gray-200 p-6 space-y-5" :aria-busy="isSubmitting" @submit.prevent="submit">
      <h2 class="text-lg font-semibold">تغيير كلمة المرور</h2>
      <p v-if="error" role="alert" class="text-sm text-red-dark">{{ error }}</p>
      <p v-if="success" role="status" class="text-sm text-green-dark">تم تغيير كلمة المرور بنجاح</p>
      <div v-for="field in fields" :key="field.key" class="space-y-2">
        <Label :for="field.key">{{ field.label }} *</Label>
        <div class="relative">
          <Input :id="field.key" v-model="form[field.key]" :type="visible[field.key] ? 'text' : 'password'" :autocomplete="field.autocomplete" required :disabled="isSubmitting" class="pe-12" />
          <button type="button" class="absolute inset-y-0 end-3 text-gray-500" :aria-label="`${visible[field.key] ? 'إخفاء' : 'إظهار'} ${field.label}`" :aria-pressed="visible[field.key]" @click="visible[field.key] = !visible[field.key]">
            <EyeOff v-if="visible[field.key]" :size="18" /><Eye v-else :size="18" />
          </button>
        </div>
      </div>
      <Button type="submit" size="full" :disabled="isSubmitting">{{ isSubmitting ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور' }}</Button>
    </form>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
const auth = useAuthStore()
const router = useRouter()
const notification = useNotification()
const fields = [
  { key: 'currentPassword', label: 'كلمة المرور الحالية', autocomplete: 'current-password' },
  { key: 'password', label: 'كلمة المرور الجديدة', autocomplete: 'new-password' },
  { key: 'confirmPassword', label: 'تأكيد كلمة المرور الجديدة', autocomplete: 'new-password' },
]
const form = reactive({ currentPassword: '', password: '', confirmPassword: '' })
const visible = reactive({ currentPassword: false, password: false, confirmPassword: false })
const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)
async function submit() {
  if (isSubmitting.value) return
  error.value = ''
  success.value = false
  if (!form.currentPassword || !form.password || !form.confirmPassword) {
    error.value = 'يرجى إكمال جميع الحقول'
    return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'كلمتا المرور الجديدتان غير متطابقتين'
    return
  }
  isSubmitting.value = true
  try {
    await authService.changePassword({ ...form })
    if (auth.user?.mustChangePassword === true) {
      auth.clearSession()
      notification.success('تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.')
      await router.replace({ name: 'Login' })
    }
    success.value = true
    for (const field of fields) {
      form[field.key] = ''
      visible[field.key] = false
    }
  } catch (err) {
    error.value = err.message || 'تعذّر تغيير كلمة المرور'
  } finally {
    isSubmitting.value = false
  }
}
</script>
