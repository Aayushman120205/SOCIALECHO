const connectedUsers = new Map();

const getOnlineUserIds = () => Array.from(connectedUsers.keys());

const getConnectedSocketIds = (userId) => {
  if (!userId) {
    return [];
  }

  return Array.from(connectedUsers.get(userId.toString()) || []);
};

const getConnectedSocketId = (userId) => {
  return getConnectedSocketIds(userId)[0] || null;
};

const emitToUser = (io, userId, event, payload) => {
  const socketIds = getConnectedSocketIds(userId);

  if (socketIds.length === 0 || !io) {
    console.log("Recipient offline");
    return false;
  }

  console.log(`Emitting message to user ${userId}`);
  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
  return true;
};

// Keep a simple in-memory map of connected users for future real-time features.
function connectionHandler(io, socket) {
  console.log("Incoming socket connection");

  if (!socket.user || !socket.user.id) {
    socket.disconnect(true);
    return;
  }

  const userId = socket.user.id.toString();
  const userSockets = connectedUsers.get(userId) || new Set();
  const wasOffline = userSockets.size === 0;
  userSockets.add(socket.id);
  connectedUsers.set(userId, userSockets);
  console.log(`User online: ${userId}`);

  socket.emit("presence:online-users", getOnlineUserIds());

  if (wasOffline) {
    socket.broadcast.emit("presence:user-online", { userId });
  }

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    const sockets = connectedUsers.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      connectedUsers.delete(userId);
      console.log(`User offline: ${userId}`);
      socket.broadcast.emit("presence:user-offline", { userId });
    } else {
      connectedUsers.set(userId, sockets);
    }
  });

  socket.emit("connection:established", {
    success: true,
    userId,
  });
}

connectionHandler.getConnectedSocketId = getConnectedSocketId;
connectionHandler.getConnectedSocketIds = getConnectedSocketIds;
connectionHandler.getOnlineUserIds = getOnlineUserIds;
connectionHandler.emitToUser = emitToUser;

module.exports = connectionHandler;
