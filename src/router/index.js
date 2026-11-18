import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'calls',
        name: 'Calls',
        component: () => import('@/pages/Calls.vue')
      },
      {
        path: 'agents',
        name: 'Agents',
        redirect: { name: 'CallHistory' }
      },
      {
        path: 'calls/history',
        name: 'CallHistory',
        component: () => import('@/pages/Agents.vue')
      },
      {
        path: 'employees/create',
        name: 'CreateEmployee',
        redirect: { name: 'Register' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/pages/Users.vue')
      },
      {
        path: 'employees',
        name: 'Employees',
        redirect: { name: 'Reports' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/Reports.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/Settings.vue')
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/pages/Customers.vue')
      },
      {
        path: 'customers/add',
        name: 'AddCustomer',
        component: () => import('@/pages/AddCustomer.vue')
      },
      {
        path: 'customers/:id',
        name: 'CustomerProfile',
        component: () => import('@/pages/CustomerProfile.vue')
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('@/pages/Help.vue')
      }
    ]
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/ForgotPassword.vue')
  },
  {
    path: '/auth/change-password',
    name: 'ChangePassword',
    component: () => import('@/pages/ChangePassword.vue')
  },
  {
    path: '/auth/otp',
    name: 'OTP',
    component: () => import('@/pages/OTP.vue')
  },
  {
    path: '/auth/register',
    name: 'Register',
    meta: { requiresAuth: true },
    component: () => import('@/pages/Register.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(to => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (!requiresAuth) return true

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  const permission = to.name === 'AddCustomer' ? (to.query.editId ? 'customers.viewEdit' : 'customers.create') : null
  if (!authStore.canOpen(to.path) || (permission && !authStore.can(permission))) {
    const fallback = ['/', '/customers', '/customers/add', '/calls', '/reports', '/settings'].find(path => authStore.canOpen(path))
    return { path: fallback || '/settings' }
  }
  return true
})

export default router
