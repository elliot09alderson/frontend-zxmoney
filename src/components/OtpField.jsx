import { useEffect, useRef } from 'react'

export default function OtpField({ length = 6, value, onChange, onComplete }) {
  const refs = useRef([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const setChar = (i, ch) => {
    const next = value.split('')
    next[i] = ch
    const joined = next.join('').slice(0, length)
    onChange(joined)
    if (joined.length === length) onComplete?.(joined)
  }

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) { setChar(i, ''); return }
    // handle paste of full code
    if (raw.length > 1) {
      const full = raw.slice(0, length)
      onChange(full)
      const lastIdx = Math.min(full.length, length) - 1
      refs.current[lastIdx]?.focus()
      if (full.length === length) onComplete?.(full)
      return
    }
    setChar(i, raw)
    if (i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i]
        return (
          <div
            key={i}
            className={`otp-cell relative flex-1 aspect-[4/5] max-w-[56px] rounded-2xl glass-input flex items-center justify-center transition-all ${
              filled ? 'border-crimson-500/60 shadow-glow-sm' : ''
            }`}
          >
            <input
              ref={(el) => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={length}
              value={value[i] || ''}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKey(i, e)}
              onFocus={(e) => e.target.select()}
              className="absolute inset-0 w-full h-full bg-transparent text-center text-xl sm:text-2xl font-semibold text-white tabular-nums outline-none rounded-2xl caret-crimson-400"
            />
          </div>
        )
      })}
    </div>
  )
}
