import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Zap } from 'lucide-react'

const amountEmojis = (amount) => {
  if (amount >= 500) return '🚀'
  if (amount >= 200) return '👑'
  if (amount >= 100) return '💜'
  if (amount >= 50) return '⚡'
  if (amount >= 20) return '🔥'
  return '🎮'
}

export default function TipAlert({ tip, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 8000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      className="tip-alert"
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: '4px',
          display: 'flex', alignItems: 'center',
        }}
        id="close-tip-alert-btn"
      >
        <X size={16} />
      </button>

      {/* Badge */}
      <div className="tip-alert-badge">
        <Zap size={12} />
        NEW TIP
      </div>

      {/* Amount */}
      <motion.div
        className="tip-alert-amount"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
      >
        {amountEmojis(tip.amount)} ₹{tip.amount?.toLocaleString('en-IN')}
      </motion.div>

      {/* Sender */}
      <div className="tip-alert-sender">{tip.senderName}</div>

      {/* Message */}
      {tip.message && (
        <motion.div
          className="tip-alert-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tip.message}
        </motion.div>
      )}

      {/* Progress bar */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, height: '3px',
          background: 'var(--gradient-primary)', borderRadius: '0 0 0 var(--radius-lg)',
        }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 8, ease: 'linear' }}
      />
    </motion.div>
  )
}
