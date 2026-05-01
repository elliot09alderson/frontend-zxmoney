import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Image as ImageIcon, Percent, Gift, Trophy, Settings,
  Plus, X, Pencil, Save, Trash2, Store, Users, BadgeCheck, Clock, Ban, Upload,
  CalendarRange, ChevronDown,
} from 'lucide-react'
import TopBar from '../../components/TopBar'
import PrimaryButton from '../../components/PrimaryButton'
import GlassCard from '../../components/GlassCard'
import {
  getMyRestaurant, updateMyRestaurant,
  addContest, deleteContest,
  addWinner, deleteWinner,
  listContestWinners, declareContestWinners,
} from '../../lib/store'
import { api } from '../../lib/api'
import { pickAndCompressImage } from '../../lib/imageUpload'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: Store },
  { id: 'carousel', label: 'Photos', icon: ImageIcon },
  { id: 'discount', label: 'Discount', icon: Percent },
  { id: 'contests', label: 'Contests', icon: Gift },
  { id: 'winners', label: 'Winners', icon: Trophy },
]

export default function AdminDashboard({ phone, session, onSignOut }) {
  const [restaurant, setRestaurant] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const r = await getMyRestaurant()
      setRestaurant(r)
    } catch (e) {
      setRestaurant(null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [phone])

  // Synthesize the legacy "admin" shape the sub-views expect.
  const admin = restaurant ? {
    phone,
    name: session?.name || restaurant.name,
    status: restaurant.status,
    profilePhotoUrl: restaurant.profilePhotoUrl,
  } : null

  if (loading) {
    return (
      <div className="space-y-4">
        <TopBar onSignOut={onSignOut} />
        <div className="glass rounded-3xl p-8 text-center text-white/50">Loading dashboard…</div>
      </div>
    )
  }

  if (!admin || !restaurant) {
    return (
      <div className="space-y-4">
        <TopBar onSignOut={onSignOut} />
        <div className="glass rounded-3xl p-8 text-center text-white/60">
          Partner profile not found. Contact support.
        </div>
      </div>
    )
  }

  if (admin.status !== 'active') {
    return <PendingState admin={admin} restaurant={restaurant} onSignOut={onSignOut} />
  }

  return (
    <div className="space-y-5">
      <TopBar
        compactLogo={restaurant.name}
        onSignOut={onSignOut}
        right={<span className="chip"><BadgeCheck className="h-3 w-3" /> active</span>}
      />

      <TabBar tab={tab} setTab={setTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'overview' && <Overview restaurant={restaurant} admin={admin} />}
          {tab === 'profile' && <ProfileTab restaurant={restaurant} onChange={refresh} />}
          {tab === 'carousel' && <CarouselTab restaurant={restaurant} onChange={refresh} />}
          {tab === 'discount' && <DiscountTab restaurant={restaurant} onChange={refresh} />}
          {tab === 'contests' && <ContestsTab restaurant={restaurant} />}
          {tab === 'winners' && <WinnersTab restaurant={restaurant} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PendingState({ admin, restaurant, onSignOut }) {
  return (
    <div className="space-y-5">
      <TopBar onSignOut={onSignOut} />
      <GlassCard>
        <div className="flex flex-col items-center text-center py-5">
          <div className="h-14 w-14 rounded-2xl grid place-items-center"
            style={{
              background: admin.status === 'disabled'
                ? 'radial-gradient(circle, #555, #222)'
                : 'radial-gradient(circle at 30% 25%, #ff5b6c, #e50d2a 55%, #4c0210 100%)',
              boxShadow: '0 10px 30px -8px rgba(229,13,42,0.5)',
            }}
          >
            {admin.status === 'disabled'
              ? <Ban className="h-7 w-7 text-white" />
              : <Clock className="h-7 w-7 text-white" />}
          </div>
          <h1 className="mt-5 font-display text-[22px] font-bold">
            {admin.status === 'disabled' ? 'Account disabled' : 'Waiting for approval'}
          </h1>
          <p className="mt-2 text-sm text-white/55 max-w-xs">
            {admin.status === 'disabled'
              ? 'Your account has been deactivated by super admin. Reach out to support to re-enable.'
              : `Super admin is reviewing ${restaurant.name}. You'll get full dashboard access once approved.`}
          </p>
        </div>
      </GlassCard>
    </div>
  )
}

function TabBar({ tab, setTab }) {
  return (
    <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 w-max">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full h-9 px-3.5 text-[12.5px] font-medium transition-all shrink-0 ${
                active
                  ? 'bg-crimson-500/15 border border-crimson-400/50 text-white shadow-glow-sm'
                  : 'glass-subtle hover:border-white/20 text-white/70 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Overview({ restaurant, admin }) {
  return (
    <div className="space-y-4">
      <GlassCard className="!p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 border border-white/10">
            {restaurant.profilePhotoUrl
              ? <img src={restaurant.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              : <div className="h-full w-full grid place-items-center bg-crimson-500/20"><Store className="h-5 w-5" /></div>}
          </div>
          <div className="min-w-0">
            <div className="font-display text-[20px] font-bold truncate">{restaurant.name}</div>
            <div className="text-[12px] text-white/55 truncate">{restaurant.cuisine} · {restaurant.priceRange}</div>
            <div className="mt-1 text-[11px] text-white/45">UPI: <span className="text-white/70">{restaurant.vpa}</span></div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Active discount" value={`${restaurant.discountPct}%`} icon={Percent} />
        <KpiCard label="Carousel" value={`${restaurant.carousel?.length || 0} photos`} icon={ImageIcon} />
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</div>
        <Icon className="h-4 w-4 text-crimson-400" />
      </div>
      <div className="mt-2 font-display text-[22px] font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function ProfileTab({ restaurant, onChange }) {
  const [form, setForm] = useState({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    priceRange: restaurant.priceRange,
    vpa: restaurant.vpa,
    profilePhotoUrl: restaurant.profilePhotoUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(false)

  async function save() {
    setSaving(true)
    await updateMyRestaurant(form)
    setSaving(false)
    onChange()
  }

  async function pickFromGallery() {
    setPicking(true)
    try {
      const dataUrl = await pickAndCompressImage({ maxEdge: 768, quality: 0.85 })
      if (dataUrl) setForm((f) => ({ ...f, profilePhotoUrl: dataUrl }))
    } catch (e) {
      alert(e.message || 'Could not load image')
    } finally {
      setPicking(false)
    }
  }

  return (
    <GlassCard className="!p-5">
      <div className="font-display text-[17px] font-semibold mb-4">Business profile</div>
      <div className="space-y-3">
        <InputRow label="Restaurant name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <InputRow label="Cuisine" value={form.cuisine} onChange={(v) => setForm({ ...form, cuisine: v })} />
        <InputRow label="Price range" value={form.priceRange} onChange={(v) => setForm({ ...form, priceRange: v })} />
        <InputRow label="UPI VPA" value={form.vpa} onChange={(v) => setForm({ ...form, vpa: v })} />

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5 pl-1">
            Profile photo
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 grid place-items-center bg-crimson-500/10">
              {form.profilePhotoUrl
                ? <img src={form.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                : <Store className="h-5 w-5 text-crimson-400" />}
            </div>
            <label className="glass-input flex items-center rounded-2xl px-4 h-12 flex-1">
              <input
                value={form.profilePhotoUrl.startsWith('data:') ? '' : form.profilePhotoUrl}
                onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })}
                placeholder={form.profilePhotoUrl.startsWith('data:') ? 'Uploaded from gallery' : 'Paste image URL'}
                className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
              />
            </label>
            <button
              type="button"
              onClick={pickFromGallery}
              disabled={picking}
              className="btn-ghost h-12 px-3 rounded-2xl inline-flex items-center gap-1.5 text-[12px] shrink-0 disabled:opacity-60"
              aria-label="Upload from gallery"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{picking ? 'Loading…' : 'Gallery'}</span>
            </button>
          </div>
        </div>
      </div>
      <PrimaryButton onClick={save} loading={saving} icon={Save} className="!mt-5">
        Save profile
      </PrimaryButton>
    </GlassCard>
  )
}

function CarouselTab({ restaurant, onChange }) {
  const [urls, setUrls] = useState(restaurant.carousel || [])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(false)

  function add() {
    const v = input.trim()
    if (!v) return
    setUrls((u) => [...u, v])
    setInput('')
  }

  async function uploadFromGallery() {
    setPicking(true)
    try {
      const dataUrl = await pickAndCompressImage({ maxEdge: 1280, quality: 0.82 })
      if (dataUrl) setUrls((u) => [...u, dataUrl])
    } catch (e) {
      alert(e.message || 'Could not load image')
    } finally {
      setPicking(false)
    }
  }

  async function save() {
    setSaving(true)
    await updateMyRestaurant({ carousel: urls })
    setSaving(false)
    onChange()
  }

  return (
    <GlassCard className="!p-5">
      <div className="font-display text-[17px] font-semibold mb-3">Carousel photos</div>
      <p className="text-[12px] text-white/55 mb-4">
        These show on your restaurant detail page. First image is the cover.
      </p>
      <div className="flex items-center gap-2">
        <label className="glass-input flex items-center gap-3 rounded-2xl px-4 h-12 flex-1">
          <ImageIcon className="h-[18px] w-[18px] text-crimson-400" strokeWidth={2.2} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="https://image-url..."
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
          />
        </label>
        <button onClick={add} className="btn-ghost h-12 w-12 rounded-2xl grid place-items-center shrink-0" aria-label="Add URL">
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={uploadFromGallery}
          disabled={picking}
          className="btn-ghost h-12 px-3 rounded-2xl inline-flex items-center gap-1.5 text-[12px] shrink-0 disabled:opacity-60"
          aria-label="Upload from gallery"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{picking ? 'Loading…' : 'Gallery'}</span>
        </button>
      </div>

      {urls.length === 0 ? (
        <div className="mt-4 glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
          No photos yet.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden glass-subtle">
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setUrls((arr) => arr.filter((_, idx) => idx !== i))}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-ink-950/80 backdrop-blur grid place-items-center"
              >
                <X className="h-3 w-3" />
              </button>
              {i === 0 && (
                <div className="absolute bottom-1.5 left-1.5 chip !px-2 !py-0.5 !text-[10px]">
                  cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PrimaryButton onClick={save} loading={saving} icon={Save} className="!mt-5">
        Save photos
      </PrimaryButton>
    </GlassCard>
  )
}

function DiscountTab({ restaurant, onChange }) {
  const [pct, setPct] = useState(restaurant.discountPct)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await updateMyRestaurant({ discountPct: Number(pct) })
    setSaving(false)
    onChange()
  }

  const demoBill = 1000
  const save100 = Math.round((demoBill * pct) / 100)

  return (
    <GlassCard className="!p-5">
      <div className="font-display text-[17px] font-semibold mb-1">zx coupon discount</div>
      <p className="text-[12px] text-white/55 mb-5">
        Every customer who pays via zx.money at your restaurant gets this discount.
      </p>

      <div className="glass-subtle rounded-2xl p-5 text-center">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">discount</div>
        <div className="mt-1 font-display text-[54px] font-bold leading-none text-crimson-400 tabular-nums">
          {pct}<span className="text-[28px]">%</span>
        </div>
      </div>

      <input
        type="range"
        min="0" max="60"
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="w-full mt-5 accent-crimson-500"
      />

      <div className="mt-4 glass-subtle rounded-2xl p-4 text-[13px] text-white/65">
        On a ₹{demoBill} bill, customer saves
        {' '}<span className="text-white font-semibold">₹{save100.toLocaleString()}</span>.
      </div>

      <PrimaryButton onClick={save} loading={saving} icon={Save} className="!mt-5">
        Save discount
      </PrimaryButton>
    </GlassCard>
  )
}

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STATE_META = {
  upcoming:             { label: 'Upcoming',          tone: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  live:                 { label: 'Live',              tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  'pending-declaration':{ label: 'Awaiting winners',  tone: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  declared:             { label: 'Winners declared',  tone: 'bg-violet-500/15 text-violet-300 border-violet-400/30' },
}

function fmtRange(startsAt, endsAt) {
  const fmt = (d) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  return `${fmt(startsAt)} → ${fmt(endsAt)}`
}

function ContestsTab({ restaurant }) {
  const [list, setList] = useState([])
  const [adding, setAdding] = useState(false)
  const defaultStart = useMemo(() => toLocalInputValue(new Date()), [])
  const defaultEnd   = useMemo(() => toLocalInputValue(new Date(Date.now() + 7 * 86400_000)), [])
  const [form, setForm] = useState({
    title: '', description: '', prize: '', image: '',
    startsAt: defaultStart, endsAt: defaultEnd, numWinners: 1,
  })
  const [error, setError] = useState('')
  const [pickingImage, setPickingImage] = useState(false)

  async function refresh() {
    const all = await api.get('/admin/contests')
    setList(all)
  }
  useEffect(() => { refresh() }, [])

  async function pickContestImage() {
    setPickingImage(true)
    try {
      const dataUrl = await pickAndCompressImage({ maxEdge: 1280, quality: 0.82 })
      if (dataUrl) setForm((f) => ({ ...f, image: dataUrl }))
    } catch (e) {
      setError(e.message || 'Could not load image')
    } finally {
      setPickingImage(false)
    }
  }

  async function submit() {
    setError('')
    if (!form.title || !form.image) {
      setError('Title and image are required')
      return
    }
    try {
      await addContest({
        title: form.title,
        description: form.description,
        prize: form.prize,
        image: form.image,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        numWinners: Number(form.numWinners) || 1,
      })
      setForm({
        title: '', description: '', prize: '', image: '',
        startsAt: defaultStart, endsAt: defaultEnd, numWinners: 1,
      })
      setAdding(false)
      refresh()
    } catch (e) {
      setError(e.message || 'Could not create contest')
    }
  }

  async function remove(id) {
    if (!confirm('Delete this contest? Winners declared for it will also be removed.')) return
    await deleteContest(id)
    refresh()
  }

  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-[17px] font-semibold">Your contests</div>
        <button
          onClick={() => setAdding((x) => !x)}
          className="btn-ghost inline-flex items-center gap-1.5 rounded-full h-9 px-3 text-[12px]"
        >
          {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {adding ? 'Close' : 'New contest'}
        </button>
      </div>

      {adding && (
        <div className="glass-subtle rounded-2xl p-4 space-y-3 mb-4">
          <InputRow compact label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <InputRow compact label="Prize" value={form.prize} onChange={(v) => setForm({ ...form, prize: v })} />
          <InputRow compact label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5 pl-1">
              Contest image
            </div>
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 grid place-items-center bg-crimson-500/10">
                {form.image
                  ? <img src={form.image} alt="" className="h-full w-full object-cover" />
                  : <ImageIcon className="h-5 w-5 text-crimson-400" />}
              </div>
              <label className="glass-input flex items-center rounded-2xl px-4 h-10 flex-1">
                <input
                  value={form.image.startsWith('data:') ? '' : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder={form.image.startsWith('data:') ? 'Uploaded from gallery' : 'Paste image URL'}
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
                />
              </label>
              <button
                type="button"
                onClick={pickContestImage}
                disabled={pickingImage}
                className="btn-ghost h-10 px-3 rounded-2xl inline-flex items-center gap-1.5 text-[12px] shrink-0 disabled:opacity-60"
                aria-label="Upload from gallery"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{pickingImage ? 'Loading…' : 'Gallery'}</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DateTimeRow label="Starts at" value={form.startsAt} onChange={(v) => setForm({ ...form, startsAt: v })} />
            <DateTimeRow label="Ends at"   value={form.endsAt}   onChange={(v) => setForm({ ...form, endsAt: v })} />
          </div>
          <NumberRow
            label="Number of winners"
            value={form.numWinners}
            min={1} max={50}
            onChange={(v) => setForm({ ...form, numWinners: v })}
          />
          {error && <div className="text-[12px] text-rose-300">{error}</div>}
          <PrimaryButton onClick={submit} icon={Plus}>Publish contest</PrimaryButton>
        </div>
      )}

      {list.length === 0 ? (
        <div className="glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
          No contests yet. Create one to engage customers.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <ContestRow key={c.id} contest={c} onChange={refresh} onRemove={remove} />
          ))}
        </div>
      )}
    </GlassCard>
  )
}

function ContestRow({ contest, onChange, onRemove }) {
  const state = contest.state || (
    new Date(contest.startsAt || 0).getTime() > Date.now() ? 'upcoming'
    : new Date(contest.endsAt).getTime() > Date.now() ? 'live'
    : contest.winnersDeclared ? 'declared' : 'pending-declaration'
  )
  const meta = STATE_META[state]
  const [open, setOpen] = useState(false)
  const [winners, setWinners] = useState(null)

  useEffect(() => {
    if (!open) return
    if (state === 'declared') {
      listContestWinners(contest.id).then(setWinners).catch(() => setWinners([]))
    }
  }, [open, state, contest.id])

  const canDeclare = state === 'pending-declaration'
  const canViewWinners = state === 'declared'
  const expandable = canDeclare || canViewWinners

  return (
    <div className="glass-subtle rounded-2xl overflow-hidden">
      <div className="flex">
        <div className="w-24 h-24 shrink-0 overflow-hidden bg-ink-900">
          {contest.image && <img src={contest.image} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-medium truncate">{contest.title}</div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${meta.tone}`}>
                {meta.label}
              </span>
            </div>
            <div className="text-[11px] text-white/50 truncate">
              {contest.prize || '—'} · {contest.numWinners || 1} winner{(contest.numWinners || 1) !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] text-white/40 inline-flex items-center gap-1 min-w-0">
              <CalendarRange className="h-3 w-3 shrink-0" />
              <span className="truncate">{fmtRange(contest.startsAt || contest.createdAt, contest.endsAt)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {expandable && (
                <button
                  onClick={() => setOpen((x) => !x)}
                  className="btn-ghost inline-flex items-center gap-1 rounded-full h-7 px-2 text-[11px]"
                >
                  {canDeclare ? 'Declare' : 'Winners'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              )}
              <button
                onClick={() => onRemove(contest.id)}
                className="text-rose-300/80 hover:text-rose-200 h-7 w-7 grid place-items-center rounded-full hover:bg-rose-500/10"
                aria-label="Delete contest"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && canDeclare && (
        <DeclareWinnersForm contest={contest} onDone={onChange} />
      )}
      {open && canViewWinners && (
        <div className="border-t border-white/5 p-3">
          {winners == null ? (
            <div className="text-[12px] text-white/45 text-center py-2">Loading…</div>
          ) : winners.length === 0 ? (
            <div className="text-[12px] text-white/45 text-center py-2">No winners recorded.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {winners.map((w) => (
                <div key={w.id} className="flex items-center gap-3 glass rounded-xl p-2">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-crimson-500/10">
                    {w.photoUrl && <img src={w.photoUrl} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{w.name}</div>
                    <div className="text-[11px] text-white/55 truncate">{w.prize || contest.prize || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DeclareWinnersForm({ contest, onDone }) {
  const n = Math.max(1, Number(contest.numWinners) || 1)
  const [drafts, setDrafts] = useState(
    () => Array.from({ length: n }, () => ({ name: '', prize: '', photoUrl: '' })),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pickingIdx, setPickingIdx] = useState(-1)

  function update(i, patch) {
    setDrafts((arr) => arr.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  async function pickPhoto(i) {
    setPickingIdx(i)
    try {
      const dataUrl = await pickAndCompressImage({ maxEdge: 768, quality: 0.85 })
      if (dataUrl) update(i, { photoUrl: dataUrl })
    } catch (e) {
      setError(e.message || 'Could not load image')
    } finally {
      setPickingIdx(-1)
    }
  }

  async function publish() {
    setError('')
    const valid = drafts.filter((d) => d.name.trim() && d.photoUrl)
    if (valid.length === 0) {
      setError('Add at least one winner with name and photo')
      return
    }
    setBusy(true)
    try {
      await declareContestWinners(contest.id, valid.map((d) => ({
        name: d.name.trim(),
        prize: d.prize.trim(),
        photoUrl: d.photoUrl,
      })))
      onDone()
    } catch (e) {
      setError(e.message || 'Could not declare winners')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-white/5 p-3 space-y-3">
      <div className="text-[12px] text-white/55">
        Add up to {n} winner{n !== 1 ? 's' : ''}. Each entry needs a name and a photo.
      </div>
      <div className="space-y-2">
        {drafts.map((d, i) => (
          <div key={i} className="glass rounded-xl p-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => pickPhoto(i)}
              disabled={pickingIdx === i}
              className="h-12 w-12 rounded-lg overflow-hidden border border-white/10 shrink-0 grid place-items-center bg-crimson-500/10 hover:bg-crimson-500/20 disabled:opacity-60"
              aria-label="Upload winner photo"
            >
              {d.photoUrl
                ? <img src={d.photoUrl} alt="" className="h-full w-full object-cover" />
                : <Upload className="h-4 w-4 text-white/60" />}
            </button>
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={d.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder={`Winner ${i + 1} name`}
                className="glass-input rounded-lg h-9 px-3 text-[13px] bg-transparent outline-none placeholder:text-white/30"
              />
              <input
                value={d.prize}
                onChange={(e) => update(i, { prize: e.target.value })}
                placeholder={contest.prize ? `Prize (default: ${contest.prize})` : 'Prize'}
                className="glass-input rounded-lg h-9 px-3 text-[13px] bg-transparent outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-[12px] text-rose-300">{error}</div>}
      <PrimaryButton onClick={publish} loading={busy} icon={Trophy}>
        Declare winners
      </PrimaryButton>
    </div>
  )
}

function DateTimeRow({ label, value, onChange }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5 pl-1">{label}</div>
      <label className="glass-input flex items-center rounded-2xl px-3 h-10">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[13px] text-white/90 [color-scheme:dark]"
        />
      </label>
    </div>
  )
}

function NumberRow({ label, value, onChange, min = 1, max = 50 }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5 pl-1">{label}</div>
      <label className="glass-input flex items-center rounded-2xl px-4 h-10">
        <input
          type="number"
          inputMode="numeric"
          min={min} max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30 [color-scheme:dark]"
        />
      </label>
    </div>
  )
}

function WinnersTab({ restaurant }) {
  const [list, setList] = useState([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', prize: '', photoUrl: '' })
  const [section, setSection] = useState('mine') // 'mine' | 'global'

  async function refresh() {
    const all = await api.get('/admin/winners')
    setList(all)
  }
  useEffect(() => { refresh() }, [])

  const mine   = list.filter((w) => w.source !== 'global')
  const global = list.filter((w) => w.source === 'global')

  async function submit() {
    if (!form.name || !form.photoUrl) return
    await addWinner(form)
    setForm({ name: '', prize: '', photoUrl: '' })
    setAdding(false)
    refresh()
  }

  async function remove(id) {
    await deleteWinner(id)
    refresh()
  }

  return (
    <GlassCard className="!p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-[17px] font-semibold">Winners</div>
        {section === 'mine' && (
          <button
            onClick={() => setAdding((x) => !x)}
            className="btn-ghost inline-flex items-center gap-1.5 rounded-full h-9 px-3 text-[12px]"
          >
            {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {adding ? 'Close' : 'Add winner'}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        {[['mine', `My winners (${mine.length})`], ['global', `Global winners (${global.length})`]].map(([v, label]) => (
          <button key={v} onClick={() => setSection(v)}
            className={`h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
              section === v
                ? 'bg-crimson-500/15 border border-crimson-400/50 text-white'
                : 'glass-subtle text-white/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {section === 'mine' && (
        <>
          {adding && (
            <div className="glass-subtle rounded-2xl p-4 space-y-3 mb-4">
              <InputRow compact label="Winner name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <InputRow compact label="Prize" value={form.prize} onChange={(v) => setForm({ ...form, prize: v })} />
              <InputRow compact label="Photo URL" value={form.photoUrl} onChange={(v) => setForm({ ...form, photoUrl: v })} />
              <PrimaryButton onClick={submit} icon={Plus}>Publish winner</PrimaryButton>
            </div>
          )}
          {mine.length === 0 ? (
            <div className="glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
              No winners yet. Add your first winner above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {mine.map((w) => (
                <div key={w.id || w._id} className="relative aspect-square rounded-2xl overflow-hidden glass-subtle">
                  <img src={w.photoUrl} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-[12px] font-semibold truncate">{w.name}</div>
                    <div className="text-[10px] text-white/65 truncate">{w.prize}</div>
                  </div>
                  <button
                    onClick={() => remove(w.id || w._id)}
                    className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-ink-950/80 backdrop-blur text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {section === 'global' && (
        <>
          {global.length === 0 ? (
            <div className="glass-subtle rounded-2xl p-5 text-center text-[13px] text-white/45">
              No global winners declared yet.
            </div>
          ) : (
            <div className="space-y-2">
              {global.map((w) => (
                <div key={w.id || w._id} className="flex items-center gap-3 glass-subtle rounded-2xl p-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-crimson-500/10 grid place-items-center">
                    {w.photoUrl
                      ? <img src={w.photoUrl} alt="" className="h-full w-full object-cover" />
                      : <Trophy className="h-4 w-4 text-crimson-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">{w.name}</div>
                    {w.prize && <div className="text-[11px] text-amber-300/80 truncate">{w.prize}</div>}
                    <div className="text-[10px] text-white/40">
                      {new Date(w.wonAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </GlassCard>
  )
}

function InputRow({ label, value, onChange, compact }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1.5 pl-1">
        {label}
      </div>
      <label className={`glass-input flex items-center rounded-2xl px-4 ${compact ? 'h-10' : 'h-12'}`}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/30"
        />
      </label>
    </div>
  )
}
