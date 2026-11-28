const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const PERMISSIONS_KEY = 'auth_permissions'
export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

export function readSession() {
  // localStorage is shared by all tabs/windows of the same application origin.
  // Prefer it so a session cannot disappear when the user opens another window.
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
  const token = storage.getItem(TOKEN_KEY)
  try {
    return { token, user: JSON.parse(storage.getItem(USER_KEY) || 'null'), ...JSON.parse(storage.getItem(PERMISSIONS_KEY) || '{}') }
  } catch {
    return { token, user: null }
  }
}

export function clearSession() {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
    storage.removeItem(PERMISSIONS_KEY)
  }
}

export function saveSession({ token, user, screens = {}, access = {} }) {
  clearSession()
  // Authentication must survive a new tab/window; keep it in shared storage.
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify({ screens, access }))
}
