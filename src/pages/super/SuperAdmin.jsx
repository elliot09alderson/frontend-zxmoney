import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Search, CheckCircle2, Ban, Clock, Store, Users, Percent,
  Trophy, Plus, Trash2, ChevronDown, Image as ImageIcon,
  Wallet, Edit2, History, Zap, IndianRupee,
  Gift, CalendarRange, Upload,
} from 'lucide-react'
import { pickAndCompressImage } from '../../lib/imageUpload'
import TopBar from '../../components/TopBar'
import GlassCard from '../../components/GlassCard'
import PrimaryButton from '../../components/PrimaryButton'
import {
  listAdmins, setAdminStatus,
  listSuperRestaurants, listSuperWinners, addSuperWinner, deleteSuperWinner,
  listSuperContests, addSuperContest, deleteSuperContest,
  listSuperContestWinners, declareSuperContestWinners,
  getWalletConfig, setWalletConfig, disburseWalletCredits, listWalletTransactions, sendWalletCredit,
  listAdminRedeemReqs, resolveRedeemRequest,
} from '../../lib/store'

const STATUS = {
  active:   { label: 'Active',   icon: CheckCircle2, color: 'emerald' },
  pending:  { label: 'Pending',  icon: Clock,        color: 'amber'   },
  disabled: { label: 'Disabled', icon: Ban,          color: 'rose'    },
}

const TABS = ['Partners', 'Contests', 'Winners', 'Wallet', 'Redeem']

