import { useState, useRef } from 'react'
import axios from 'axios'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function FileUpload({ roomCode }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRef = useRef()

  async function uploadFile(file) {
    if (file.size > 1024 * 1024 * 1024) {
      setError('File too large. Maximum size is 1GB.')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`/api/room/${roomCode}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(pct)
        },
      })
      setSuccess(`"${file.name}" sent successfully!`)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          background: dragging ? 'rgba(232, 255, 71, 0.04)' : 'var(--surface2)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} disabled={uploading} />

        {uploading ? (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(232, 255, 71, 0.1)' }}>
              <svg className="animate-bounce" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold mb-3">Uploading... {progress}%</p>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(232, 255, 71, 0.08)', border: '1px solid rgba(232, 255, 71, 0.15)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-bold mb-1">Drop a file here</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>or click to browse · 1GB max</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg p-3 text-sm fade-in"
             style={{ background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)', color: 'var(--accent2)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg p-3 text-sm fade-in"
             style={{ background: 'rgba(232, 255, 71, 0.08)', border: '1px solid rgba(232, 255, 71, 0.2)', color: 'var(--accent)' }}>
          ✓ {success}
        </div>
      )}
    </div>
  )
}
