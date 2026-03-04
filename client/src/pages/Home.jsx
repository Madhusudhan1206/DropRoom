import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="slide-up mb-16 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            DropRoom
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 leading-none">
          Share files.<br />
          <span style={{ color: 'var(--accent)' }} className="accent-glow">No accounts.</span>
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
          Create a room, share the code, drop your files. Gone in 10 minutes. Nothing stored forever.
        </p>
      </div>

      {/* Action buttons */}
      <div className="slide-up flex flex-col sm:flex-row gap-4 w-full max-w-sm"
           style={{ animationDelay: '0.1s', opacity: 0 }}>
        <button
          onClick={() => navigate('/create')}
          className="flex-1 py-4 px-8 rounded-xl font-bold text-lg tracking-tight transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
        >
          Create Room
        </button>
        <button
          onClick={() => navigate('/join')}
          className="flex-1 py-4 px-8 rounded-xl font-bold text-lg tracking-tight transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          Join Room
        </button>
      </div>

      {/* Features */}
      <div className="slide-up mt-20 grid grid-cols-3 gap-8 max-w-lg text-center"
           style={{ animationDelay: '0.2s', opacity: 0 }}>
        {[
          { icon: '⚡', label: 'Instant' },
          { icon: '🔒', label: 'No Login' },
          { icon: '💨', label: 'Auto-Expires' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs mono" style={{ color: 'var(--muted)' }}>
        Files auto-delete after 10 mins · 1GB max
      </p>
    </div>
  )
}
