const fs = require("fs");
const path = require("path");

const rooms = new Map();

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

function createRoom() {
  const code = generateRoomCode();
  const room = {
    code,
    users: [],
    files: [],
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };

  rooms.set(code, room);

  // Auto-delete room after 10 minutes
  setTimeout(() => {
    deleteRoom(code);
  }, 10 * 60 * 1000);

  return room;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function roomExists(code) {
  return rooms.has(code);
}

function addUserToRoom(code, socketId) {
  const room = rooms.get(code);
  if (!room) return false;
  if (!room.users.includes(socketId)) {
    room.users.push(socketId);
  }
  return true;
}

function removeUserFromRoom(code, socketId) {
  const room = rooms.get(code);
  if (!room) return;

  const wasInRoom = room.users.includes(socketId);
  room.users = room.users.filter((id) => id !== socketId);

  // Only delete if user was actually in the room AND room is now empty
  // Use a short grace period so late socket joins aren't wiped out
  if (wasInRoom && room.users.length === 0) {
    setTimeout(() => {
      const current = rooms.get(code);
      if (current && current.users.length === 0) {
        deleteRoom(code);
      }
    }, 10000); // 10 second grace period before cleanup
  }
}

function addFileToRoom(code, fileInfo) {
  const room = rooms.get(code);
  if (!room) return false;
  room.files.push(fileInfo);
  return true;
}

function deleteRoom(code) {
  const room = rooms.get(code);
  if (!room) return;

  // Delete all uploaded files
  room.files.forEach((file) => {
    const filePath = path.join(__dirname, "uploads", file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  rooms.delete(code);
  console.log(`Room ${code} deleted`);
}

function getRoomUserCount(code) {
  const room = rooms.get(code);
  return room ? room.users.length : 0;
}

module.exports = {
  createRoom,
  getRoom,
  roomExists,
  addUserToRoom,
  removeUserFromRoom,
  addFileToRoom,
  deleteRoom,
  getRoomUserCount,
};