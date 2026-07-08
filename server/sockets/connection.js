const connectedUsers = new Map();

const getConnectedSocketId = (userId) => {
  if (!userId) {
    return null;
  }

  return connectedUsers.get(userId.toString()) || null;
};

const emitToUser = (io, userId, event, payload) => {
  const socketId = getConnectedSocketId(userId);

  if (!socketId || !io) {
    return false;
  }

  io.to(socketId).emit(event, payload);
  return true;
};

// Keep a simple in-memory map of connected users for future real-time features.
function connectionHandler(io, socket) {
  if (!socket.user || !socket.user.id) {
    socket.disconnect(true);
    return;
  }

  const userId = socket.user.id.toString();
  connectedUsers.set(userId, socket.id);

  socket.on("disconnect", () => {
    if (connectedUsers.get(userId) === socket.id) {
      connectedUsers.delete(userId);
    }
  });

  socket.emit("connection:established", {
    success: true,
    userId,
  });
}

connectionHandler.getConnectedSocketId = getConnectedSocketId;
connectionHandler.emitToUser = emitToUser;

module.exports = connectionHandler;
