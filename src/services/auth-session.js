const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const PERMISSIONS_KEY = 'auth_permissions'
export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

export function readSession() {
  const storage = sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage
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

export function saveSession({ token, user, screens = {}, access = {} }, remember = false) {
  clearSession()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
  storage.setItem(PERMISSIONS_KEY, JSON.stringify({ screens, access }))
}
