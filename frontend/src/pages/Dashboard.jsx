import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  TrendingUp, Users, IndianRupee, Bell, BellOff,
  LogOut, ExternalLink, Wifi, WifiOff, RefreshCw
} from 'lucide-react'
import TipAlert from '../components/TipAlert.jsx'

export default function Dashboard() {
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const audioCtxRef = useRef(null)
  const [streamer, setStreamer] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [tips, setTips] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTip, setActiveTip] = useState(null)
  const [newTipIds, setNewTipIds] = useState(new Set())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Auth check
  useEffect(() => {
    const stored = localStorage.getItem('streamer')
    if (!stored) {
      navigate('/login')
      return
    }
    setStreamer(JSON.parse(stored))
  }, [navigate])

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [tipsRes, statsRes] = await Promise.all([
        axios.get('/api/tips?status=paid&limit=50'),
        axios.get('/api/tips/stats'),
      ])
      setTips(tipsRes.data.tips || [])
      setStats(statsRes.data.stats)
    } catch (err) {
      toast.error('Failed to load tips data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (streamer) {
      fetchData()
    }
  }, [streamer])

  // Socket.IO connection
  useEffect(() => {
    if (!streamer) return

    const socket = io('/', { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join-dashboard', streamer.id)
      console.log('✅ Dashboard connected')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('new-tip', (tipData) => {
      console.log('💜 New tip received:', tipData)

      // Add to list with animation flag
      setTips((prev) => [tipData, ...prev])
      setNewTipIds((prev) => new Set([...prev, tipData.id]))

      // Show floating alert
      setActiveTip(tipData)

      // Auto-clear flag after animation
      setTimeout(() => {
        setNewTipIds((prev) => {
          const next = new Set(prev)
          next.delete(tipData.id)
          return next
        })
      }, 3000)

      // Play sound
      if (soundEnabled) {
        playTipSound(tipData.amount)
      }

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`💜 New Tip from ${tipData.senderName}!`, {
          body: `₹${tipData.amount}${tipData.message ? ` — "${tipData.message}"` : ''}`,
          icon: '/favicon.svg',
        })
      }

      // Toast
      toast.success(`💜 ${tipData.senderName} tipped ₹${tipData.amount}!`, {
        duration: 6000,
        style: {
          background: 'linear-gradient(135deg, #1a0533, #2d0a4e)',
          color: '#fff',
          border: '1px solid #8b5cf6',
          fontSize: '1rem',
          fontWeight: 600,
        },
      })

      // Update stats
      setStats((prev) => prev ? {
        ...prev,
        totalTips: prev.totalTips + 1,
        totalAmount: prev.totalAmount + tipData.amount,
        recentTips: [tipData, ...(prev.recentTips || [])].slice(0, 10),
      } : prev)
    })

    return () => {
      socket.disconnect()
    }
  }, [streamer, soundEnabled])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const playTipSound = (amount) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const gainNode = ctx.createGain()
      gainNode.connect(ctx.destination)

      // Higher amount = higher-pitched celebration sound
      const frequencies = amount >= 200 ? [523, 659, 784, 1047] : amount >= 50 ? [440, 554, 659] : [440, 554]

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3)
        osc.connect(gainNode)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.4)
      })
    } catch (e) {
      console.log('Audio not available')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('streamer')
    navigate('/login')
  }

  const copyTipLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/')
    toast.success('Tip link copied! Share in your stream 🎮')
  }

  if (!streamer) return null

  const totalAmount = stats?.totalAmount || 0
  const totalTips = stats?.totalTips || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', backgroundImage: 'var(--gradient-bg)' }}>
      <div className="orb orb-1" style={{ opacity: 0.5 }} />
      <div className="orb orb-2" style={{ opacity: 0.5 }} />

      {/* Floating Tip Alert */}
      <AnimatePresence>
        {activeTip && (
          <TipAlert
            tip={activeTip}
            onClose={() => setActiveTip(null)}
          />
        )}
      </AnimatePresence>

      {/* Dashboard Content */}
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 className="heading-md" style={{ color: 'var(--text-primary)' }}>
                🎮 MEDDplays Dashboard
              </h1>
              <span className={isConnected ? 'live-indicator' : ''} style={!isConnected ? {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(100,100,100,0.15)', border: '1px solid rgba(100,100,100,0.3)',
                borderRadius: '9999px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700,
                color: '#9ca3af'
              } : {}}>
                {isConnected ? (
                  <><span className="live-dot" />LIVE</>
                ) : (
                  <><WifiOff size={12} />OFFLINE</>
                )}
              </span>
            </div>
            <p className="text-sm text-muted">Real-time tip notifications</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <motion.button
              className="btn btn-outline"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              whileHover={{ scale: 1.05 }}
              title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
              id="toggle-sound-btn"
            >
              {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </motion.button>

            <motion.button
              className="btn btn-outline"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={copyTipLink}
              whileHover={{ scale: 1.05 }}
              id="copy-link-btn"
            >
              <ExternalLink size={16} />
              Share Tip Link
            </motion.button>

            <motion.button
              className="btn btn-outline"
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              onClick={fetchData}
              whileHover={{ scale: 1.05 }}
              id="refresh-btn"
            >
              <RefreshCw size={16} />
            </motion.button>

            <motion.button
              className="btn btn-outline"
              style={{ padding: '10px 16px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              id="logout-btn"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
            <div className="stat-value">
              ₹{isLoading ? '...' : totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Total Earned</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <div className="stat-value">
              {isLoading ? '...' : totalTips}
            </div>
            <div className="stat-label">Total Tips</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
            <div className="stat-value">
              ₹{isLoading || !totalTips ? '0' : Math.round(totalAmount / totalTips).toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Avg Tip</div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏆</div>
            <div className="stat-value">
              ₹{isLoading ? '...' : (stats?.topTips?.[0]?.amount?.toLocaleString('en-IN') || '0')}
            </div>
            <div className="stat-label">Highest Tip</div>
          </motion.div>
        </div>

        {/* Tips List */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
              💜 Recent Tips
            </h2>
            <span className="text-sm text-muted">{tips.length} tips</span>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              Loading tips...
            </div>
          ) : tips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '48px' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎮</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>
                No tips yet!
              </p>
              <p className="text-sm text-muted" style={{ marginTop: '6px' }}>
                Share your tip link to start receiving tips during your stream
              </p>
              <motion.button
                className="btn btn-primary"
                style={{ marginTop: '20px', fontSize: '0.9rem' }}
                onClick={copyTipLink}
                whileHover={{ scale: 1.05 }}
                id="share-tip-link-btn"
              >
                📋 Copy Tip Link
              </motion.button>
            </motion.div>
          ) : (
            <div className="tips-list">
              <AnimatePresence>
                {tips.map((tip, index) => (
                  <motion.div
                    key={tip._id || tip.id || index}
                    className={`tip-item ${newTipIds.has(tip._id || tip.id) ? 'new-tip' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index < 10 ? index * 0.05 : 0 }}
                    layout
                  >
                    {/* Avatar */}
                    <div className="tip-avatar">
                      {tip.senderName?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="tip-info">
                      <div className="tip-sender-name">{tip.senderName}</div>
                      {tip.message && (
                        <div className="tip-message-text">💬 {tip.message}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(tip.createdAt).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="tip-amount-badge">
                      ₹{tip.amount?.toLocaleString('en-IN')}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
