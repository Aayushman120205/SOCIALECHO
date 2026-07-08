const { Server } = require("socket.io");
const authSocket = require("./auth");
const connectionHandler = require("./connection");

let ioInstance = null;

// Initialize Socket.IO on the shared HTTP server created in app.js.
function initializeSocket(server) {
  if (ioInstance) {
    return ioInstance;
  }

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authSocket);
  io.on("connection", (socket) => {
    connectionHandler(io, socket);
  });

  ioInstance = io;
  return io;
}

initializeSocket.getIO = () => ioInstance;

module.exports = initializeSocket;
