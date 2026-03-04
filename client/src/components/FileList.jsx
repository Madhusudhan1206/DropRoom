function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(mimetype) {
  if (!mimetype) return '📄'
  if (mimetype.startsWith('image/')) return '🖼️'
  if (mimetype.startsWith('video/')) return '🎬'
  if (mimetype.startsWith('audio/')) return '🎵'
  if (mimetype.includes('pdf')) return '📕'
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) return '📦'
  if (mimetype.includes('word') || mimetype.includes('document')) return '📝'
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊'
  if (mimetype.includes('text')) return '📃'
  return '📄'
}

export default function FileList({ files, roomCode }) {
  if (files.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: 'var(--muted)' }}>
        <div className="text-3xl mb-3">📭</div>
        <p className="text-sm">No files shared yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 rounded-xl p-3 fade-in"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="text-2xl flex-shrink-0">{getFileIcon(file.mimetype)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{file.originalName}</p>
            <p className="text-xs mono" style={{ color: 'var(--muted)' }}>{formatBytes(file.size)}</p>
          </div>
          <a
            href={`/api/room/${roomCode}/download/${file.id}`}
            download={file.originalName}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save
          </a>
        </div>
      ))}
    </div>
  )
}
