import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordField({
  value, onChange, placeholder = 'Password', autoFocus, autoComplete = 'new-password',
}) {
  const [show, setShow] = useState(false)
  return (
    <label className="glass-input flex items-center gap-3 rounded-2xl px-4 h-14">
      <Lock className="h-[18px] w-[18px] text-crimson-400" strokeWidth={2.2} />
      <input
        type={show ? 'text' : 'password'}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-white placeholder:text-white/30 text-[16px] outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-white/50 hover:text-white/90 transition-colors p-1"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </label>
  )
}
