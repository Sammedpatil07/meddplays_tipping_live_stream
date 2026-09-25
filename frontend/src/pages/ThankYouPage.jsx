import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from '../hooks/useWindowSize'
import { Heart, Home } from 'lucide-react'

export default function ThankYouPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!state?.senderName) {
      navigate('/')
    }
  }, [state, navigate])

  if (!state?.senderName) return null

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        colors={['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#ffffff']}
        gravity={0.2}
      />

      <motion.div
        className="tip-form-card card"
        style={{ textAlign: 'center', maxWidth: '420px' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
      >
        {/* Success Icon */}
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          🎉
        </motion.div>

        <motion.h1
          className="heading-lg gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '12px' }}
        >
          Thank You, {state.senderName}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}
        >
          Your tip of{' '}
          <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.2em' }}>
            ₹{Number(state.amount).toLocaleString('en-IN')}
          </span>{' '}
          is on its way to MEDDplays! 🚀
        </motion.p>

        {state.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '28px',
              textAlign: 'left',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Your Message
            </p>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{state.message}"
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            padding: '16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: '#6ee7b7' }}>
            🔴 MEDDplays will see your tip live on stream right now!
          </p>
        </motion.div>

        <motion.button
          id="back-to-tip-btn"
          className="btn btn-primary btn-full"
          onClick={() => navigate('/')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home size={18} />
          Tip Again
          <Heart size={16} />
        </motion.button>
      </motion.div>
    </div>
  )
}
