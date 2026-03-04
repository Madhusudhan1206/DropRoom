const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const roomManager = require("../roomManager");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
});

// POST /api/room/create
router.post("/create", (req, res) => {
  try {
    const room = roomManager.createRoom();
    res.json({ success: true, code: room.code, expiresAt: room.expiresAt });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create room" });
  }
});

// POST /api/room/join
router.post("/join", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "Room code required" });

  const room = roomManager.getRoom(code);
  if (!room) return res.status(404).json({ success: false, message: "Room not found or expired" });

  res.json({
    success: true,
    code: room.code,
    expiresAt: room.expiresAt,
    files: room.files.map((f) => ({
      id: f.id,
      originalName: f.originalName,
      size: f.size,
      mimetype: f.mimetype,
      uploadedAt: f.uploadedAt,
    })),
  });
});

// POST /api/room/:code/upload
router.post("/:code/upload", upload.single("file"), (req, res) => {
  const { code } = req.params;

  if (!roomManager.roomExists(code)) {
    // Clean up the uploaded file if room doesn't exist
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided" });
  }

  const fileInfo = {
    id: uuidv4(),
    originalName: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: Date.now(),
  };

  roomManager.addFileToRoom(code, fileInfo);

  // Notify room via socket (attached to req.app)
  const io = req.app.get("io");
  if (io) {
    io.to(code).emit("fileReady", {
      id: fileInfo.id,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      uploadedAt: fileInfo.uploadedAt,
    });
  }

  res.json({ success: true, file: fileInfo });
});

// GET /api/room/:code/download/:fileId
router.get("/:code/download/:fileId", (req, res) => {
  const { code, fileId } = req.params;
  const room = roomManager.getRoom(code);

  if (!room) return res.status(404).json({ success: false, message: "Room not found" });

  const file = room.files.find((f) => f.id === fileId);
  if (!file) return res.status(404).json({ success: false, message: "File not found" });

  const filePath = path.join(__dirname, "../uploads", file.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File no longer available" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
  res.setHeader("Content-Type", file.mimetype);
  res.sendFile(filePath);
});

// GET /api/room/:code/status
router.get("/:code/status", (req, res) => {
  const { code } = req.params;
  const room = roomManager.getRoom(code);
  if (!room) return res.status(404).json({ success: false, message: "Room not found" });

  res.json({
    success: true,
    userCount: roomManager.getRoomUserCount(code),
    fileCount: room.files.length,
    expiresAt: room.expiresAt,
  });
});

module.exports = router;
