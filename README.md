# DropRoom — Instant Room-Based File Sharing

A full-stack file sharing app. Create a room, share the 6-digit code, drop files. Auto-expires in 10 minutes. No accounts, no permanent storage.

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React + Vite + Tailwind CSS   |
| Backend   | Node.js + Express             |
| Realtime  | Socket.io                     |
| Uploads   | Multer (disk storage)         |
| Routing   | React Router v6               |
| HTTP      | Axios                         |

---

## Project Structure

```
fileshare/
├── server/
│   ├── routes/
│   │   └── room.js          # REST API routes
│   ├── uploads/             # Temp file storage (auto-created)
│   ├── roomManager.js       # In-memory room store
│   ├── server.js            # Express + Socket.io entry
│   └── package.json
│
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── CreateRoom.jsx   # Room creation flow
    │   │   ├── JoinRoom.jsx     # Room join with digit inputs
    │   │   └── Room.jsx         # Main room (upload + download)
    │   ├── components/
    │   │   ├── FileUpload.jsx   # Drag-and-drop uploader
    │   │   └── FileList.jsx     # File list with download buttons
    │   ├── socket.js            # Socket.io singleton
    │   ├── App.jsx              # Router setup
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Global styles + design system
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Run

### 1. Install Backend

```bash
cd server
npm install
npm run dev        # or: node server.js
```

Server starts on **http://localhost:5000**

### 2. Install Frontend

```bash
cd client
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

---

## API Reference

| Method | Endpoint                             | Description                  |
|--------|--------------------------------------|------------------------------|
| POST   | `/api/room/create`                   | Create new room              |
| POST   | `/api/room/join`                     | Join existing room           |
| POST   | `/api/room/:code/upload`             | Upload file to room          |
| GET    | `/api/room/:code/download/:fileId`   | Download a file              |
| GET    | `/api/room/:code/status`             | Get room status              |
| GET    | `/health`                            | Server health check          |

---

## Socket Events

| Event        | Direction       | Payload                        |
|--------------|-----------------|--------------------------------|
| `joinRoom`   | Client → Server | `{ code }`                     |
| `leaveRoom`  | Client → Server | `{ code }`                     |
| `userJoined` | Server → Client | `{ userCount, socketId }`      |
| `userLeft`   | Server → Client | `{ userCount, socketId }`      |
| `fileReady`  | Server → Client | `{ id, originalName, size, ... }` |
| `error`      | Server → Client | `{ message }`                  |

---

## Security Features

- 1GB file size limit (Multer)
- Files deleted after everyone leaves the room
- Auto room + file cleanup after 10 minutes
- 6-digit random room codes (1M combinations)
- No persistent storage — everything in memory + temp disk

---
Key talking points:
- **In-memory room management** using JavaScript `Map` — no database needed
- **WebSocket rooms** with `socket.join(roomCode)` for real-time events
- **File lifecycle**: upload → emit event → peer downloads → auto-delete
- **Security**: size limits, auto-expiry, no login, temp-only storage
