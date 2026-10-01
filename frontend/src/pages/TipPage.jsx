import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Zap, MessageCircle, IndianRupee, Gamepad2, Youtube, QrCode, Copy } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../config.js'

const PRESET_AMOUNTS = [10, 20, 50, 100, 200, 500]
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
  const [form, setForm] = useState({ name: '', amount: '', message: '' })
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1 = form, 2 = confirm

  const handlePreset = (amt) => {
    setSelectedPreset(amt)
    setForm((prev) => ({ ...prev, amount: amt }))
  }

  const handleCustomAmount = (val) => {
    setSelectedPreset(null)
    setForm((prev) => ({ ...prev, amount: val }))
  }

  const validateForm = () => {
    if (!form.name.trim()) { toast.error('Please enter your name 🎮'); return false }
    if (!form.amount || isNaN(form.amount) || form.amount < 1) { toast.error('Please enter a valid amount'); return false }
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

      <div className="page-wrapper">
        <motion.div
          className="tip-form-card card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Streamer Header */}
          <div className="streamer-header">
            <motion.div
              className="streamer-avatar"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              🎮
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-2" style={{ gap: '8px' }}>
              <Youtube size={16} color="#ef4444" />
              <span className="text-sm" style={{ color: '#f87171', fontWeight: 600 }}>LIVE STREAM</span>
            </div>

            <h1 className="heading-lg gradient-text mb-4" style={{ marginBottom: '8px' }}>
              {STREAMER_NAME}
            </h1>
            <p className="text-sm text-secondary" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Support the stream! Every tip shows up live 🎯<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No monetization, just love ❤️</span>
            </p>
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
                  style={{ paddingLeft: '44px' }}
                />
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                  👤
                </span>
              </div>
            </div>

            {/* Amount Presets */}
            <div className="form-group">
              <label className="form-label">Choose Amount (₹)</label>
              <div className="amount-grid">
                {PRESET_AMOUNTS.map((amt) => (
                  <motion.button
                    key={amt}
                    className={`amount-chip ${selectedPreset === amt ? 'active' : ''}`}
                    onClick={() => handlePreset(amt)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    id={`amount-${amt}`}
                  >
                    {emojiReactions[amt]} ₹{amt}
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div style={{ position: 'relative', marginTop: '10px' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 700
                }}>₹</span>
                <input
                  id="custom-amount"
                  type="number"
                  className="form-input"
                  placeholder="Custom amount..."
                  value={selectedPreset ? '' : form.amount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  min={1}
                  style={{ paddingLeft: '36px' }}
                />
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
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {currentEmoji} You're tipping
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900 }} className="gradient-text">
                    ₹{Number(form.amount).toLocaleString('en-IN')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Button */}
            <motion.button
              id="pay-tip-btn"
              className="btn btn-primary btn-full"
              style={{ fontSize: '1.1rem', padding: '16px', marginTop: '4px' }}
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
                  <Heart size={20} />
                  Send Tip {form.amount ? `₹${Number(form.amount).toLocaleString('en-IN')}` : ''}
                  <Zap size={16} />
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
                  src="/gpay-qr.png"
                  alt="Google Pay QR code — UPI ID: sammedp63@okicici"
                  width={180}
                  height={180}
                  style={{ display: 'block', borderRadius: '8px' }}
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
