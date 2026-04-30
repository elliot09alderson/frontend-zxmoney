import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-3xl p-6 sm:p-8 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
