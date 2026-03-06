import { io } from 'socket.io-client'

// Dynamically determine the server URL
const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser: use current location
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const host = window.location.hostname
    const port = window.location.port
    
    // If port is 5173 (dev), connect to localhost:5000
    if (port === '5173') {
      return 'http://localhost:5000'
    }
    
    // Otherwise, connect to the same host (production)
    return port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`
  }
  return 'http://localhost:5000'
}

const socket = io(getServerUrl(), {
  autoConnect: false,
})

export default socket
