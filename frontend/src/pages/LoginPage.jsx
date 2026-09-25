import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Gamepad2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password.trim()) { toast.error('Enter your password'); return }
    setIsLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', { password })
      if (data.success) {
        localStorage.setItem('streamer', JSON.stringify({ id: data.streamerId, name: data.streamerName }))
        toast.success(`Welcome back, ${data.streamerName}! 🎮`)
        navigate('/dashboard')
      } else {
        toast.error('Wrong password')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        className="login-card card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
            fontSize: '1.8rem'
          }}>
            🎮
          </div>
          <h1 className="heading-md gradient-text" style={{ marginBottom: '6px' }}>Streamer Dashboard</h1>
          <p className="text-sm text-muted">Enter your password to view tips</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="dashboard-password"
                type="password"
                className="form-input"
                placeholder="Enter streamer password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                autoFocus
              />
              <Lock size={16} style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <motion.button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Logging in...' : '🚀 Access Dashboard'}
          </motion.button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/')}
            style={{ fontSize: '0.875rem', padding: '10px 20px' }}
          >
            ← Back to Tip Page
          </button>
        </div>

        <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>
          Default password: <code style={{ color: 'var(--purple-400)' }}>meddplays2024</code>
          <br />
          <span style={{ fontSize: '0.7rem' }}>Change in backend .env → STREAMER_PASSWORD</span>
        </p>
      </motion.div>
    </div>
  )
}
