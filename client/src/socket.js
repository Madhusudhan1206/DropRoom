import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export default socket
