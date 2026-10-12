import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, MessageCircle, IndianRupee, Gamepad2, Youtube, Copy, QrCode, Minus, Plus, User, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../config.js'
import { BackgroundGradient } from '../components/BackgroundGradient.jsx'

const PRESET_AMOUNTS = [
  { value: 40, label: '₹40' },
  { value: 100, label: '₹100' },
  { value: 500, label: '₹500' },
  { value: 1000, label: '₹1k' },
  { value: 2000, label: '₹2k' },
  { value: 10000, label: '₹10k' },
]
const STREAMER_NAME = 'MEDDplays'

const emojiReactions = {
  10: '🎮',
  20: '🔥',
  50: '⚡',
  100: '💜',
  200: '👑',
  500: '🚀',
}

export default function TipPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', amount: '40', message: '' })
  const [selectedPreset, setSelectedPreset] = useState(40)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1 = form, 2 = confirm

  const handlePreset = (amt) => {
    setSelectedPreset(amt)
    setForm((prev) => ({ ...prev, amount: String(amt) }))
  }

  const handleCustomAmount = (val) => {
    const num = Number(val)
    setSelectedPreset(PRESET_AMOUNTS.some(p => p.value === num) ? num : null)
    setForm((prev) => ({ ...prev, amount: val }))
  }

  const handleStepAmount = (delta) => {
    const current = Number(form.amount) || 0
    const stepSize = current < 100 ? 10 : current < 1000 ? 50 : 500
    const nextVal = Math.max(10, current + delta * stepSize)
    handleCustomAmount(String(nextVal))
  }

  const validateForm = () => {
    if (!form.name.trim()) { toast.error('Please enter your name 🎮'); return false }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 10) { toast.error('Minimum tip amount is ₹10 🎮'); return false }
    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/api/tips/create-order`, {
        amount: Number(form.amount),
        senderName: form.name.trim(),
        message: form.message.trim(),
      })

      if (!data.success) {
        toast.error(data.message || 'Failed to create order')
        return
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: `Tip ${STREAMER_NAME}`,
        description: `Tip from ${form.name}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/tips/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyRes.data.success) {
              navigate('/thankyou', {
                state: {
                  senderName: form.name,
                  amount: form.amount,
                  message: form.message,
                },
              })
            } else {
              toast.error('Payment verification failed')
            }
          } catch {
            toast.error('Verification error, please contact support')
          }
        },
        prefill: { name: form.name },
        theme: { color: '#8b5cf6' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '😔' })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const currentEmoji = emojiReactions[selectedPreset] || '💸'

  return (
    <>
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="page-wrapper" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          <BackgroundGradient borderRadius="28px" containerStyle={{ width: '100%' }}>
          <div className="tip-form-card card">
          {/* Streamer Header (Screenshot Pill Design - Clickable YouTube Profile) */}
          <div className="streamer-header">
            <motion.a
              href="https://www.youtube.com/@MEDDplayss"
              target="_blank"
              rel="noopener noreferrer"
              className="streamer-pill-badge"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350 }}
              title="Visit MEDDplays YouTube channel"
            >
              {/* Avatar + YouTube micro badge */}
              <div className="streamer-pill-avatar-wrap">
                <img
                  src="/avatar.png"
                  alt={STREAMER_NAME}
                  className="streamer-pill-avatar-img"
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="streamer-pill-yt-icon">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'block' }}
                  >
                    <path
                      d="M9.5 7.5L16.5 12L9.5 16.5V7.5Z"
                      fill="#ffffff"
                    />
                  </svg>
                </div>
              </div>

              {/* Streamer info */}
              <div className="streamer-pill-info">
                <div className="streamer-pill-name-row">
                  <span className="streamer-pill-name">{STREAMER_NAME}</span>
                  <div className="streamer-pill-verified" title="Verified Streamer">
                    <Check size={9} strokeWidth={3.5} />
                  </div>
                </div>
                <span className="streamer-pill-handle">@MEDDplayss</span>
              </div>
            </motion.a>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6" style={{ gap: '20px' }}>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="sender-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Gamer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={50}
                  style={{ paddingLeft: '46px' }}
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}>
                  <User size={18} />
                </span>
              </div>
            </div>

            {/* Amount Presets & Stepper (Screenshot Design) */}
            <div className="form-group" style={{ gap: '14px' }}>
              <label className="form-label">Choose Amount (₹)</label>

              {/* Central Pill Stepper */}
              <div className="stepper-container">
                <motion.button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleStepAmount(-1)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Decrease amount"
                >
                  <Minus size={20} />
                </motion.button>

                <div className="stepper-pill">
                  <div className="stepper-pill-input-row">
                    <span className="stepper-currency-symbol">₹</span>
                    <div className="stepper-number-wrapper">
                      <input
                        id="custom-amount"
                        type="number"
                        className="stepper-number-input"
                        value={form.amount}
                        onChange={(e) => handleCustomAmount(e.target.value)}
                        min={10}
                        style={{
                          width: `${Math.max(2, String(form.amount || '40').length) * 26 + 10}px`,
                        }}
                      />
                      <div className="stepper-glow-indicator" />
                    </div>
                    <span className="stepper-currency-code">INR</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  className="stepper-btn"
                  onClick={() => handleStepAmount(1)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Increase amount"
                >
                  <Plus size={20} />
                </motion.button>
              </div>

              {/* Horizontal Row of Circular Pills */}
              <div className="pill-presets-row">
                {PRESET_AMOUNTS.map((preset) => (
                  <motion.button
                    key={preset.value}
                    type="button"
                    className={`preset-circle-pill ${selectedPreset === preset.value ? 'active' : ''}`}
                    onClick={() => handlePreset(preset.value)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    id={`amount-${preset.value}`}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">Message (Optional)</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="tip-message"
                  className="form-input form-textarea"
                  placeholder="Say something to MEDDplays... 💬"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={200}
                />
                <span style={{
                  position: 'absolute', bottom: '10px', right: '12px',
                  fontSize: '0.72rem', color: 'var(--text-muted)'
                }}>
                  {form.message.length}/200
                </span>
              </div>
            </div>

            {/* Amount preview */}
            <AnimatePresence>
              {form.amount && Number(form.amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'radial-gradient(120% 120% at 50% 20%, rgba(30, 58, 110, 0.45) 0%, rgba(15, 23, 42, 0.75) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <span style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{currentEmoji}</span> You're tipping
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.02em', textShadow: '0 0 16px rgba(96, 165, 250, 0.4)' }}>
                    ₹{Number(form.amount).toLocaleString('en-IN')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Button */}
            <motion.button
              id="pay-tip-btn"
              className="btn btn-primary btn-full"
              style={{
                fontSize: '1.05rem',
                padding: '16px 28px',
                letterSpacing: '0.01em',
                marginTop: '4px',
                gap: '10px',
              }}
              onClick={handlePayment}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart size={18} fill="currentColor" style={{ opacity: 0.9 }} />
                  Send Tip {form.amount ? `₹${Number(form.amount).toLocaleString('en-IN')}` : ''}
                  <Zap size={16} fill="currentColor" style={{ opacity: 0.9 }} />
                </>
              )}
            </motion.button>

            {/* Secure badge */}
            <div className="text-center" style={{ textAlign: 'center' }}>
              <p className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>⚙️</span>
                Razorpay integration is being built — use QR below to tip!
              </p>
            </div>

            {/* Google Pay QR Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '20px',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={16} color="var(--purple-400)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tip via QR Code</span>
                </div>
              </div>

              {/* Instruction Banner */}
              <div style={{
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.35)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#fbbf24', lineHeight: 1.55, fontWeight: 500 }}>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Use QR code to tip for now</strong>
                  Razorpay payment gateway is currently being built. Scan the Google Pay QR below to send your tip directly! 🙏
                </p>
              </div>

              {/* GPay QR Image */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 0 30px rgba(139,92,246,0.25), 0 4px 20px rgba(0,0,0,0.3)',
              }}>
                <img
                  src="/gpay-qr.png?v=2"
                  alt="Google Pay QR code — UPI ID: sammedp63@okicici"
                  width={200}
                  height={200}
                  style={{ display: 'block', borderRadius: '8px', objectFit: 'contain' }}
                />
              </div>

              {/* UPI ID */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  📱 Scan with <strong style={{ color: 'var(--text-secondary)' }}>Google Pay, PhonePe, Paytm</strong> or any UPI app
                </p>
                <motion.button
                  id="copy-upi-id-btn"
                  className="btn btn-outline"
                  style={{ fontSize: '0.78rem', padding: '8px 16px', width: '100%', marginTop: '2px' }}
                  onClick={() => {
                    navigator.clipboard.writeText('sammedp63@okicici')
                    toast.success('UPI ID copied! 📋')
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy size={13} /> Copy UPI ID: sammedp63@okicici
                </motion.button>
              </div>
            </motion.div>
          </div>
          </div>
          </BackgroundGradient>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}
        >
          Made with ❤️ for {STREAMER_NAME}'s community
        </motion.p>
      </div>
    </>
  )
}
