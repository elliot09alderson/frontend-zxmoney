import { useState } from 'react'
import { KeyRound, CheckCircle2, XCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PasswordField from '../components/PasswordField'
import PasswordStrength, { scorePassword } from '../components/PasswordStrength'
import PrimaryButton from '../components/PrimaryButton'
import { auth } from '../lib/auth'

export default function SetPassword({ phone, go, intent = 'customer' }) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strong = scorePassword(pw) >= 2 && pw.length >= 8
  const matches = confirm.length > 0 && confirm === pw
  const ready = strong && matches

  async function submit(e) {
    e.preventDefault()
    if (!ready || loading) return
    setLoading(true)
    setError('')
    const res = await auth.setPassword(phone, pw, intent)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || 'Could not set password')
      return
    }
    go(intent === 'partner' ? 'partner-onboarding' : 'home')
  }

  return (
    <GlassCard>
      <h1 className="font-display text-[26px] sm:text-[30px] font-bold leading-tight tracking-tight">
        Create a password
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Next time, you&apos;ll sign in with your number and this password.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3.5">
        <div>
          <PasswordField
            value={pw}
            onChange={setPw}
            placeholder="New password"
            autoFocus
          />
          <PasswordStrength value={pw} />
        </div>

        <div>
          <PasswordField
            value={confirm}
            onChange={setConfirm}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          {confirm.length > 0 && (
            <div
              className={`mt-2 flex items-center gap-1.5 text-[12px] ${
                matches ? 'text-emerald-300/90' : 'text-rose-300/90'
              }`}
            >
              {matches ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" /> Passwords don&apos;t match
                </>
              )}
            </div>
          )}
        </div>

        {error && <div className="text-[13px] text-rose-300/90 px-1">{error}</div>}

        <PrimaryButton
          type="submit"
          disabled={!ready}
          loading={loading}
          icon={KeyRound}
          className="!mt-6"
        >
          Save & sign in
        </PrimaryButton>
      </form>
    </GlassCard>
  )
}
