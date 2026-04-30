import { useState } from 'react'
import { ArrowLeft, LogIn } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PasswordField from '../components/PasswordField'
import PrimaryButton from '../components/PrimaryButton'
import { auth, formatPhone } from '../lib/auth'

export default function SignIn({ phone, go }) {
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!pw || loading) return
    setLoading(true)
    setError('')
    const res = await auth.signIn(phone, pw)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || 'Unable to sign in')
      return
    }
    go('home')
  }

  return (
    <GlassCard>
      <button
        onClick={() => go('phone')}
        className="group inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Change number
      </button>

      <h1 className="mt-4 font-display text-[26px] sm:text-[30px] font-bold leading-tight tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Signing in as{' '}
        <span className="text-white/90 font-medium tabular-nums">+91 {formatPhone(phone)}</span>
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3.5">
        <PasswordField
          value={pw}
          onChange={setPw}
          placeholder="Your password"
          autoFocus
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={async () => {
            await auth.requestOtp(phone)
            go('otp')
          }}
          className="text-[13px] text-crimson-300 hover:text-crimson-200 transition-colors"
        >
          Forgot password? Use OTP instead
        </button>

        {error && <div className="text-[13px] text-rose-300/90 px-1">{error}</div>}

        <PrimaryButton
          type="submit"
          disabled={!pw}
          loading={loading}
          icon={LogIn}
          className="!mt-6"
        >
          Sign in
        </PrimaryButton>
      </form>
    </GlassCard>
  )
}
