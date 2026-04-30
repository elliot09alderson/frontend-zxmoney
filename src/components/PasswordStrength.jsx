export function scorePassword(p = '') {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^a-zA-Z0-9]/.test(p)) s++
  return Math.min(s, 4)
}

const LABELS = ['too short', 'weak', 'okay', 'strong', 'excellent']
const COLORS = [
  'bg-white/15',
  'bg-rose-500/60',
  'bg-amber-500/70',
  'bg-crimson-500',
  'bg-crimson-400',
]

export default function PasswordStrength({ value }) {
  const score = scorePassword(value)
  const segments = 4
  const active = Math.max(0, score)
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < active ? COLORS[score] : 'bg-white/8'
            }`}
            style={{ background: i < active ? undefined : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <div className="text-[11px] text-white/50">
        {value ? `Strength · ${LABELS[score]}` : 'Use 8+ chars with a mix of letters, numbers & symbols'}
      </div>
    </div>
  )
}
