import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])

  const code = digits.join('')

  function handleDigitChange(index, value) {
    const val = value.replace(/\D/g, '').slice(-1)
    const updated = [...digits]
    updated[index] = val
    setDigits(updated)
    setError('')

    if (val && index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const updated = [...digits]
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i]
    setDigits(updated)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  async function handleJoin() {
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/room/join', { code })
      if (res.data.success) {
        navigate(`/room/${code}`, {
          state: { isHost: false, expiresAt: res.data.expiresAt, existingFiles: res.data.files }
        })
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Room not found or has expired. Check your code and try again.')
      } else {
        setError('Failed to join room. Is the server running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="slide-up w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-10 text-sm transition-colors hover:text-white"
          style={{ color: 'var(--muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                 style={{ background: 'rgba(232, 255, 71, 0.1)', border: '1px solid rgba(232, 255, 71, 0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                      stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Join a Room</h2>
            <p style={{ color: 'var(--muted)' }}>
              Enter the 6-digit code shared with you to access the room.
            </p>
          </div>

          {/* Digit inputs */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="code-digit outline-none transition-all focus:scale-110"
                style={{
                  borderColor: d ? 'var(--accent)' : 'var(--border)',
                  boxShadow: d ? '0 0 12px rgba(232, 255, 71, 0.2)' : 'none',
                }}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-lg p-3 mb-4 text-sm text-center"
                 style={{ background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)', color: 'var(--accent2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading || code.length !== 6}
            className="w-full py-4 rounded-xl font-bold text-lg tracking-tight transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Joining...
              </span>
            ) : 'Join Room →'}
          </button>
        </div>
      </div>
    </div>
  )
}
