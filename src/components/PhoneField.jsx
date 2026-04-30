import { Phone } from 'lucide-react'
import { formatPhone } from '../lib/auth'

export default function PhoneField({ value, onChange, autoFocus }) {
  return (
    <label className="glass-input flex items-center gap-3 rounded-2xl px-4 h-14">
      <span className="flex items-center gap-2 pr-3 border-r border-white/10 text-white/85">
        <Phone className="h-[18px] w-[18px] text-crimson-400" strokeWidth={2.2} />
        <span className="text-sm font-medium tabular-nums">+91</span>
      </span>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        placeholder="98765 43210"
        value={formatPhone(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        className="flex-1 bg-transparent text-white placeholder:text-white/30 text-[17px] font-medium tracking-wide outline-none tabular-nums"
      />
    </label>
  )
}
