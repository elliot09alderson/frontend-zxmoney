// Real auth client — talks to /api/auth/*.
import { api } from './api'

// In-memory ticket for the OTP → set-password handoff.
// (Stored briefly in sessionStorage to survive refresh within the flow.)
const TICKET_KEY = 'zx.otpTicket'
const SESSION_CACHE_KEY = 'zx.me'

export const auth = {
  async lookup(phone) {
    return api.post('/auth/lookup', { phone }, { auth: false })
  },

  async requestOtp(phone) {
    return api.post('/auth/request-otp', { phone }, { auth: false })
  },

  async verifyOtp(phone, otp) {
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp }, { auth: false })
      if (res.ticket) sessionStorage.setItem(TICKET_KEY, res.ticket)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async setPassword(phone, password, intent = 'customer') {
    const ticket = sessionStorage.getItem(TICKET_KEY)
    if (!ticket) return { ok: false, error: 'OTP session missing. Request a new code.' }
    try {
      const res = await api.post(
        '/auth/set-password',
        { phone, password, intent, ticket },
        { auth: false },
      )
      api.setToken(res.token)
      sessionStorage.removeItem(TICKET_KEY)
      sessionStorage.removeItem(SESSION_CACHE_KEY)
      return { ok: true, role: res.role, intent: res.intent }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async signIn(phone, password) {
    try {
      const res = await api.post('/auth/sign-in', { phone, password }, { auth: false })
      api.setToken(res.token)
      sessionStorage.removeItem(SESSION_CACHE_KEY)
      return { ok: true, role: res.role }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  },

  async me() {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (cached) try { return JSON.parse(cached) } catch {}
    if (!api.getToken()) return null
    try {
      const me = await api.get('/auth/me')
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(me))
      return me
    } catch {
      api.clearToken()
      return null
    }
  },

  signOut() {
    api.clearToken()
    sessionStorage.removeItem(SESSION_CACHE_KEY)
    sessionStorage.removeItem(TICKET_KEY)
  },
  invalidateMe() { sessionStorage.removeItem(SESSION_CACHE_KEY) },
}

export function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '').slice(0, 10)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)} ${d.slice(5)}`
}
export const isValidPhone = (digits) => /^\d{10}$/.test((digits || '').replace(/\D/g, ''))
