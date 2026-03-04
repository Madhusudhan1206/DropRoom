import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import socket from '../socket'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'

function useCountdown(expiresAt) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = expiresAt - Date.now()
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  return timeLeft
}

export default function Room() {
  const { code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { expiresAt, existingFiles = [] } = location.state || {}

  const [files, setFiles] = useState(existingFiles)
  const [userCount, setUserCount] = useState(1)
  const [copied, setCopied] = useState(false)
  const [notification, setNotification] = useState(null)
  const timeLeft = useCountdown(expiresAt || Date.now() + 10 * 60 * 1000)

  useEffect(() => {
    if (!location.state) {
      navigate('/', { replace: true })
    }
  }, [])

  function showNotification(text, type = 'info') {
    setNotification({ text, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    socket.connect()
    socket.emit('joinRoom', { code })

    socket.on('userJoined', ({ userCount: count }) => {
      setUserCount(count)
      if (count > 1) showNotification(`Someone joined · ${count} users in room`, 'join')
    })

    socket.on('userLeft', ({ userCount: count }) => {
      setUserCount(count)
      showNotification(`Someone left · ${count} user${count !== 1 ? 's' : ''} in room`, 'leave')
    })

    socket.on('fileReady', (fileInfo) => {
      setFiles((prev) => {
        if (prev.find(f => f.id === fileInfo.id)) return prev
        return [...prev, fileInfo]
      })
      showNotification(`New file: ${fileInfo.originalName}`, 'file')
    })

    socket.on('error', ({ message }) => {
      showNotification(message, 'error')
    })

    return () => {
      socket.emit('leaveRoom', { code })
      socket.disconnect()
      socket.off('userJoined')
      socket.off('userLeft')
      socket.off('fileReady')
      socket.off('error')
    }
  }, [code])

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const notifColors = {
    join:  { bg: 'rgba(74, 222, 128, 0.1)',  border: 'rgba(74, 222, 128, 0.3)',  color: '#4ade80' },
    leave: { bg: 'rgba(255, 107, 53, 0.1)',  border: 'rgba(255, 107, 53, 0.3)',  color: 'var(--accent2)' },
    file:  { bg: 'rgba(232, 255, 71, 0.08)', border: 'rgba(232, 255, 71, 0.25)', color: 'var(--accent)' },
    error: { bg: 'rgba(255, 107, 53, 0.1)',  border: 'rgba(255, 107, 53, 0.3)',  color: 'var(--accent2)' },
    info:  { bg: 'var(--surface2)',           border: 'var(--border)',             color: 'var(--muted)' },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="slide-up w-full max-w-lg">

        {/* Toast notification */}
        {notification && (
          <div
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold fade-in"
            style={{
              background: notifColors[notification.type]?.bg,
              border: `1px solid ${notifColors[notification.type]?.border}`,
              color: notifColors[notification.type]?.color,
              whiteSpace: 'nowrap',
            }}
          >
            {notification.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm transition-colors hover:text-white"
            style={{ color: 'var(--muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Leave Room
          </button>
          <div className="flex items-center gap-2 mono text-sm" style={{ color: 'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {timeLeft}
          </div>
        </div>

        {/* Room code card */}
        <div className="rounded-2xl p-6 mb-4 pulse-border"
             style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              Room Code
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                 style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="w-1.5 h-1.5 rounded-full"
                   style={{ background: userCount > 1 ? '#4ade80' : 'var(--muted)' }} />
              <span className="mono text-xs" style={{ color: userCount > 1 ? '#4ade80' : 'var(--muted)' }}>
                {userCount} {userCount === 1 ? 'user' : 'users'} online
              </span>
            </div>
          </div>

          {/* Code display */}
          <div className="flex gap-2 justify-center mb-5">
            {code.split('').map((digit, i) => (
              <div key={i} className="code-digit">{digit}</div>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: copied ? 'rgba(232, 255, 71, 0.1)' : 'var(--surface2)',
              border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
              color: copied ? 'var(--accent)' : 'var(--text)',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy Code · Share with anyone'}
          </button>
        </div>

        {/* Upload — available to ALL users */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share a File
          </h3>
          <FileUpload roomCode={code} />
        </div>

        {/* Files list */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                    stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Shared Files
            {files.length > 0 && (
              <span className="ml-auto mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(232, 255, 71, 0.1)', color: 'var(--accent)' }}>
                {files.length}
              </span>
            )}
          </h3>
          <FileList files={files} roomCode={code} />
        </div>

      </div>
    </div>
  )
}