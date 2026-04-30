// Thin fetch wrapper — same-origin via Vite proxy (/api → backend).
const TOKEN_KEY = 'zx.token'

export const api = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  async request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' }
    if (auth) {
      const t = api.getToken()
      if (t) headers.Authorization = `Bearer ${t}`
    }
    const res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    const data = text ? safeJson(text) : null
    if (!res.ok) {
      const err = new Error((data && data.error) || `HTTP ${res.status}`)
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  },

  get: (p, opts) => api.request(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => api.request(p, { ...opts, method: 'POST', body }),
  patch: (p, body, opts) => api.request(p, { ...opts, method: 'PATCH', body }),
  del: (p, opts) => api.request(p, { ...opts, method: 'DELETE' }),
}

function safeJson(t) {
  try { return JSON.parse(t) } catch { return null }
}
