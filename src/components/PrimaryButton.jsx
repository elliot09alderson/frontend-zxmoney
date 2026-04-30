import { Loader2 } from 'lucide-react'

export default function PrimaryButton({
  children, loading, disabled, className = '', icon: Icon, ...rest
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn-primary relative w-full h-12 rounded-2xl font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2 overflow-hidden ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}
