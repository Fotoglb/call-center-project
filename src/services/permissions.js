export function canAccess(session, permission) {
  if (permission.includes('|')) return permission.split('|').some(item => canAccess(session, item))
  const [group, action] = permission.split('.')
  if (group === 'screens') return session?.screens?.[action] === true
  const screen = { customers: 'customers', callCenter: 'callCenter', customerProfile: 'customerProfile', reports: 'reports' }[group]
  if (screen && session?.screens?.[screen] !== true) return false
  if (group === 'employees' && action === 'register' && session?.screens?.addEmployee !== true) return false
  return session?.access?.[group]?.[action] === true
}

export function canVisit(session, path) {
  path = path.split('?')[0].replace(/\/$/, '') || '/'
  if (path === '/users') return canAccess(session, 'employees.manage')
  const screen = path === '/' ? 'dashboard'
    : path === '/auth/register' || path === '/employees/create' ? 'addEmployee'
      : path === '/reports' || path === '/employees' ? 'reports'
        : path === '/calls' || path.startsWith('/calls/') || path === '/agents' ? 'callCenter'
          : /^\/customers\/[^/]+$/.test(path) && path !== '/customers/add' ? 'customerProfile'
            : path.startsWith('/customers') ? 'customers' : null
  if (screen && session?.screens?.[screen] !== true) return false
  if (path === '/calls') return canAccess(session, 'callCenter.queue|callCenter.rescheduleList')
  if (screen === 'reports') return ['currentRepPerformance', 'periodicRepPerformance', 'cdr', 'daily', 'sources', 'conversionRate'].some(action => canAccess(session, `reports.${action}`))
  if (path === '/calls/history' || path === '/agents') return canAccess(session, 'callCenter.queue|customerProfile.view')
  if (path === '/customers') return canAccess(session, 'customers.list')
  if (path === '/customers/add') return canAccess(session, 'customers.create') || canAccess(session, 'customers.viewEdit')
  if (screen === 'customerProfile') return canAccess(session, 'customerProfile.view')
  if (screen === 'addEmployee') return canAccess(session, 'employees.register')
  return screen !== null || path === '/settings' || path === '/help'
}

export function requestPermission(url, method = 'get') {
  const path = url?.split('?')[0]
  if (path?.startsWith('/dashboard/')) return 'screens.dashboard'
  if (path === '/users') return method === 'post' ? 'employees.register' : 'employees.manage'
  if (/^\/users\//.test(path)) return 'employees.manage'
  if (path === '/leads') return method === 'post' ? 'customers.create' : 'customers.list'
  if (/^\/leads\/[^/]+\/profile$/.test(path)) return 'customerProfile.view'
  if (path === '/leads/sources') return 'customers.list|customers.create|customers.viewEdit'
  if (path === '/leads/bulk/template') return 'customers.list|customers.create|customers.viewEdit'
  if (path === '/leads/bulk') return 'customers.create'
  if (path === '/leads/check-duplicate') return 'customers.create|customers.viewEdit'
  if (/^\/leads\//.test(path)) return method === 'delete' ? 'customers.delete' : 'customers.viewEdit'
  if (path === '/calls/queue') return 'callCenter.queue'
  if (path === '/calls/reschedule') return 'callCenter.rescheduleList'
  if (path === '/calls' && method === 'post') return 'callCenter.logCall'
  if (path === '/calls') return 'callCenter.queue|customerProfile.view'
  if (/^\/calls\//.test(path) && method !== 'get') return 'callCenter.logCall'
  return ({
    '/reports/daily': 'reports.daily',
    '/reports/sources': 'reports.sources',
    '/reports/conversion': 'reports.conversionRate',
    '/reports/cdr': 'reports.cdr',
    '/reports/rep-performance/current': 'reports.currentRepPerformance',
    '/reports/visit-success': 'reports.periodicRepPerformance',
    '/reports/employee-trend': 'reports.periodicRepPerformance',
  })[path] ?? null
}
