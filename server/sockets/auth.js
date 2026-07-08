const jwt = require("jsonwebtoken");

// Authenticate each socket connection using the same JWT secret and style as the REST API.
module.exports = function authSocket(socket, next) {
  // Reuse the same JWT secret that the existing backend uses for auth tokens.
  const authToken =
    socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.authorization;

  if (!authToken) {
    return next(new Error("Authentication error"));
  }

  const token = authToken.startsWith("Bearer ") ? authToken.slice(7) : authToken;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    if (!decoded || !decoded.email) {
      return next(new Error("Authentication error"));
    }

    socket.user = {
      id: decoded._id || decoded.id,
      email: decoded.email,
    };

    console.log(`Socket authenticated: ${socket.user.id}`);

    return next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
};
