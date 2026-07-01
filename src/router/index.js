import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Home.vue')
      },
      {
        path: 'calls',
        name: 'Calls',
        component: () => import('@/pages/Calls.vue')
      },
      {
        path: 'agents',
        name: 'Agents',
        component: () => import('@/pages/Agents.vue')
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

export default router
