import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trophy, Gift, ChevronRight, Wifi, X, ShieldCheck, History, ArrowDownLeft, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react'
import TopBar from '../../components/TopBar'
import RestaurantCard from '../../components/RestaurantCard'
import ContestCard from '../../components/ContestCard'
import WinnerTile from '../../components/WinnerTile'
import { auth, formatPhone } from '../../lib/auth'
import { listRestaurants, listContests, listWinners, getRedeemHistory, submitRedeemRequest } from '../../lib/store'

const CARD_COLORS = [
  { id: 'red',    bg: 'linear-gradient(135deg,#c0392b 0%,#e74c3c 40%,#c0392b 70%,#96281b 100%)', shadow: 'rgba(196,58,44,0.45)' },
  { id: 'indigo', bg: 'linear-gradient(135deg,#312e81 0%,#4f46e5 40%,#3730a3 70%,#1e1b4b 100%)', shadow: 'rgba(79,70,229,0.45)' },
  { id: 'teal',   bg: 'linear-gradient(135deg,#0f766e 0%,#14b8a6 40%,#0d9488 70%,#065f46 100%)', shadow: 'rgba(20,184,166,0.45)' },
  { id: 'violet', bg: 'linear-gradient(135deg,#6d28d9 0%,#8b5cf6 40%,#7c3aed 70%,#4c1d95 100%)', shadow: 'rgba(139,92,246,0.45)' },
  { id: 'rose',   bg: 'linear-gradient(135deg,#9f1239 0%,#f43f5e 40%,#e11d48 70%,#881337 100%)', shadow: 'rgba(244,63,94,0.45)' },
  { id: 'slate',  bg: 'linear-gradient(135deg,#1e293b 0%,#334155 40%,#1e293b 70%,#0f172a 100%)', shadow: 'rgba(30,41,59,0.6)'   },
]

