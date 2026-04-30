import { useState } from 'react'
import { Store, Utensils, IndianRupee, Camera, Plus, X, Percent, CheckCircle2 } from 'lucide-react'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import { submitPartnerOnboarding } from '../../lib/store'
import { api } from '../../lib/api'

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Pan-Asian', 'Continental', 'Desserts', 'Cafe']
const PRICES = ['₹', '₹₹', '₹₹₹']

export default function PartnerOnboarding({ phone, onDone }) {
  const [form, setForm] = useState({
    name: '',
    cuisine: CUISINES[0],
    priceRange: '₹₹',
    vpa: '',
    discountPct: 15,
    profilePhotoUrl: '',
    carouselInput: '',
    carousel: [],
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function addCarousel() {
    const url = form.carouselInput.trim()
    if (!url) return
    setForm((f) => ({ ...f, carousel: [...f.carousel, url], carouselInput: '' }))
  }
  function removeCarousel(i) {
    setForm((f) => ({ ...f, carousel: f.carousel.filter((_, idx) => idx !== i) }))
  }

  const valid = form.name && form.vpa && form.discountPct >= 0 && form.discountPct <= 100

  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    setError('')
    try {
      const { carouselInput, ...payload } = form
      const res = await submitPartnerOnboarding(payload)
      if (res?.token) api.setToken(res.token)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <GlassCard>
        <div className="text-center py-6">
          <div
            className="mx-auto h-14 w-14 rounded-2xl grid place-items-center"
            style={{
              background: 'radial-gradient(circle at 30% 25%, #ff5b6c, #e50d2a 55%, #4c0210 100%)',
              boxShadow: '0 10px 30px -8px rgba(229,13,42,0.6)',
            }}
          >
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 font-display text-[24px] font-bold">Almost there!</h1>
          <p className="mt-2 text-sm text-white/60 max-w-xs mx-auto">
            Your partner profile is submitted for review. The super admin will activate you shortly.
          </p>
          <button
            onClick={onDone}
            className="btn-ghost mt-6 inline-flex items-center gap-2 rounded-full px-5 h-10 text-[13px]"
          >
            Got it
          </button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <span className="chip"><Store className="h-3 w-3" /> partner onboarding</span>
      </div>
      <h1 className="mt-4 font-display text-[26px] font-bold leading-tight">
        Set up your restaurant
      </h1>
      <p className="mt-1.5 text-sm text-white/55">
        Tell us about your place — you can fine-tune everything later in the dashboard.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field icon={Utensils} label="Restaurant name" required>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Dragon Bowl"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cuisine">
            <select
              value={form.cuisine}
              onChange={(e) => set('cuisine', e.target.value)}
              className="flex-1 bg-transparent outline-none text-[15px] appearance-none"
            >
              {CUISINES.map((c) => <option key={c} value={c} className="bg-ink-900">{c}</option>)}
            </select>
          </Field>
          <Field label="Price">
            <div className="flex items-center gap-1 w-full">
              {PRICES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => set('priceRange', p)}
                  className={`flex-1 h-9 rounded-lg text-[13px] font-medium transition-colors ${
                    form.priceRange === p
                      ? 'bg-crimson-500/20 border border-crimson-400/50 text-white'
                      : 'border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field icon={IndianRupee} label="UPI ID (VPA)" required>
          <input
            value={form.vpa}
            onChange={(e) => set('vpa', e.target.value.trim())}
            placeholder="yourbusiness@upi"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
          />
        </Field>

        <Field icon={Percent} label="zx coupon discount (%)">
          <input
            type="number"
            min="0" max="100"
            value={form.discountPct}
            onChange={(e) => set('discountPct', Number(e.target.value))}
            className="flex-1 bg-transparent outline-none text-[15px] tabular-nums"
          />
        </Field>

        <Field icon={Camera} label="Profile photo URL">
          <input
            value={form.profilePhotoUrl}
            onChange={(e) => set('profilePhotoUrl', e.target.value)}
            placeholder="https://..."
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/30"
          />
        </Field>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2 pl-1">
            Carousel images
          </div>
          <div className="flex items-center gap-2">
            <Field>
              <input
                value={form.carouselInput}
                onChange={(e) => set('carouselInput', e.target.value)}
                placeholder="https://image-url..."
                className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCarousel())}
              />
            </Field>
            <button
              type="button"
              onClick={addCarousel}
              className="btn-ghost h-12 w-12 rounded-2xl grid place-items-center shrink-0"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {form.carousel.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.carousel.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden glass-subtle">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeCarousel(i)}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-ink-950/80 backdrop-blur grid place-items-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-[13px] text-rose-300/90 px-1">{error}</div>}

        <PrimaryButton type="submit" loading={loading} disabled={!valid} className="!mt-6">
          Submit for review
        </PrimaryButton>

        <div className="text-center text-[11px] text-white/40">
          Super admin will activate you. You&apos;ll get access to the dashboard once approved.
        </div>
      </form>
    </GlassCard>
  )
}

function Field({ icon: Icon, label, required, children }) {
  return (
    <div>
      {label && (
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2 pl-1">
          {label} {required && <span className="text-crimson-400">*</span>}
        </div>
      )}
      <label className="glass-input flex items-center gap-3 rounded-2xl px-4 h-12">
        {Icon && <Icon className="h-[18px] w-[18px] text-crimson-400" strokeWidth={2.2} />}
        {children}
      </label>
    </div>
  )
}
