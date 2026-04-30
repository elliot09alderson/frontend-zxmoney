import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, IndianRupee, Ticket, BadgeCheck, Sparkles, X,
} from 'lucide-react'
import TopBar from '../../components/TopBar'
import PrimaryButton from '../../components/PrimaryButton'
import { getRestaurant } from '../../lib/store'
import { buildUpi, UPI_APPS } from '../../lib/upi'

export default function RestaurantDetail({ restaurantId, go }) {
  const [r, setR] = useState(null)
  const [bill, setBill] = useState('')
  const [applied, setApplied] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    getRestaurant(restaurantId).then(setR)
  }, [restaurantId])

  const amount = Number(bill) || 0
  const discount = r && applied ? Math.round((amount * r.discountPct) / 100) : 0
  const payable = Math.max(0, amount - discount)

  useEffect(() => {
    if (!r?.carousel?.length) return
    const t = setInterval(() => setSlide((s) => (s + 1) % r.carousel.length), 4500)
    return () => clearInterval(t)
  }, [r])

  if (!r) {
    return (
      <div className="space-y-4">
        <TopBar onBack={() => go('home')} />
        <div className="glass rounded-3xl p-8 text-center text-white/50">Loading…</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => go('home')}
          className="btn-ghost grid place-items-center h-9 w-9 rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="chip">
          <Sparkles className="h-3 w-3" /> {r.discountPct}% zx coupon
        </div>
      </div>

      {/* Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-[16/10] rounded-3xl overflow-hidden glass"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={r.carousel?.[slide] || r.profilePhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-transparent" />

        {r.carousel?.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {r.carousel.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? 'w-6 bg-crimson-400' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-5 left-5 right-5">
          <div className="font-display text-[22px] font-bold leading-tight">{r.name}</div>
          <div className="mt-1 flex items-center gap-3 text-[12px] text-white/75">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-crimson-400 text-crimson-400" />
              {r.rating?.toFixed?.(1) || '—'}
            </span>
            <span>{r.cuisine}</span>
            <span>{r.priceRange}</span>
          </div>
        </div>
      </motion.div>

      {/* Bill & coupon */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-3xl p-5"
      >
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-3">
          Bill amount
        </div>
        <label className="glass-input flex items-center gap-2 rounded-2xl px-4 h-14">
          <IndianRupee className="h-5 w-5 text-crimson-400" strokeWidth={2.4} />
          <input
            value={bill}
            onChange={(e) => setBill(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="0"
            className="flex-1 bg-transparent outline-none text-[22px] font-semibold tabular-nums placeholder:text-white/25"
          />
        </label>

        <button
          onClick={() => setApplied((a) => !a)}
          disabled={amount <= 0}
          className={`mt-3 w-full rounded-2xl h-12 flex items-center justify-between px-4 transition-all ${
            applied
              ? 'bg-crimson-500/10 border border-crimson-400/40 shadow-glow-sm'
              : 'glass-subtle hover:border-white/20'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <span className="inline-flex items-center gap-2 text-[13px]">
            <Ticket className={`h-4 w-4 ${applied ? 'text-crimson-300' : 'text-white/70'}`} />
            <span className="font-medium">
              {applied ? `zx coupon applied · ${r.discountPct}% off` : 'Apply zx coupon'}
            </span>
          </span>
          {applied && (
            <span className="inline-flex items-center gap-1 text-[12px] text-emerald-300/90">
              <BadgeCheck className="h-3.5 w-3.5" /> saved ₹{discount}
            </span>
          )}
        </button>

        {/* Breakdown */}
        <div className="mt-4 divider-soft" />
        <div className="mt-4 space-y-2 text-[13px]">
          <Row label="Bill" value={`₹${amount.toLocaleString()}`} />
          <Row label={`Discount (${r.discountPct}%)`} value={applied ? `− ₹${discount.toLocaleString()}` : '—'} muted={!applied} />
          <div className="divider-soft my-2" />
          <div className="flex items-baseline justify-between">
            <span className="text-white/70">You pay</span>
            <span className="font-display text-[24px] font-bold tabular-nums">
              ₹{payable.toLocaleString()}
            </span>
          </div>
        </div>

        <PrimaryButton
          onClick={() => setShowPay(true)}
          disabled={amount <= 0}
          className="mt-5"
          icon={IndianRupee}
        >
          Pay ₹{payable.toLocaleString()} via UPI
        </PrimaryButton>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/45">
          <MapPin className="h-3.5 w-3.5 text-crimson-400/80" />
          Payment goes to {r.vpa}
        </div>
      </motion.div>

      <AnimatePresence>
        {showPay && (
          <PayModal
            onClose={() => setShowPay(false)}
            restaurant={r}
            amount={payable}
            discount={discount}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-white/40' : 'text-white/65'}>{label}</span>
      <span className={`tabular-nums ${muted ? 'text-white/35' : 'text-white/90'}`}>{value}</span>
    </div>
  )
}

function PayModal({ onClose, restaurant, amount, discount }) {
  function pay(scheme) {
    const url = buildUpi({
      scheme,
      vpa: restaurant.vpa,
      name: restaurant.name,
      amount,
      note: `zx.money ${discount > 0 ? `(−₹${discount})` : ''}`.trim(),
    })
    window.location.href = url
    setTimeout(() => onClose(), 800)
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-3xl w-full max-w-md p-5 sm:p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Choose UPI app</div>
            <div className="mt-1 font-display text-[22px] font-bold">
              Pay ₹{amount.toLocaleString()}
            </div>
            <div className="text-[12px] text-white/50">to {restaurant.name}</div>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 grid place-items-center rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {UPI_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => pay(app.scheme)}
              className="glass-subtle rounded-2xl p-4 text-left hover:bg-white/[0.07] transition-colors"
            >
              <div
                className="h-10 w-10 rounded-xl grid place-items-center font-bold text-sm"
                style={{
                  background: `${app.accent}22`,
                  border: `1px solid ${app.accent}66`,
                  color: '#fff',
                }}
              >
                {app.label[0]}
              </div>
              <div className="mt-2 text-sm font-medium">{app.label}</div>
              <div className="text-[11px] text-white/45 truncate">{restaurant.vpa}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-[11px] text-white/45 text-center">
          Your UPI app will open with the amount pre-filled.
        </div>
      </motion.div>
    </motion.div>
  )
}
