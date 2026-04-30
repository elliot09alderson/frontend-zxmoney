import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Search, CheckCircle2, Ban, Clock, Store, Users, Percent,
} from 'lucide-react'
import TopBar from '../../components/TopBar'
import GlassCard from '../../components/GlassCard'
import { listAdmins, setAdminStatus } from '../../lib/store'

const STATUS = {
  active: { label: 'Active', icon: CheckCircle2, color: 'emerald' },
  pending: { label: 'Pending', icon: Clock, color: 'amber' },
  disabled: { label: 'Disabled', icon: Ban, color: 'rose' },
}

export default function SuperAdmin({ onSignOut }) {
  const [admins, setAdmins] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  async function refresh() {
    setAdmins(await listAdmins())
  }
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

  const counts = useMemo(
    () => ({
      all: admins.length,
      active: admins.filter((a) => a.status === 'active').length,
      pending: admins.filter((a) => a.status === 'pending').length,
      disabled: admins.filter((a) => a.status === 'disabled').length,
    }),
    [admins],
  )

  return (
    <div className="space-y-5">
      <TopBar
        compactLogo="Super admin"
        onSignOut={onSignOut}
        right={<span className="chip"><Crown className="h-3 w-3" /> super</span>}
      />

      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Partners" value={counts.all} icon={Users} />
        <Stat label="Active" value={counts.active} icon={CheckCircle2} />
        <Stat label="Pending" value={counts.pending} icon={Clock} />
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
            <div className="font-medium truncate">
              {a.restaurant?.name || a.name}
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full
              ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30' : ''}
              ${a.status === 'pending' ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30' : ''}
              ${a.status === 'disabled' ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30' : ''}
            `}>
              <Icon className="h-2.5 w-2.5" />
              {meta.label}
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
        <StatusBtn
          active={a.status === 'active'}
          onClick={() => onChange(a.phone, 'active')}
          label="Activate"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatusBtn
          active={a.status === 'disabled'}
          onClick={() => onChange(a.phone, 'disabled')}
          label="Disable"
          icon={Ban}
          tone="rose"
        />
      </div>
    </motion.div>
  )
}

function StatusBtn({ active, onClick, label, icon: Icon, tone }) {
  const toneMap = {
    emerald: active ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200' : 'border-white/10 text-white/55 hover:text-white',
    amber:   active ? 'bg-amber-500/15 border-amber-400/50 text-amber-200' : 'border-white/10 text-white/55 hover:text-white',
    rose:    active ? 'bg-rose-500/15 border-rose-400/50 text-rose-200' : 'border-white/10 text-white/55 hover:text-white',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border text-[12px] font-medium transition-colors ${toneMap[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
