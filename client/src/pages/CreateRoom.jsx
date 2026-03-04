import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CreateRoom() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/room/create')
      if (res.data.success) {
        navigate(`/room/${res.data.code}`, { state: { isHost: true, expiresAt: res.data.expiresAt } })
      }
    } catch (err) {
      setError('Failed to create room. Is the server running?')
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
                <path d="M12 5v14M5 12h14" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Create a Room</h2>
            <p style={{ color: 'var(--muted)' }}>
              A unique 6-digit code will be generated. Share it with anyone you want to receive files from.
            </p>
          </div>

          <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            {[
              'Room expires in 10 minutes',
              'Files deleted after everyone leaves',
              'No account needed',
              'Up to 1GB per file',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{item}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)', color: 'var(--accent2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg tracking-tight transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Creating...
              </span>
            ) : 'Generate Room Code →'}
          </button>
        </div>
      </div>
    </div>
  )
}
