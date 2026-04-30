export default function Logo({ size = 44 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative grid place-items-center rounded-2xl"
        style={{ width: size, height: size }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              'radial-gradient(circle at 30% 25%, #ff5b6c, #e50d2a 55%, #4c0210 100%)',
            boxShadow:
              '0 10px 24px -8px rgba(229,13,42,0.65), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.4)',
          }}
        />
        <svg
          viewBox="0 0 24 24"
          className="relative z-10"
          style={{ width: size * 0.55, height: size * 0.55 }}
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 7h10L7 17h10" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-display text-[20px] font-bold tracking-tight text-white">
          zx<span className="text-crimson-400">.</span>money
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
          private wallet
        </div>
      </div>
    </div>
  )
}