export default function SuperAdmin({ onSignOut }) {
  const [tab, setTab] = useState('Partners')

  return (
    <div className="space-y-5">
      <TopBar
        compactLogo="Super admin"
        onSignOut={onSignOut}
        right={<span className="chip"><Crown className="h-3 w-3" /> super</span>}
      />

      {/* Tab bar */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-9 px-4 rounded-full text-[13px] font-medium transition-colors ${
              tab === t
                ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                : 'glass-subtle text-white/60 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'Partners' && (
          <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PartnersTab />
          </motion.div>
        )}
        {tab === 'Contests' && (
          <motion.div key="contests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuperContestsTab />
          </motion.div>
        )}
        {tab === 'Winners' && (
          <motion.div key="winners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WinnersTab />
          </motion.div>
        )}
        {tab === 'Wallet' && (
          <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WalletTab />
          </motion.div>
        )}
        {tab === 'Redeem' && (
          <motion.div key="redeem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RedeemTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────── Partners tab (existing logic extracted) ─────────── */
function PartnersTab() {
  const [admins, setAdmins] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  async function refresh() { setAdmins(await listAdmins()) }
  useEffect(() => { refresh() }, [])

  async function change(phone, status) {
    await setAdminStatus(phone, status)
    refresh()
  }

  const filtered = useMemo(() => {
    let list = admins
    if (filter !== 'all') list = list.filter((a) => a.status === filter)
    if (q) {
      const t = q.toLowerCase()
      list = list.filter((a) =>
        (a.name || '').toLowerCase().includes(t) ||
        (a.restaurant?.name || '').toLowerCase().includes(t) ||
        a.phone.includes(t),
      )
    }
    return list
  }, [admins, filter, q])

  const counts = useMemo(() => ({
    all:      admins.length,
    active:   admins.filter((a) => a.status === 'active').length,
    pending:  admins.filter((a) => a.status === 'pending').length,
    disabled: admins.filter((a) => a.status === 'disabled').length,
  }), [admins])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Partners" value={counts.all}     icon={Users}        />
        <Stat label="Active"   value={counts.active}  icon={CheckCircle2} />
        <Stat label="Pending"  value={counts.pending} icon={Clock}        />
      </div>

      <GlassCard className="!p-4">
        <label className="glass-input flex items-center gap-3 rounded-2xl px-4 h-11">
          <Search className="h-[18px] w-[18px] text-white/55" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, restaurant or number"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
          />
        </label>

        <div className="mt-3 -mx-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 px-1 w-max">
            {['all', 'pending', 'active', 'disabled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-8 px-3 rounded-full text-[12px] capitalize font-medium transition-colors shrink-0 ${
                  filter === f
                    ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                    : 'glass-subtle text-white/60 hover:text-white'
                }`}
              >
                {f} {f !== 'all' && <span className="opacity-60 tabular-nums">· {counts[f]}</span>}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-[13px] text-white/45">
          No admins match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((a, i) => (
            <AdminRow key={a.phone} a={a} index={i} onChange={change} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────── Winners tab ─────────── */
function WinnersTab() {
  const [restaurants, setRestaurants] = useState([])
  const [winners, setWinners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ restaurantId: '', name: '', prize: '', photoUrl: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function refresh() {
    const [rList, wList] = await Promise.all([listSuperRestaurants(), listSuperWinners()])
    setRestaurants(rList)
    setWinners(wList)
    if (!form.restaurantId && rList.length) setForm((f) => ({ ...f, restaurantId: rList[0]._id }))
  }
  useEffect(() => { refresh() }, [])

  async function submit(e) {
    e.preventDefault()
    if (!form.restaurantId || !form.name.trim()) return
    setSaving(true)
    setErr('')
    try {
      await addSuperWinner(form)
      setForm((f) => ({ ...f, name: '', prize: '', photoUrl: '' }))
      setShowForm(false)
      await refresh()
    } catch (e2) {
      setErr(e2.message || 'Failed to add winner')
    }
    setSaving(false)
  }

  async function remove(id) {
    await deleteSuperWinner(id)
    setWinners((prev) => prev.filter((w) => w._id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-white/55">
          {winners.length} winner{winners.length !== 1 ? 's' : ''} total
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-crimson-500/15 border border-crimson-400/40 text-[13px] font-medium text-crimson-200 hover:bg-crimson-500/25 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Declare winner
        </button>
      </div>

      {/* Add-winner form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <GlassCard className="!p-5">
              <h3 className="text-[15px] font-semibold mb-4">New winner</h3>
              <form onSubmit={submit} className="space-y-3">

                {/* Restaurant selector */}
                <div className="relative">
                  <select
                    value={form.restaurantId}
                    onChange={(e) => setForm((f) => ({ ...f, restaurantId: e.target.value }))}
                    className="w-full glass-input rounded-2xl px-4 h-11 pr-9 text-[14px] bg-transparent outline-none appearance-none text-white"
                  >
                    {restaurants.map((r) => (
                      <option key={r._id} value={r._id} className="bg-ink-900 text-white">
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                </div>

                <input
                  required
                  placeholder="Winner name *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30"
                />
                <input
                  placeholder="Prize / amount (e.g. ₹500 cash)"
                  value={form.prize}
                  onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30"
                />
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-white/40 shrink-0" />
                  <input
                    placeholder="Photo URL (optional)"
                    value={form.photoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                    className="flex-1 glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30"
                  />
                </div>

                {err && <div className="text-[12px] text-rose-300/90 px-1">{err}</div>}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-10 rounded-xl border border-white/10 text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <PrimaryButton
                    type="submit"
                    loading={saving}
                    disabled={!form.restaurantId || !form.name.trim()}
                    icon={Trophy}
                    className="flex-1 !h-10 !text-[13px]"
                  >
                    Save winner
                  </PrimaryButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners list */}
      {winners.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-[13px] text-white/45">
          No winners declared yet.
        </div>
      ) : (
        <div className="space-y-2">
          {winners.map((w, i) => (
            <WinnerRow key={w._id} w={w} index={i} onDelete={() => remove(w._id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function WinnerRow({ w, index, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-2xl p-3.5 flex items-center gap-3"
    >
      <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-crimson-500/10 grid place-items-center">
        {w.photoUrl
          ? <img src={w.photoUrl} alt="" className="h-full w-full object-cover" />
          : <Trophy className="h-5 w-5 text-crimson-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-[14px] truncate">{w.name}</div>
        <div className="text-[11px] text-white/50 truncate">
          {w.restaurantName || '—'}
          {w.prize && <span className="ml-2 text-amber-300/80">{w.prize}</span>}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="h-9 w-9 rounded-xl border border-white/10 text-white/40 hover:text-rose-300 hover:border-rose-400/40 transition-colors grid place-items-center shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

/* ─────────── Super Contests tab ─────────── */

const AUDIENCE_LABELS = {
  'all-customers':     'All customers',
  'all-merchants':     'All merchants',
  'merchant-customers': 'Customers of a merchant',
}
const STATE_META = {
  upcoming:              { label: 'Upcoming',         tone: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  live:                  { label: 'Live',             tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  'pending-declaration': { label: 'Awaiting winners', tone: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  declared:              { label: 'Declared',         tone: 'bg-violet-500/15 text-violet-300 border-violet-400/30' },
}

function getContestState(c) {
  const now = Date.now()
  if (new Date(c.startsAt || 0).getTime() > now) return 'upcoming'
  if (new Date(c.endsAt).getTime() > now) return 'live'
  return c.winnersDeclared ? 'declared' : 'pending-declaration'
}

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fmtRange(startsAt, endsAt) {
  const fmt = (d) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return `${fmt(startsAt)} → ${fmt(endsAt)}`
}

function SuperContestsTab() {
  const [contests, setContests] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [showForm, setShowForm] = useState(false)
  const defaultStart = useMemo(() => toLocalInputValue(new Date()), [])
  const defaultEnd   = useMemo(() => toLocalInputValue(new Date(Date.now() + 7 * 86400_000)), [])
  const [form, setForm] = useState({
    title: '', description: '', prize: '', prizeAmount: '',
    image: '', startsAt: defaultStart, endsAt: defaultEnd,
    numWinners: 1, audience: 'all-customers', targetRestaurantId: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [pickingImage, setPickingImage] = useState(false)

  async function refresh() {
    const [c, r] = await Promise.all([listSuperContests(), listSuperRestaurants()])
    setContests(c)
    setRestaurants(r)
    if (!form.targetRestaurantId && r.length) setForm((f) => ({ ...f, targetRestaurantId: r[0]._id }))
  }
  useEffect(() => { refresh() }, [])

  async function pickImg() {
    setPickingImage(true)
    try {
      const d = await pickAndCompressImage({ maxEdge: 1280, quality: 0.82 })
      if (d) setForm((f) => ({ ...f, image: d }))
    } catch (e) { setErr(e.message || 'Image error') }
    setPickingImage(false)
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.title) { setErr('Title required'); return }
    setSaving(true); setErr('')
    try {
      await addSuperContest({
        ...form,
        prizeAmount: Number(form.prizeAmount) || 0,
        numWinners: Number(form.numWinners) || 1,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        targetRestaurantId: form.audience === 'merchant-customers' ? form.targetRestaurantId : undefined,
      })
      setShowForm(false)
      setForm((f) => ({ ...f, title: '', description: '', prize: '', prizeAmount: '', image: '' }))
      await refresh()
    } catch (e2) { setErr(e2.message || 'Failed') }
    setSaving(false)
  }

  async function remove(id) {
    if (!confirm('Delete this contest and all its declared winners?')) return
    await deleteSuperContest(id)
    setContests((prev) => prev.filter((c) => c._id !== id && c.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-white/55">{contests.length} contest{contests.length !== 1 ? 's' : ''}</div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-crimson-500/15 border border-crimson-400/40 text-[13px] font-medium text-crimson-200 hover:bg-crimson-500/25 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New contest
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GlassCard className="!p-5">
              <h3 className="text-[15px] font-semibold mb-4">Create contest</h3>
              <form onSubmit={submit} className="space-y-3">
                {/* Audience */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">Audience</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(AUDIENCE_LABELS).map(([v, label]) => (
                      <button
                        key={v} type="button"
                        onClick={() => setForm((f) => ({ ...f, audience: v }))}
                        className={`h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
                          form.audience === v
                            ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                            : 'glass-subtle text-white/60 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target restaurant (merchant-customers only) */}
                {form.audience === 'merchant-customers' && (
                  <div className="relative">
                    <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">Target merchant</div>
                    <select
                      value={form.targetRestaurantId}
                      onChange={(e) => setForm((f) => ({ ...f, targetRestaurantId: e.target.value }))}
                      className="w-full glass-input rounded-2xl px-4 h-11 pr-9 text-[14px] bg-transparent outline-none appearance-none text-white"
                    >
                      {restaurants.map((r) => (
                        <option key={r._id} value={r._id} className="bg-ink-900 text-white">{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 bottom-3 h-4 w-4 text-white/40 pointer-events-none" />
                  </div>
                )}

                <input required placeholder="Contest title *" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />

                <input placeholder="Description" value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">Total prize pool (₹)</div>
                    <input type="number" min="0" placeholder="0" value={form.prizeAmount}
                      onChange={(e) => setForm((f) => ({ ...f, prizeAmount: e.target.value }))}
                      className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 [color-scheme:dark]" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">Winners count</div>
                    <input type="number" min="1" max="50" value={form.numWinners}
                      onChange={(e) => setForm((f) => ({ ...f, numWinners: e.target.value }))}
                      className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none [color-scheme:dark]" />
                  </div>
                </div>

                {/* Prize per winner preview */}
                {Number(form.prizeAmount) > 0 && Number(form.numWinners) > 0 && (
                  <div className="text-[12px] text-amber-300/80 px-1">
                    ₹{Math.floor(Number(form.prizeAmount) / Number(form.numWinners))} per winner
                  </div>
                )}

                <input placeholder="Prize label (optional, e.g. 'Free dinner + ₹500')" value={form.prize}
                  onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />

                {/* Image */}
                <div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">Contest image</div>
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 grid place-items-center bg-crimson-500/10">
                      {form.image ? <img src={form.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-crimson-400" />}
                    </div>
                    <input placeholder="Paste image URL or upload" value={form.image.startsWith('data:') ? '' : form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      className="flex-1 glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30" />
                    <button type="button" onClick={pickImg} disabled={pickingImage}
                      className="h-11 px-3 glass-subtle rounded-2xl text-[12px] flex items-center gap-1.5 disabled:opacity-60">
                      <Upload className="h-4 w-4" /><span className="hidden sm:inline">{pickingImage ? '…' : 'Upload'}</span>
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  {[['Starts at', 'startsAt'], ['Ends at', 'endsAt']].map(([label, key]) => (
                    <div key={key}>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-white/45 mb-1.5 pl-1">{label}</div>
                      <label className="glass-input flex items-center rounded-2xl px-3 h-11">
                        <input type="datetime-local" value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="flex-1 bg-transparent outline-none text-[13px] text-white/90 [color-scheme:dark]" />
                      </label>
                    </div>
                  ))}
                </div>

                {err && <div className="text-[12px] text-rose-300/90">{err}</div>}

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 h-10 rounded-xl border border-white/10 text-[13px] text-white/60 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <PrimaryButton type="submit" loading={saving} icon={Gift} className="flex-1 !h-10 !text-[13px]">
                    Publish
                  </PrimaryButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {contests.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-[13px] text-white/45">No contests yet.</div>
      ) : (
        <div className="space-y-3">
          {contests.map((c, i) => (
            <SuperContestRow key={c._id || c.id} contest={c} index={i} restaurants={restaurants} onDelete={() => remove(c._id || c.id)} onRefresh={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}

function SuperContestRow({ contest: c, index, onDelete, onRefresh }) {
  const state = getContestState(c)
  const meta = STATE_META[state]
  const [open, setOpen] = useState(false)
  const [winners, setWinners] = useState(null)

  useEffect(() => {
    if (!open) return
    if (state === 'declared') {
      listSuperContestWinners(c._id || c.id).then(setWinners).catch(() => setWinners([]))
    }
  }, [open, state, c._id, c.id])

  const perWinner = c.prizeAmount > 0 && c.numWinners > 0 ? Math.floor(c.prizeAmount / c.numWinners) : 0
  const canDeclare = state === 'pending-declaration'
  const canView = state === 'declared'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="flex">
        <div className="w-20 h-20 shrink-0 overflow-hidden bg-ink-900">
          {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-medium text-[13px] truncate">{c.title}</div>
              <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${meta.tone}`}>{meta.label}</span>
            </div>
            <div className="text-[11px] text-white/50 mt-0.5">
              {AUDIENCE_LABELS[c.audience] || c.audience}
              {c.targetRestaurantName && <span className="text-white/70"> · {c.targetRestaurantName}</span>}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">
              {c.numWinners} winner{c.numWinners !== 1 ? 's' : ''}
              {perWinner > 0 && <span className="text-amber-300/80 ml-1.5">· ₹{perWinner} each</span>}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="text-[10px] text-white/35 inline-flex items-center gap-1 min-w-0">
              <CalendarRange className="h-3 w-3 shrink-0" />
              <span className="truncate">{fmtRange(c.startsAt || c.createdAt, c.endsAt)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(canDeclare || canView) && (
                <button onClick={() => setOpen((x) => !x)}
                  className="btn-ghost inline-flex items-center gap-1 rounded-full h-7 px-2 text-[11px]">
                  {canDeclare ? 'Declare' : 'Winners'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button onClick={onDelete}
                className="text-rose-300/80 hover:text-rose-200 h-7 w-7 grid place-items-center rounded-full hover:bg-rose-500/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && canDeclare && (
        <SuperDeclareForm contest={c} onDone={onRefresh} />
      )}
      {open && canView && (
        <div className="border-t border-white/5 p-3">
          {winners == null ? (
            <div className="text-[12px] text-white/45 text-center py-2">Loading…</div>
          ) : winners.length === 0 ? (
            <div className="text-[12px] text-white/45 text-center py-2">No winners recorded.</div>
          ) : (
            <div className="space-y-2">
              {winners.map((w) => (
                <div key={w._id || w.id} className="flex items-center gap-3 glass rounded-xl p-2">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-crimson-500/10">
                    {w.photoUrl && <img src={w.photoUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{w.name}</div>
                    <div className="text-[11px] text-white/50">
                      {w.winnerPhone && <span className="tabular-nums mr-2">{w.winnerPhone}</span>}
                      {w.prize && <span className="text-amber-300/80">{w.prize}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function SuperDeclareForm({ contest: c, onDone }) {
  const n = Math.max(1, Number(c.numWinners) || 1)
  const perWinner = c.prizeAmount > 0 ? Math.floor(c.prizeAmount / n) : 0
  const [drafts, setDrafts] = useState(
    () => Array.from({ length: n }, () => ({ name: '', phone: '', prize: '', photoUrl: '' })),
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pickingIdx, setPickingIdx] = useState(-1)

  function update(i, patch) {
    setDrafts((arr) => arr.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  async function pickPhoto(i) {
    setPickingIdx(i)
    try {
      const dataUrl = await pickAndCompressImage({ maxEdge: 768, quality: 0.85 })
      if (dataUrl) update(i, { photoUrl: dataUrl })
    } catch (e) { setErr(e.message || 'Image error') }
    setPickingIdx(-1)
  }

  async function publish() {
    setErr('')
    const valid = drafts.filter((d) => d.name.trim())
    if (valid.length === 0) { setErr('Add at least one winner name'); return }
    setBusy(true)
    try {
      await declareSuperContestWinners(c._id || c.id, valid.map((d) => ({
        name: d.name.trim(),
        phone: d.phone.trim(),
        prize: d.prize.trim() || (perWinner ? `₹${perWinner}` : c.prize),
        photoUrl: d.photoUrl,
      })))
      onDone()
    } catch (e2) { setErr(e2.message || 'Failed') }
    setBusy(false)
  }

  return (
    <div className="border-t border-white/5 p-3 space-y-3">
      {perWinner > 0 && (
        <div className="text-[12px] text-amber-300/80 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2">
          ₹{perWinner} will be credited to each winner's ZX wallet (if phone is provided and they have an account).
        </div>
      )}
      <div className="space-y-2">
        {drafts.map((d, i) => (
          <div key={i} className="glass rounded-xl p-2 space-y-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => pickPhoto(i)} disabled={pickingIdx === i}
                className="h-12 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 grid place-items-center bg-crimson-500/10 hover:bg-crimson-500/20 disabled:opacity-60">
                {d.photoUrl ? <img src={d.photoUrl} alt="" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-white/60" />}
              </button>
              <input value={d.name} onChange={(e) => update(i, { name: e.target.value })}
                placeholder={`Winner ${i + 1} name *`}
                className="flex-1 glass-input rounded-lg h-10 px-3 text-[13px] bg-transparent outline-none placeholder:text-white/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={d.phone} onChange={(e) => update(i, { phone: e.target.value })}
                placeholder="Phone (for wallet credit)"
                className="glass-input rounded-lg h-9 px-3 text-[13px] bg-transparent outline-none placeholder:text-white/30 tabular-nums" />
              <input value={d.prize} onChange={(e) => update(i, { prize: e.target.value })}
                placeholder={perWinner ? `₹${perWinner} (auto)` : 'Prize label'}
                className="glass-input rounded-lg h-9 px-3 text-[13px] bg-transparent outline-none placeholder:text-white/30" />
            </div>
          </div>
        ))}
      </div>
      {err && <div className="text-[12px] text-rose-300">{err}</div>}
      <PrimaryButton onClick={publish} loading={busy} icon={Trophy}>Declare winners</PrimaryButton>
    </div>
  )
}

/* ─────────── Wallet tab ─────────── */
function WalletTab() {
  const [cfg, setCfg] = useState(null)
  const [txs, setTxs] = useState([])
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [disbursing, setDisbursing] = useState(false)
  const [disburseMsg, setDisburseMsg] = useState('')
  const [err, setErr] = useState('')
  const [activeSection, setActiveSection] = useState('send') // 'send' | 'config' | 'history'

  // Send credit state
  const [sendPhone, setSendPhone] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendNote, setSendNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null) // { ok, error }

  async function refresh() {
    const [c, t] = await Promise.all([getWalletConfig(), listWalletTransactions()])
    setCfg(c)
    setTxs(t)
  }
  useEffect(() => { refresh() }, [])

  async function save(e) {
    e.preventDefault()
    const val = Number(amount)
    if (isNaN(val) || val < 0) { setErr('Enter a valid amount'); return }
    setSaving(true); setErr('')
    try {
      const updated = await setWalletConfig({ monthlyCredit: val, note })
      setCfg(updated)
      setEditing(false)
      setNote('')
    } catch (e2) { setErr(e2.message || 'Failed') }
    setSaving(false)
  }

  async function disburse() {
    setDisbursing(true); setDisburseMsg('')
    try {
      const res = await disburseWalletCredits()
      if (res.skipped) setDisburseMsg(`Skipped: ${res.reason}`)
      else setDisburseMsg(`✓ Credited ₹${res.amount} to ${res.credited} customers (${res.month})`)
      await refresh()
    } catch (e2) { setDisburseMsg(e2.message || 'Failed') }
    setDisbursing(false)
  }

  // Group transactions by note (disbursement batch)
  const batchGroups = useMemo(() => {
    const map = {}
    txs.forEach((t) => {
      const key = t.note || t.at
      if (!map[key]) map[key] = { note: t.note, at: t.at, amount: t.amount, count: 0, total: 0 }
      map[key].count++
      map[key].total += t.amount
    })
    return Object.values(map).sort((a, b) => new Date(b.at) - new Date(a.at))
  }, [txs])

  async function handleSend(e) {
    e.preventDefault()
    const amt = Number(sendAmount)
    if (!/^\d{10}$/.test(sendPhone.replace(/\D/g, '').slice(-10))) {
      setSendResult({ error: 'Enter a valid 10-digit phone number' }); return
    }
    if (isNaN(amt) || amt <= 0) {
      setSendResult({ error: 'Amount must be greater than 0' }); return
    }
    setSending(true); setSendResult(null)
    try {
      const res = await sendWalletCredit({
        phone: sendPhone.replace(/\D/g, '').slice(-10),
        amount: amt,
        note: sendNote || undefined,
      })
      setSendResult({ ok: true, msg: `✓ ₹${amt} credited to +91 ${sendPhone.replace(/\D/g, '').slice(-10)}. New balance: ₹${res.newBalance}` })
      setSendPhone(''); setSendAmount(''); setSendNote('')
      await refresh()
    } catch (e2) {
      setSendResult({ error: e2.message || 'Failed to send credit' })
    }
    setSending(false)
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex gap-2">
        {[
          { id: 'send',    label: 'Send Credit' },
          { id: 'config',  label: 'Monthly Settings' },
          { id: 'history', label: 'History' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                : 'glass-subtle text-white/60 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'send' && (
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            <span className="text-[13px] font-semibold">Credit Earned Wallet</span>
          </div>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Customer Phone</label>
              <input
                type="tel"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 tabular-nums"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="e.g. 100"
                className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 tabular-nums"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Note (optional)</label>
              <input
                type="text"
                value={sendNote}
                onChange={(e) => setSendNote(e.target.value)}
                placeholder="e.g. gift voucher, contest prize…"
                className="w-full glass-input rounded-2xl px-4 h-10 text-[13px] bg-transparent outline-none placeholder:text-white/30"
              />
            </div>
            {sendResult?.error && (
              <div className="text-[12px] text-rose-300/90 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2">
                {sendResult.error}
              </div>
            )}
            {sendResult?.ok && (
              <div className="text-[12px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                {sendResult.msg}
              </div>
            )}
            <PrimaryButton type="submit" loading={sending} className="w-full !h-11">
              Credit Earned Balance
            </PrimaryButton>
          </form>
        </GlassCard>
      )}

      {activeSection === 'config' && (
        <div className="space-y-4">
          {/* Current config card */}
          <GlassCard className="!p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-crimson-400" />
                <span className="text-[13px] font-semibold">Monthly wallet credit</span>
              </div>
              {!editing && (
                <button
                  onClick={() => { setEditing(true); setAmount(String(cfg?.monthlyCredit ?? 0)) }}
                  className="h-8 w-8 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors grid place-items-center"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {!editing ? (
              <div>
                <div className="mt-2 flex items-end gap-1">
                  <IndianRupee className="h-6 w-6 text-amber-300 mb-0.5" />
                  <span className="font-display text-[36px] font-bold tabular-nums leading-none">
                    {cfg?.monthlyCredit ?? 0}
                  </span>
                  <span className="text-[13px] text-white/50 mb-1 ml-1">/ month / customer</span>
                </div>
                {cfg?.lastCreditedMonth && (
                  <div className="mt-2 text-[12px] text-white/45">
                    Last disbursed: <span className="text-white/70">{cfg.lastCreditedMonth}</span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={save} className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-white/60">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Monthly amount per customer"
                    className="flex-1 glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30"
                  />
                </div>
                <input
                  placeholder="Note (optional, e.g. 'May launch promo')"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full glass-input rounded-2xl px-4 h-10 text-[13px] bg-transparent outline-none placeholder:text-white/30"
                />
                {err && <div className="text-[12px] text-rose-300/90">{err}</div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 h-10 rounded-xl border border-white/10 text-[13px] text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <PrimaryButton type="submit" loading={saving} className="flex-1 !h-10 !text-[13px]">
                    Save
                  </PrimaryButton>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Manual disburse */}
          <GlassCard className="!p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-[13px] font-semibold">Manual disburse</span>
                </div>
                <p className="mt-1 text-[12px] text-white/50">
                  Trigger this month's credit now. Safe to run — skips if already done this month.
                </p>
              </div>
              <button
                onClick={disburse}
                disabled={disbursing}
                className="shrink-0 ml-4 h-9 px-4 rounded-xl bg-amber-500/15 border border-amber-400/40 text-[13px] font-medium text-amber-200 hover:bg-amber-500/25 transition-colors disabled:opacity-40"
              >
                {disbursing ? 'Running…' : 'Run now'}
              </button>
            </div>
            {disburseMsg && (
              <div className="mt-3 text-[12px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                {disburseMsg}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {activeSection === 'history' && (
        <div className="space-y-3">
          {/* Config change history */}
          {cfg?.configHistory?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History className="h-3.5 w-3.5 text-white/50" />
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">Config changes</span>
              </div>
              <div className="space-y-1.5">
                {[...cfg.configHistory].reverse().map((h, i) => (
                  <div key={i} className="glass rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[14px]">₹{h.amount}/mo</span>
                      {h.note && <span className="ml-2 text-[12px] text-white/50">{h.note}</span>}
                    </div>
                    <div className="text-[11px] text-white/40 text-right">
                      <div>{new Date(h.changedAt).toLocaleDateString('en-IN')}</div>
                      <div className="tabular-nums">{h.changedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disbursement batches */}
          <div>
            <div className="flex items-center gap-2 mb-2 mt-4">
              <Wallet className="h-3.5 w-3.5 text-white/50" />
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/45">Disbursement batches</span>
            </div>
            {batchGroups.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center text-[13px] text-white/45">
                No disbursements yet.
              </div>
            ) : (
              <div className="space-y-1.5">
                {batchGroups.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="glass rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[13px] font-medium">₹{b.amount} × {b.count} customers</div>
                      <div className="text-[11px] text-white/45 mt-0.5">{b.note || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold text-emerald-300">₹{b.total.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-white/40">
                        {new Date(b.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────── Redeem Requests tab ─────────── */
function RedeemTab() {
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const data = await listAdminRedeemReqs(statusFilter === 'all' ? '' : statusFilter)
      setRequests(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }
  useEffect(() => { refresh() }, [statusFilter])

  const counts = {
    pending: requests.filter((r) => r.status === 'pending').length,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-white/55">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
          {statusFilter === 'pending' && requests.length > 0 && (
            <span className="ml-2 text-amber-300">· action needed</span>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-8 px-3 rounded-full glass-subtle text-[12px] text-white/60 hover:text-white transition-colors disabled:opacity-40"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {['pending', 'paid', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`h-8 px-3 rounded-full text-[12px] capitalize font-medium transition-colors ${
              statusFilter === f
                ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                : 'glass-subtle text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-[13px] text-white/45">
          {loading ? 'Loading…' : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}requests.`}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req, i) => (
            <RedeemRequestRow key={req._id} req={req} index={i} onResolved={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}

function RedeemRequestRow({ req, index, onResolved }) {
  const [open, setOpen] = useState(false)
  const [refId, setRefId] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [resolving, setResolving] = useState(false)
  const [err, setErr] = useState('')

  const isPending = req.status === 'pending'
  const b = req.beneficiary || {}

  const statusStyle = {
    pending:  'bg-amber-500/15 text-amber-300 border-amber-400/30',
    paid:     'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  }[req.status] || ''

  async function resolve(status) {
    if (status === 'paid' && !refId.trim()) { setErr('Reference ID is required when marking as paid'); return }
    setResolving(true); setErr('')
    try {
      await resolveRedeemRequest(req._id, { status, referenceId: refId, adminNote })
      setOpen(false)
      onResolved()
    } catch (e) {
      setErr(e.message || 'Failed')
    }
    setResolving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[16px] text-white tabular-nums">₹{req.amount.toLocaleString('en-IN')}</span>
            <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusStyle}`}>
              {req.status}
            </span>
          </div>
          <div className="text-[12px] text-white/60 mt-0.5 tabular-nums">+91 {req.phone}</div>
          <div className="text-[11px] text-white/40 mt-0.5">
            {new Date(req.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
          {req.note && <div className="text-[12px] text-white/50 italic mt-1">"{req.note}"</div>}

          {/* Beneficiary summary */}
          <div className="mt-2 p-2.5 bg-white/5 rounded-xl text-[12px] space-y-1">
            <div className="text-white/70 font-medium">{b.name || '—'}</div>
            {b.accountType === 'upi' ? (
              <div className="text-white/50">UPI: <span className="text-white/80 tabular-nums">{b.upiId || '—'}</span></div>
            ) : (
              <>
                <div className="text-white/50">A/C: <span className="text-white/80 tabular-nums">{b.bankAccount || '—'}</span></div>
                <div className="text-white/50">IFSC: <span className="text-white/80 tabular-nums">{b.ifsc || '—'}</span>
                  {b.bankName && <span className="ml-2 text-white/45">({b.bankName})</span>}
                </div>
              </>
            )}
          </div>

          {/* Resolved info */}
          {!isPending && (
            <div className="mt-2 text-[11px] space-y-0.5">
              {req.referenceId && (
                <div className="text-emerald-300/90">Ref: <span className="font-mono tabular-nums">{req.referenceId}</span></div>
              )}
              {req.adminNote && <div className="text-white/50 italic">{req.adminNote}</div>}
              {req.resolvedAt && (
                <div className="text-white/35">{new Date(req.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              )}
            </div>
          )}
        </div>

        {isPending && (
          <button
            onClick={() => setOpen((v) => !v)}
            className={`shrink-0 h-9 px-3 rounded-xl text-[12px] font-medium transition-colors border ${
              open
                ? 'bg-white/10 border-white/20 text-white'
                : 'border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
            }`}
          >
            {open ? 'Close' : 'Resolve'}
          </button>
        )}
      </div>

      {/* Resolve form */}
      <AnimatePresence>
        {open && isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 p-4 space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Reference ID *</label>
                <input
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="UTR, transaction ID, etc."
                  className="w-full glass-input rounded-2xl px-4 h-11 text-[14px] bg-transparent outline-none placeholder:text-white/30 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/50 mb-1.5">Admin Note (optional)</label>
                <input
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. paid via NEFT, rejected reason…"
                  className="w-full glass-input rounded-2xl px-4 h-10 text-[13px] bg-transparent outline-none placeholder:text-white/30"
                />
              </div>
              {err && (
                <div className="text-[12px] text-rose-300/90 bg-rose-500/10 border border-rose-400/20 rounded-xl px-3 py-2">{err}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => resolve('rejected')}
                  disabled={resolving}
                  className="flex-1 h-10 rounded-xl border border-rose-400/40 bg-rose-500/10 text-[13px] font-medium text-rose-200 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
                >
                  Reject & Refund
                </button>
                <button
                  onClick={() => resolve('paid')}
                  disabled={resolving}
                  className="flex-1 h-10 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-[13px] font-medium text-emerald-200 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                >
                  {resolving ? 'Saving…' : 'Mark Paid'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────── Shared sub-components ─────────── */
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</span>
        <Icon className="h-3.5 w-3.5 text-crimson-400" />
      </div>
      <div className="mt-1 font-display text-[22px] font-bold tabular-nums">{value}</div>
    </div>
  )
}

function AdminRow({ a, index, onChange }) {
  const meta = STATUS[a.status] || STATUS.pending
  const Icon = meta.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-crimson-500/10 grid place-items-center">
          {a.profilePhotoUrl
            ? <img src={a.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            : <Store className="h-5 w-5 text-crimson-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-medium truncate">{a.restaurant?.name || a.name}</div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full
              ${a.status === 'active'   ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30' : ''}
              ${a.status === 'pending'  ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'     : ''}
              ${a.status === 'disabled' ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30'         : ''}
            `}>
              <Icon className="h-2.5 w-2.5" /> {meta.label}
            </span>
          </div>
          <div className="text-[12px] text-white/55 truncate mt-0.5">{a.name}</div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-white/45">
            <span className="tabular-nums">+91 {a.phone}</span>
            {a.restaurant && (
              <span className="inline-flex items-center gap-1">
                <Percent className="h-3 w-3" /> {a.restaurant.discountPct}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatusBtn active={a.status === 'active'}   onClick={() => onChange(a.phone, 'active')}   label="Activate" icon={CheckCircle2} tone="emerald" />
        <StatusBtn active={a.status === 'disabled'} onClick={() => onChange(a.phone, 'disabled')} label="Disable"  icon={Ban}          tone="rose"    />
      </div>
    </motion.div>
  )
}

function StatusBtn({ active, onClick, label, icon: Icon, tone }) {
  const toneMap = {
    emerald: active ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200' : 'border-white/10 text-white/55 hover:text-white',
    amber:   active ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'       : 'border-white/10 text-white/55 hover:text-white',
    rose:    active ? 'bg-rose-500/15 border-rose-400/50 text-rose-200'           : 'border-white/10 text-white/55 hover:text-white',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border text-[12px] font-medium transition-colors ${toneMap[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  )
}
