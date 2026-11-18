import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth.store'
import { SESSION_EXPIRED_EVENT } from '@/services/auth-session'
import '@fontsource/tajawal/400.css'
import '@fontsource/tajawal/500.css'
import '@fontsource/tajawal/700.css'
import '@fontsource/tajawal/800.css'
import '@fontsource/tajawal/900.css'
import '@/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// نسترجع جلسة المستخدم الحالي (لو فيه token محفوظ) قبل أول Navigation
// عشان الـ Router Guard يقدر يقرر صح لو الصفحة محمية.
const authStore = useAuthStore()
window.addEventListener(SESSION_EXPIRED_EVENT, () => {
  authStore.clearSession()
  const currentRoute = router.currentRoute.value
  if (currentRoute.matched.some(record => record.meta.requiresAuth)) {
    router.replace({ name: 'Login', query: { redirect: currentRoute.fullPath } })
  }
})
authStore.init().finally(() => {
  app.mount('#app')
})
