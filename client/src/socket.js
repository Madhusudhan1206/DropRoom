import { io } from 'socket.io-client'

const SOCKET_URL = io('https://droproom-server.onrender.com')

const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export default socket
