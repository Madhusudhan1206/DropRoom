const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const roomManager = require("./roomManager");
const roomRoutes = require("./routes/room");

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL, // e.g. https://your-frontend.onrender.com
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

<<<<<<< HEAD
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use("/api/room", roomRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: Date.now() }));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("joinRoom", ({ code }) => {
    if (!roomManager.roomExists(code)) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    socket.join(code);
    socket.roomCode = code;
    roomManager.addUserToRoom(code, socket.id);

    const userCount = roomManager.getRoomUserCount(code);

    socket.emit("userJoined", { userCount, socketId: socket.id });
    socket.to(code).emit("userJoined", { userCount, socketId: socket.id });

    // Send existing files to late joiners
    const room = roomManager.getRoom(code);
    if (room && room.files.length > 0) {
      room.files.forEach((file) => {
        socket.emit("fileReady", {
          id: file.id,
          originalName: file.originalName,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: file.uploadedAt,
        });
      });
    }

    console.log(`Socket ${socket.id} joined room ${code} (${userCount} users)`);
  });

  socket.on("leaveRoom", ({ code }) => {
    socket.leave(code);
    roomManager.removeUserFromRoom(code, socket.id);
    const userCount = roomManager.getRoomUserCount(code);
    io.to(code).emit("userLeft", { userCount, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    if (socket.roomCode) {
      roomManager.removeUserFromRoom(socket.roomCode, socket.id);
      const userCount = roomManager.getRoomUserCount(socket.roomCode);
      io.to(socket.roomCode).emit("userLeft", { userCount, socketId: socket.id });
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
