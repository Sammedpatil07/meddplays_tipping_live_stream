import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../config.js'

const POLL_INTERVAL = 4000 // Check every 4 seconds

const amountEmoji = (amount) => {
  if (amount >= 500) return '🚀'
  if (amount >= 200) return '👑'
  if (amount >= 100) return '💜'
  if (amount >= 50) return '⚡'
  if (amount >= 20) return '🔥'
  return '🎮'
}

const amountTier = (amount) => {
  if (amount >= 500) return 'legendary'
  if (amount >= 200) return 'epic'
  if (amount >= 100) return 'rare'
  if (amount >= 50) return 'uncommon'
  return 'common'
}

export default function StreamOverlay() {
  const [queue, setQueue] = useState([])
  const [activeTip, setActiveTip] = useState(null)
  const processingRef = useRef(false)
  const lastTipIdRef = useRef(null)
  const lastTipTimeRef = useRef(null)

  // Make body fully transparent for OBS browser source
  useEffect(() => {
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.background = ''
      document.documentElement.style.background = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Process queue one at a time
  useEffect(() => {
    if (activeTip || processingRef.current || queue.length === 0) return

    processingRef.current = true
    const next = queue[0]
    setQueue((prev) => prev.slice(1))
    setActiveTip(next)
    playSound(next.amount)
  }, [queue, activeTip])

  const handleAlertDone = () => {
    setActiveTip(null)
    processingRef.current = false
  }

  // Poll backend for new tips every POLL_INTERVAL ms
  useEffect(() => {
    const BACKEND = 'https://meddplays-backend.onrender.com'

    const fetchLatestTip = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/tips?status=paid&limit=1`)
        const data = await res.json()
        const tips = data.tips || []

        if (tips.length === 0) return

        const latest = tips[0]
        const latestId = latest._id || latest.id
        const latestTime = new Date(latest.createdAt).getTime()

        // On first load, just record the latest tip — don't show it
        if (lastTipIdRef.current === null) {
          lastTipIdRef.current = latestId
          lastTipTimeRef.current = latestTime
          return
        }

        // If the most recent tip is newer than what we last saw → show alert
        if (latestId !== lastTipIdRef.current && latestTime > (lastTipTimeRef.current || 0)) {
          lastTipIdRef.current = latestId
          lastTipTimeRef.current = latestTime
          setQueue((prev) => [...prev, { ...latest, _key: Date.now() }])
        }
      } catch (err) {
        console.log('Polling error:', err)
      }
    }

    // Fetch immediately on mount to set baseline
    fetchLatestTip()

    // Then poll every POLL_INTERVAL
    const interval = setInterval(fetchLatestTip, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const playSound = (amount) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const gainNode = ctx.createGain()
      gainNode.connect(ctx.destination)

      const freqs = amount >= 200
        ? [523, 659, 784, 1047, 1319]
        : amount >= 100
        ? [440, 554, 659, 880]
        : amount >= 50
        ? [440, 554, 659]
        : [440, 554]

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.13)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.35)
        osc.connect(gainNode)
        osc.start(ctx.currentTime + i * 0.13)
        osc.stop(ctx.currentTime + i * 0.13 + 0.5)
      })
    } catch (e) {
      console.log('Audio error', e)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'transparent',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      padding: '40px',
      pointerEvents: 'none',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>
      <AnimatePresence mode="wait">
        {activeTip && (
          <TipAlertOverlay
            key={activeTip._key}
            tip={activeTip}
            onDone={handleAlertDone}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TipAlertOverlay({ tip, onDone }) {
  const tier = amountTier(tip.amount)
  const emoji = amountEmoji(tip.amount)
  const DISPLAY_DURATION = 7000

  useEffect(() => {
    const t = setTimeout(() => onDone(), DISPLAY_DURATION)
    return () => clearTimeout(t)
  }, [onDone])

  const tierColors = {
    legendary: { glow: '#f59e0b', border: '#fbbf24', bg: 'rgba(251,191,36,0.12)', badge: '#f59e0b' },
    epic:      { glow: '#a855f7', border: '#c084fc', bg: 'rgba(168,85,247,0.12)', badge: '#a855f7' },
    rare:      { glow: '#8b5cf6', border: '#a78bfa', bg: 'rgba(139,92,246,0.12)', badge: '#8b5cf6' },
    uncommon:  { glow: '#06b6d4', border: '#67e8f9', bg: 'rgba(6,182,212,0.12)', badge: '#06b6d4' },
    common:    { glow: '#6b7280', border: '#9ca3af', bg: 'rgba(107,114,128,0.12)', badge: '#6b7280' },
  }

  const colors = tierColors[tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(10,5,25,0.97), rgba(20,10,40,0.97))',
        border: `2px solid ${colors.border}`,
        borderRadius: '20px',
        padding: '24px 32px',
        minWidth: '340px',
        maxWidth: '420px',
        boxShadow: `0 0 40px ${colors.glow}55, 0 0 80px ${colors.glow}22, 0 20px 60px rgba(0,0,0,0.7)`,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Shimmer background */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at top left, ${colors.bg} 0%, transparent 70%)`,
          borderRadius: '20px',
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Sparkle particles */}
      {tier !== 'common' && [...Array(tier === 'legendary' ? 8 : tier === 'epic' ? 5 : 3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4, height: 4,
            borderRadius: '50%',
            background: colors.glow,
            top: `${10 + (i * 10)}%`,
            left: `${10 + (i * 9)}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.2 }}
        />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <motion.div
            style={{
              background: colors.badge,
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              padding: '3px 10px',
              borderRadius: '999px',
              textTransform: 'uppercase',
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            ⚡ NEW TIP
          </motion.div>
          {tier !== 'common' && (
            <div style={{
              background: `${colors.badge}22`,
              color: colors.badge,
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '3px 8px',
              borderRadius: '999px',
              border: `1px solid ${colors.badge}44`,
              textTransform: 'uppercase',
            }}>
              {tier}
            </div>
          )}
        </div>

        {/* Emoji + Amount */}
        <motion.div
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
        >
          <span>{emoji}</span>
          <span style={{ color: colors.badge }}>₹{tip.amount?.toLocaleString('en-IN')}</span>
        </motion.div>

        {/* Sender name */}
        <motion.div
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#e2d9f3',
            marginBottom: tip.message ? '10px' : '0',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tip.senderName}
        </motion.div>

        {/* Message */}
        {tip.message && (
          <motion.div
            style={{
              fontSize: '0.9rem',
              color: '#a78bfa',
              fontStyle: 'italic',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              lineHeight: 1.4,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            💬 &ldquo;{tip.message}&rdquo;
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colors.glow}, ${colors.border})`,
          borderRadius: '0 0 0 20px',
        }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: DISPLAY_DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}
