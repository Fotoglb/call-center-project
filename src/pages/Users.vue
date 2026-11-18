<template>
  <div class="space-y-5" dir="rtl">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">المستخدمون</h1>
        <p class="text-xs text-gray-400 mt-1">عرض المستخدمين وبيانات الحسابات</p>
      </div>
      <RouterLink v-if="auth.can('employees.register')" :to="{ name: 'Register' }" class="bg-blue text-white rounded-lg px-4 py-2 text-sm">إنشاء حساب</RouterLink>
    </div>

    <form class="bg-white rounded-2xl p-5 flex flex-wrap gap-3 items-end" @submit.prevent="applyFilters">
      <label class="flex-1 min-w-52 text-xs text-gray-600 space-y-2">
        <span class="block">البحث بالاسم أو البريد الإلكتروني</span>
        <input v-model="filters.q" type="search" placeholder="اكتب الاسم أو البريد الإلكتروني" class="w-full border border-gray-200 rounded-lg p-2.5" />
      </label>
      <label class="text-xs text-gray-600 space-y-2">
        <span class="block">عدد المستخدمين في الصفحة</span>
        <select v-model="limit" class="border border-gray-200 rounded-lg p-2.5">
          <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
      <button type="submit" :disabled="loading" class="bg-blue text-white px-5 py-2.5 rounded-lg text-xs disabled:opacity-50">بحث</button>
      <button type="button" :disabled="loading" class="border border-gray-200 px-4 py-2.5 rounded-lg text-xs" @click="resetFilters">مسح البحث</button>
    </form>

    <div class="bg-white rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-start">
          <thead class="border-b border-gray-100 text-gray-500 text-xs">
            <tr><th v-for="label in ['الاسم', 'البريد الإلكتروني', 'كلمة المرور', 'حذف']" :key="label" class="p-4 text-start font-medium">{{ label }}</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading"><td colspan="4" class="p-10 text-center text-gray-400">جارٍ تحميل المستخدمين...</td></tr>
            <tr v-else-if="error"><td colspan="4" class="p-8 text-center"><p role="alert" class="text-red-500">{{ error }}</p><button class="text-blue mt-3" @click="loadEmployees">إعادة المحاولة</button></td></tr>
            <tr v-else-if="!employees.length"><td colspan="4" class="p-10 text-center text-gray-400">لا توجد بيانات</td></tr>
            <template v-else v-for="(user, index) in employees" :key="user.id ?? user._id ?? index">
              <tr class="hover:bg-gray-50">
                <td class="p-4 font-medium">{{ user.name || '—' }}</td>
                <td class="p-4 text-gray-500"><bdi>{{ user.email || '—' }}</bdi></td>
                <td class="p-4 text-gray-400 text-xs">غير متاحة</td>
                <td class="p-4"><button type="button" disabled title="الحذف غير متاح حاليًا" class="text-red-500 text-xs opacity-50 disabled:cursor-not-allowed">حذف</button></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <span>الصفحة {{ page }} · {{ employees.length }} مستخدم</span>
        <div class="flex gap-3">
          <button :disabled="loading || page <= 1" class="border rounded-lg px-4 py-2 disabled:opacity-40" @click="changePage(-1)">السابق</button>
          <button :disabled="loading || employees.length < limit" class="border rounded-lg px-4 py-2 disabled:opacity-40" @click="changePage(1)">التالي</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useEmployees } from '@/composables/useEmployees'

const auth = useAuthStore()
const { filters, page, limit, employees, loading, error, applyFilters, resetFilters, loadEmployees, changePage } = useEmployees()
watch(limit, applyFilters)
</script>
