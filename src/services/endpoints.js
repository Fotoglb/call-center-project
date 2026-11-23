/*
 * الملف المركزي الوحيد لكل روابط الـ API في المشروع.
 * عند توفر الـ Backend الحقيقي، التعديل يقتصر على هذا الملف
 * (ومهما احتاج الأمر Response Mapping داخل ملفات services/*.service.js)
 * دون أي حاجة لتعديل الصفحات أو الـ Components.
 */
export const ENDPOINTS = {
  users: {
    resetPassword: userId => `/users/${encodeURIComponent(userId)}/reset-password`,
    update: userId => `/users/${encodeURIComponent(userId)}`,
    list: '/users',
    create: '/users'
  },
  auth: {
    changePassword: '/auth/change-password',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    resetPassword: '/auth/reset-password'
  },
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    read: id => `/notifications/${encodeURIComponent(id)}/read`,
    readAll: '/notifications/read-all'
  },

  dashboard: {
    overview: '/dashboard',
    stats: '/dashboard/stats',
    weeklyPerformance: '/dashboard/weekly-performance',
    customerSources: '/dashboard/customer-sources',
    teamPerformance: '/dashboard/team-performance',
    activities: '/dashboard/activities',
    upcomingVisits: '/dashboard/upcoming-visits'
  },

  calls: {
    dial: '/calls/dial',
    meta: '/calls/meta',
    queue: '/calls/queue',
    reschedule: '/calls/reschedule',
    create: '/calls',
    list: '/calls/log',
    history: '/calls'
  },
  lookups: '/lookups',

  customers: {
    bulk: '/leads/bulk',
    sources: '/leads/sources',
    list: '/leads',
    detail: id => `/leads/${encodeURIComponent(id)}`,
    profile: id => `/leads/${encodeURIComponent(id)}/profile`,
    create: '/leads',
    update: id => `/leads/${encodeURIComponent(id)}`,
    documents: id => `/leads/${encodeURIComponent(id)}/documents`,
    notes: id => `/leads/${encodeURIComponent(id)}/notes`,
    remove: id => `/leads/${encodeURIComponent(id)}`,
    duplicates: '/leads/check-duplicate',
    search: '/leads',
    import: '/customers/import',
    export: '/customers/export'
  },

  reports: {
    daily: '/reports/daily',
    summary: '/reports/daily',
    conversionTrend: '/reports/conversion',
    cdr: '/reports/cdr',
    customerSources: '/reports/sources',
    employeePerformance: '/reports/rep-performance/current',
    periodicEmployeePerformance: '/reports/rep-performance/periodic',
    visitSuccess: '/reports/visit-success',
    employeeTrend: '/reports/employee-trend'
  },

  settings: {
    profile: '/settings/profile',
    updateProfile: '/settings/profile',
    changePassword: '/auth/change-password'
  }
}
