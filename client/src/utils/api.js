const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'prep_dashboard_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.hash = '#/login'
    throw new ApiError('Session expired, please log in again.', 401)
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    // no JSON body (e.g. 204) — fine
  }

  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status)
  }
  return body
}

export const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  del: (path) => request(path, { method: 'DELETE' }),
}
