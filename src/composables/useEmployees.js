import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { usersService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth.store'

export function useEmployees() {
const auth = useAuthStore()
const filters = reactive({ q: '', role: '', status: '' })
let appliedFilters = { ...filters }
const page = ref(1)
const limit = ref(20)
const employees = ref([])
const loading = ref(false)
const error = ref('')
const updatingId = ref(null)
const resettingId = ref(null)
const actionError = ref('')
const actionSuccess = ref('')
let disposed = false
let requestVersion = 0

async function loadEmployees() {
  if (!auth.can('employees.manage')) { employees.value = []; return }
  const version = ++requestVersion
  loading.value = true
  error.value = ''
  employees.value = []
  try {
    const response = await usersService.list({ ...appliedFilters, page: page.value, limit: limit.value })
    if (version !== requestVersion) return
    // No pagination envelope is assumed: the screenshot documents request params only.
    const rows = Array.isArray(response) ? response : response?.data
    if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
      throw new Error('يلزم تأكيد تنسيق استجابة قائمة الموظفين لعرض البيانات. لا تتوفر استجابة نجاح موثّقة بعد.')
    }
    employees.value = rows
  } catch (err) {
    if (version === requestVersion) error.value = err.status === 403 ? 'ليس لديك صلاحية عرض الموظفين' : err.message || 'تعذّر تحميل الموظفين'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}
function applyFilters() {
  page.value = 1
  appliedFilters = { ...filters }
  loadEmployees()
}
function resetFilters() {
  Object.assign(filters, { q: '', role: '', status: '' })
  applyFilters()
}
function changePage(delta) {
  page.value += delta
  loadEmployees()
}
async function deactivateEmployee(employee) {
  if (updatingId.value || resettingId.value || employee.status === 'inactive') return
  const userId = employee.id
  updatingId.value = userId
  actionError.value = ''
  actionSuccess.value = ''
  try {
    await usersService.deactivate(userId)
    if (disposed) return
    actionSuccess.value = 'تم تعطيل الموظف بنجاح'
    await loadEmployees()
  } catch (err) {
    if (!disposed) actionError.value = err.status === 403 ? 'ليس لديك صلاحية تعديل الموظفين' : err.message || 'تعذّر تعطيل الموظف'
  } finally {
    updatingId.value = null
  }
}
async function resetEmployeePassword(employee) {
  if (updatingId.value || resettingId.value) return
  resettingId.value = employee.id
  actionError.value = ''
  actionSuccess.value = ''
  try {
    await usersService.resetPassword(employee.id)
    if (!disposed) actionSuccess.value = 'تم تنفيذ طلب إعادة تعيين كلمة مرور الموظف بنجاح'
  } catch (err) {
    if (!disposed) actionError.value = err.status === 403
      ? 'ليس لديك صلاحية إعادة تعيين كلمة مرور الموظف'
      : err.message || 'تعذّر إعادة تعيين كلمة المرور'
  } finally {
    resettingId.value = null
  }
}
onMounted(loadEmployees)
onUnmounted(() => { disposed = true; requestVersion++ })

return { filters, page, limit, employees, loading, error, updatingId, resettingId, actionError, actionSuccess, loadEmployees, applyFilters, resetFilters, changePage, deactivateEmployee, resetEmployeePassword }
}