export default function CustomerHome({ phone, walletBalance = 0, earnedBalance = 0, go, onSignOut, openRestaurant, openAllContests, openAllWinners }) {
  const [rs, setRs] = useState([])
  const [cs, setCs] = useState([])
  const [ws, setWs] = useState([])
  const [q, setQ] = useState('')
  const [showTnc, setShowTnc] = useState(false)
  const [showEarned, setShowEarned] = useState(false)   // history + redeem sheet
  const [earnedView, setEarnedView] = useState('history') // 'history' | 'redeem'
  const [redeemHistory, setRedeemHistory] = useState(null)
  const [redeemAmt, setRedeemAmt] = useState('')
  const [redeemNote, setRedeemNote] = useState('')
  const [redeemBenef, setRedeemBenef] = useState({ name: '', accountType: 'upi', upiId: '', bankAccount: '', ifsc: '', bankName: '' })
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState(null)
  const [cardColorId, setCardColorId] = useState(
    () => localStorage.getItem('zx_card_color') || 'red'
  )
  const [ssoLoading, setSsoLoading] = useState(false)

  async function goToZxcom() {
    setSsoLoading(true)
    try {
      const res = await fetch('/api/auth/sso-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('zx.token')}`,
        },
      })
      const data = await res.json()
      if (data.ticket) {
        window.location.href = `https://zxcom.in/sso?ticket=${encodeURIComponent(data.ticket)}`
      }
    } catch {
      window.location.href = 'https://zxcom.in'
    }
    setSsoLoading(false)
  }
  const [showColorPicker, setShowColorPicker] = useState(false)

  const cardColor = CARD_COLORS.find((c) => c.id === cardColorId) || CARD_COLORS[0]

  function pickColor(id) {
    setCardColorId(id)
    localStorage.setItem('zx_card_color', id)
    setShowColorPicker(false)
  }

  useEffect(() => {
    listRestaurants().then(setRs)
    listContests().then((list) => setCs(list.filter((c) => c.active !== false)))
    listWinners().then(setWs)
  }, [])

  const filtered = q
    ? rs.filter((r) =>
        (r.name + ' ' + (r.cuisine || '')).toLowerCase().includes(q.toLowerCase())
      )
    : rs

  return (
    <div className="space-y-6">
      <TopBar onSignOut={onSignOut} />

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass rounded-3xl p-5 sm:p-6"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Hey there</div>
          <div className="mt-1 font-display text-[22px] font-bold leading-tight">
            +91 {formatPhone(phone)} <span className="text-crimson-400">.</span>
          </div>
          <div className="mt-1 text-[13px] text-white/55">
            Scan restaurants, apply the zx coupon, pay with UPI &amp; win rewards.
          </div>
        </div>

        <label className="mt-4 glass-input flex items-center gap-3 rounded-2xl px-4 h-12">
          <Search className="h-[18px] w-[18px] text-white/55" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants or cuisines"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/30"
          />
        </label>
      </motion.div>

      {/* ZX Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="relative overflow-hidden rounded-3xl p-6 select-none"
        style={{
          background: cardColor.bg,
          boxShadow: `0 8px 32px ${cardColor.shadow}`,
          transition: 'background 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 top-8 h-28 w-28 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-36 w-36 rounded-full bg-black/10" />

        {/* Card top row */}
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/70 font-medium">ZX Money</div>
            <div className="mt-0.5 text-[15px] font-semibold text-white/90">Private Wallet</div>
          </div>
          <Wifi className="h-5 w-5 text-white/60 rotate-90" />
        </div>

        {/* Chip */}
        <div className="relative mt-5 h-9 w-12 rounded-md bg-amber-300/90 grid grid-cols-2 gap-px p-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-sm bg-amber-500/60" />
          ))}
        </div>

        {/* Balance */}
        <div className="relative mt-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Balance</div>
          <div className="mt-0.5 font-display text-[34px] font-bold text-white tabular-nums leading-none">
            ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card bottom row */}
        <div className="relative mt-5 flex items-end justify-between">
          <button
            onClick={() => setShowTnc(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black/20 px-3 py-1.5 text-[12px] font-medium text-white/80 hover:bg-black/30 hover:text-white transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Terms &amp; Conditions
          </button>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.15em] text-white/50">Holder</div>
            <div className="text-[13px] font-medium text-white/85">+91 {formatPhone(phone)}</div>
          </div>
        </div>

        {/* Color picker toggle */}
        <div className="relative mt-4 flex items-center gap-1.5">
          <button
            onClick={() => setShowColorPicker((v) => !v)}
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-[0.15em]"
          >
            {showColorPicker ? 'Done' : 'Change color'}
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="flex gap-1.5 ml-1"
              >
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => pickColor(c.id)}
                    className={`h-5 w-5 rounded-full border-2 transition-all ${
                      cardColorId === c.id ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                    }`}
                    style={{ background: c.bg }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Shop on ZXCOM */}
      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={goToZxcom}
        disabled={ssoLoading}
        className="w-full flex items-center justify-between glass rounded-2xl px-5 py-4 hover:bg-white/8 transition-colors disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-crimson-500/15 border border-crimson-400/30 grid place-items-center">
            <ShoppingBag className="h-4 w-4 text-crimson-400" />
          </div>
          <div className="text-left">
            <div className="text-[14px] font-semibold text-white">Shop on ZXCOM</div>
            <div className="text-[11px] text-white/40">T-shirts, bags &amp; more — use your ZX wallet</div>
          </div>
        </div>
        {ssoLoading
          ? <div className="h-4 w-4 border-2 border-crimson-400 border-t-transparent rounded-full animate-spin" />
          : <ChevronRight className="h-4 w-4 text-white/30" />}
      </motion.button>

      {/* Credit Earned — summary panel */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="glass rounded-2xl px-5 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-amber-400/70 font-medium">Credit Earned</div>
            <div className="mt-0.5 font-display text-[22px] font-bold text-amber-300 tabular-nums leading-tight">
              ₹{earnedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-0.5 text-[11px] text-white/35">Contest prizes · Admin rewards</div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => {
                setEarnedView('redeem')
                setShowEarned(true)
                setRedeemMsg(null)
              }}
              className="h-8 px-3 rounded-xl bg-amber-400/15 border border-amber-400/30 text-[12px] font-medium text-amber-200 hover:bg-amber-400/25 transition-colors"
            >
              Redeem
            </button>
            <button
              onClick={() => {
                setEarnedView('history')
                setShowEarned(true)
                getRedeemHistory().then(setRedeemHistory)
              }}
              className="h-8 px-3 rounded-xl border border-white/10 text-[12px] text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <History className="h-3.5 w-3.5" /> History
            </button>
          </div>
        </div>
      </motion.div>

      {/* Credit Earned sheet */}
      <AnimatePresence>
        {showEarned && (
          <>
            <motion.div
              key="earned-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEarned(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              key="earned-sheet"
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg px-4 pb-8"
            >
              <div className="glass rounded-3xl p-5">
                {/* Sheet header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    {['history', 'redeem'].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          setEarnedView(v)
                          if (v === 'history') getRedeemHistory().then(setRedeemHistory)
                        }}
                        className={`h-8 px-3 rounded-full text-[12px] font-medium capitalize transition-colors ${
                          earnedView === v
                            ? 'bg-amber-400/15 border border-amber-400/40 text-amber-200'
                            : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {v === 'history' ? 'History' : 'Redeem'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowEarned(false)}
                    className="h-8 w-8 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors grid place-items-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* History view */}
                {earnedView === 'history' && (
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                    {!redeemHistory && <div className="text-center text-[13px] text-white/35 py-6">Loading…</div>}
                    {redeemHistory && redeemHistory.txns?.length === 0 && redeemHistory.requests?.length === 0 && (
                      <div className="text-center text-[13px] text-white/35 py-6">No history yet.</div>
                    )}
                    {redeemHistory?.requests?.map((req) => (
                      <div key={req._id || req.id} className="rounded-xl bg-white/5 px-4 py-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {req.status === 'pending'  && <Clock className="h-3.5 w-3.5 text-amber-400" />}
                            {req.status === 'paid'     && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                            {req.status === 'rejected' && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                            <span className="text-[13px] font-medium text-white/80 capitalize">
                              Redeem · {req.status}
                            </span>
                          </div>
                          <span className="text-[14px] font-bold text-rose-300 tabular-nums">-₹{req.amount}</span>
                        </div>
                        <div className="text-[11px] text-white/35">{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        {/* Show reference & admin note once processed */}
                        {req.referenceId && (
                          <div className="mt-1 rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-3 py-2 space-y-0.5">
                            <div className="text-[11px] text-emerald-300/70 uppercase tracking-[0.1em]">Payment Reference</div>
                            <div className="text-[13px] font-mono font-medium text-emerald-200">{req.referenceId}</div>
                          </div>
                        )}
                        {req.adminNote && (
                          <div className="text-[11px] text-white/40 italic">"{req.adminNote}"</div>
                        )}
                      </div>
                    ))}
                    {redeemHistory?.txns?.filter(t => t.type === 'credit').map((t) => (
                      <div key={t._id || t.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
                        <div>
                          <div className="text-[13px] font-medium text-white/80">{t.note || 'Credit received'}</div>
                          <div className="text-[11px] text-white/35">{new Date(t.at).toLocaleDateString('en-IN')}</div>
                        </div>
                        <div className="text-[14px] font-bold text-emerald-400 tabular-nums">+₹{t.amount}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Redeem view — with beneficiary form */}
                {earnedView === 'redeem' && (
                  <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    <div className="text-[12px] text-white/45">
                      Available: <span className="text-amber-300 font-semibold">₹{earnedBalance.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Amount (₹)</label>
                      <input type="number" min="1" max={earnedBalance} value={redeemAmt}
                        onChange={(e) => setRedeemAmt(e.target.value)}
                        placeholder="Enter amount to redeem"
                        className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 tabular-nums" />
                    </div>

                    {/* Beneficiary name */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Beneficiary Name</label>
                      <input type="text" value={redeemBenef.name}
                        onChange={(e) => setRedeemBenef(b => ({ ...b, name: e.target.value }))}
                        placeholder="Full name as per account"
                        className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />
                    </div>

                    {/* Account type toggle */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Payment Method</label>
                      <div className="flex gap-2">
                        {['upi', 'bank'].map((t) => (
                          <button key={t} type="button"
                            onClick={() => setRedeemBenef(b => ({ ...b, accountType: t }))}
                            className={`flex-1 h-9 rounded-xl text-[13px] font-medium uppercase transition-colors ${
                              redeemBenef.accountType === t
                                ? 'bg-amber-400/20 border border-amber-400/50 text-amber-200'
                                : 'border border-white/10 text-white/40 hover:text-white'
                            }`}>{t}</button>
                        ))}
                      </div>
                    </div>

                    {/* UPI field */}
                    {redeemBenef.accountType === 'upi' && (
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">UPI ID</label>
                        <input type="text" value={redeemBenef.upiId}
                          onChange={(e) => setRedeemBenef(b => ({ ...b, upiId: e.target.value }))}
                          placeholder="e.g. name@upi"
                          className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />
                      </div>
                    )}

                    {/* Bank fields */}
                    {redeemBenef.accountType === 'bank' && (
                      <>
                        <div>
                          <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Account Number</label>
                          <input type="text" value={redeemBenef.bankAccount}
                            onChange={(e) => setRedeemBenef(b => ({ ...b, bankAccount: e.target.value }))}
                            placeholder="Account number"
                            className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 tabular-nums" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">IFSC</label>
                            <input type="text" value={redeemBenef.ifsc}
                              onChange={(e) => setRedeemBenef(b => ({ ...b, ifsc: e.target.value.toUpperCase() }))}
                              placeholder="IFSC code"
                              className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 uppercase" />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Bank Name</label>
                            <input type="text" value={redeemBenef.bankName}
                              onChange={(e) => setRedeemBenef(b => ({ ...b, bankName: e.target.value }))}
                              placeholder="e.g. SBI"
                              className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Note */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Note (optional)</label>
                      <input type="text" value={redeemNote}
                        onChange={(e) => setRedeemNote(e.target.value)}
                        placeholder="Any note for admin"
                        className="w-full glass-input rounded-2xl px-4 h-10 text-[13px] bg-transparent outline-none placeholder:text-white/30" />
                    </div>

                    {redeemMsg?.error && (
                      <div className="text-[12px] text-rose-300/90 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2">{redeemMsg.error}</div>
                    )}
                    {redeemMsg?.ok && (
                      <div className="text-[12px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2">{redeemMsg.ok}</div>
                    )}

                    <button
                      disabled={redeemLoading}
                      onClick={async () => {
                        const amt = Number(redeemAmt)
                        if (!amt || amt <= 0) { setRedeemMsg({ error: 'Enter a valid amount' }); return }
                        if (amt > earnedBalance) { setRedeemMsg({ error: 'Amount exceeds your balance' }); return }
                        setRedeemLoading(true); setRedeemMsg(null)
                        try {
                          await submitRedeemRequest({ amount: amt, note: redeemNote, beneficiary: redeemBenef })
                          setRedeemMsg({ ok: `✓ Request for ₹${amt} submitted. Admin will process and share payment reference.` })
                          setRedeemAmt(''); setRedeemNote('')
                          setRedeemBenef({ name: '', accountType: 'upi', upiId: '', bankAccount: '', ifsc: '', bankName: '' })
                        } catch (e) {
                          setRedeemMsg({ error: e.message || 'Failed to submit' })
                        }
                        setRedeemLoading(false)
                      }}
                      className="w-full h-11 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-[14px] font-medium text-amber-200 hover:bg-amber-500/25 transition-colors disabled:opacity-40"
                    >
                      {redeemLoading ? 'Submitting…' : 'Submit Redeem Request'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contests strip */}
      <section>
        <SectionHeader
          icon={Gift}
          title="Running contests"
          action={cs.length > 3 ? { label: 'View all', onClick: openAllContests } : null}
        />
        {cs.length === 0 ? (
          <EmptyMini text="No contests right now — check back soon." />
        ) : (
          <div className="-mx-5 px-5 overflow-x-auto snap-x snap-mandatory flex gap-3 pb-2 no-scrollbar">
            {cs.map((c, i) => (
              <ContestCard key={c.id} c={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Restaurants */}
      <section>
        <SectionHeader title="Restaurants near you" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r, i) => (
            <RestaurantCard key={r.id} r={r} index={i} onClick={() => openRestaurant(r.id)} />
          ))}
          {filtered.length === 0 && <EmptyMini text="No matches." />}
        </div>
      </section>

      {/* Winners preview */}
      <section>
        <SectionHeader
          icon={Trophy}
          title="Winner gallery"
          action={ws.length > 0 ? { label: 'See all', onClick: openAllWinners } : null}
        />
        {ws.length === 0 ? (
          <EmptyMini text="No winners yet — be the first ✨" />
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {ws.slice(0, 6).map((w, i) => (
              <WinnerTile key={w.id} w={w} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* T&C modal */}
      <AnimatePresence>
        {showTnc && (
          <>
            <motion.div
              key="tnc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTnc(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              key="tnc-sheet"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg px-4 pb-8"
            >
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-crimson-400" />
                    <h2 className="font-display text-[17px] font-semibold">ZX Wallet — Terms &amp; Conditions</h2>
                  </div>
                  <button
                    onClick={() => setShowTnc(false)}
                    className="h-8 w-8 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors grid place-items-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3 text-[13px] text-white/70 leading-relaxed">
                  <p>
                    ZX Wallet credits are <span className="text-white font-medium">discount credits</span> issued by
                    zx.money. They can only be redeemed as discounts at{' '}
                    <span className="text-crimson-300 font-medium">ZXCOM-affiliated stores and platforms</span>,
                    including <span className="text-white font-medium">zxcom.in</span>.
                  </p>
                  <p>
                    ZX Wallet credits have <span className="text-white font-medium">no monetary value</span> and
                    are <span className="text-white font-medium">not redeemable for cash</span> or any equivalent
                    under any circumstances.
                  </p>
                  <p>
                    Credits are non-transferable, cannot be withdrawn, and are subject to expiry or modification
                    at the discretion of zx.money. Usage is governed by ZXCOM's platform terms of service.
                  </p>
                  <p className="text-[11px] text-white/35 pt-1">
                    By using ZX Wallet credits you acknowledge and accept these conditions.
                  </p>
                </div>

                <button
                  onClick={() => setShowTnc(false)}
                  className="mt-5 w-full h-11 rounded-2xl bg-crimson-500/15 border border-crimson-400/40 text-[14px] font-medium text-crimson-200 hover:bg-crimson-500/25 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-crimson-400" />}
        <h2 className="font-display text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1 text-[12px] text-crimson-300 hover:text-crimson-200 transition-colors"
        >
          {action.label}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function EmptyMini({ text }) {
  return (
    <div className="glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
      {text}
    </div>
  )
}
