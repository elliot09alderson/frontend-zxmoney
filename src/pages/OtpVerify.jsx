import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCcw, ShieldCheck } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import OtpField from '../components/OtpField'
import PrimaryButton from '../components/PrimaryButton'
import { auth, formatPhone } from '../lib/auth'

export default function OtpVerify({ phone, go }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(30)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setInterval(() => setResendIn((n) => n - 1), 1000)
    return () => clearInterval(t)
  }, [resendIn])

  async function submit(code) {
    const value = code ?? otp
    if (value.length !== 6 || loading) return
    setLoading(true)
    setError('')
    const res = await auth.verifyOtp(phone, value)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || 'Invalid code')
      setOtp('')
      return
    }
    go('setpw')
  }

  async function resend() {
    if (resendIn > 0) return
    setOtp('')
    setError('')
    const res = await auth.requestOtp(phone)
    if (res && !res.ok && res.error) {
      setError(res.error)
      return
    }
    setResendIn(30)
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
        Verify your number
      </h1>
      <p className="mt-2 text-sm text-white/60">
        We sent a 6-digit code to{' '}
        <span className="text-white/90 font-medium tabular-nums">+91 {formatPhone(phone)}</span>
      </p>

      <div className="mt-7">
        <OtpField value={otp} onChange={setOtp} onComplete={submit} />

        {error && (
          <div className="mt-3 text-[13px] text-rose-300/90 px-1">{error}</div>
        )}

        <div className="mt-5 flex items-center justify-between text-[13px]">
          <span className="text-white/50">
            {resendIn > 0 ? (
              <>Resend in <span className="text-white/80 tabular-nums">{resendIn}s</span></>
            ) : (
              'Didn’t get the code?'
            )}
          </span>
          <button
            onClick={resend}
            disabled={resendIn > 0}
            className="inline-flex items-center gap-1.5 text-crimson-300 hover:text-crimson-200 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Resend code
          </button>
        </div>
      </div>

      <PrimaryButton
        onClick={() => submit()}
        disabled={otp.length !== 6}
        loading={loading}
        className="mt-7"
        icon={ShieldCheck}
      >
        Verify & continue
      </PrimaryButton>

      <div className="mt-5 text-center text-[11px] text-white/40">
        Tip: on iOS/Android, the code auto-fills from SMS
      </div>
    </GlassCard>
  )
}
