import { useState } from 'react'
import { ArrowRight, Sparkles, ShieldCheck, Store } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PhoneField from '../components/PhoneField'
import PrimaryButton from '../components/PrimaryButton'
import { auth, isValidPhone } from '../lib/auth'

export default function PhoneEntry({ phone, setPhone, go, intent, setIntent }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const valid = isValidPhone(phone)

  async function onContinue(e) {
    e?.preventDefault()
    if (!valid || loading) return
    setError('')
    setLoading(true)
    try {
      const { status } = await auth.lookup(phone)
      if (status === 'needs-password') {
        go('signin')
      } else {
        await auth.requestOtp(phone)
        go('otp')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <span className="chip">
          <Sparkles className="h-3 w-3" /> secure sign-in
        </span>
      </div>

      <h1 className="mt-5 font-display text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight">
        Welcome back <span className="text-crimson-400">.</span>
      </h1>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">
        Enter your mobile number to continue. We&apos;ll send a one-time code if it&apos;s your first visit.
      </p>

      <form onSubmit={onContinue} className="mt-7 space-y-4">
        <PhoneField value={phone} onChange={setPhone} autoFocus />

        <label className="flex items-start gap-3 rounded-2xl glass-subtle px-4 py-3 cursor-pointer group">
          <span className={`mt-0.5 grid place-items-center h-5 w-5 rounded-md border transition-all ${
            intent === 'partner'
              ? 'bg-crimson-500 border-crimson-400 shadow-glow-sm'
              : 'border-white/20 group-hover:border-white/40'
          }`}>
            {intent === 'partner' && (
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-white"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
          <input
            type="checkbox"
            checked={intent === 'partner'}
            onChange={(e) => setIntent(e.target.checked ? 'partner' : 'customer')}
            className="sr-only"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/90">
              <Store className="h-3.5 w-3.5 text-crimson-400" />
              Register as restaurant partner
            </div>
            <div className="text-[11px] text-white/45 mt-0.5">
              Create an admin account to manage discounts, contests & winners.
            </div>
          </div>
        </label>

        {error && (
          <div className="text-[13px] text-rose-300/90 px-1">{error}</div>
        )}

        <PrimaryButton
          icon={ArrowRight}
          disabled={!valid}
          loading={loading}
          type="submit"
        >
          Continue
        </PrimaryButton>
      </form>

      <div className="mt-6 flex items-center gap-2 text-[11px] text-white/45">
        <ShieldCheck className="h-3.5 w-3.5 text-crimson-400/80" />
        <span>End-to-end encrypted · never shared</span>
      </div>
    </GlassCard>
  )
}
