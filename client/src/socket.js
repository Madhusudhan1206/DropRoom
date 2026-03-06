import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://droproom-server.onrender.com'

const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export default socket
