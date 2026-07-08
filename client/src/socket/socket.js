import { io } from "socket.io-client";
import { isValidToken } from "../utils/authUtils";

let socket = null;
let socketToken = null;
let onlineUserIds = [];
const presenceListeners = new Set();

const getStoredAccessToken = () => {
  try {
    return JSON.parse(localStorage.getItem("profile"))?.accessToken || null;
  } catch (error) {
    return null;
  }
};

const getSocketUrl = () => {
  return process.env.REACT_APP_API_URL || window.location.origin;
};

export const getSocket = () => socket;

export const getOnlineUserIds = () => onlineUserIds;

export const subscribeToPresence = (listener) => {
  presenceListeners.add(listener);
  listener(onlineUserIds);

  return () => {
    presenceListeners.delete(listener);
  };
};

const notifyPresenceListeners = () => {
  presenceListeners.forEach((listener) => listener(onlineUserIds));
};

const setOnlineUserIds = (userIds) => {
  onlineUserIds = Array.isArray(userIds) ? userIds.map(String) : [];
  notifyPresenceListeners();
};

const addOnlineUser = (userId) => {
  if (!userId || onlineUserIds.includes(userId.toString())) {
    return;
  }

  onlineUserIds = [...onlineUserIds, userId.toString()];
  notifyPresenceListeners();
};

const removeOnlineUser = (userId) => {
  if (!userId) {
    return;
  }

  onlineUserIds = onlineUserIds.filter(
    (onlineUserId) => onlineUserId !== userId.toString()
  );
  notifyPresenceListeners();
};

const bindPresenceHandlers = (socketInstance) => {
  socketInstance.on("presence:online-users", setOnlineUserIds);
  socketInstance.on("presence:user-online", ({ userId } = {}) => {
    addOnlineUser(userId);
  });
  socketInstance.on("presence:user-offline", ({ userId } = {}) => {
    removeOnlineUser(userId);
  });
};

export const connectSocket = (accessToken = getStoredAccessToken()) => {
  if (!isValidToken(accessToken)) {
    disconnectSocket();
    return null;
  }

  if (socket) {
    socket.auth = { token: accessToken };
    socketToken = accessToken;

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: {
      token: accessToken,
    },
    autoConnect: false,
  });
  bindPresenceHandlers(socket);
  socketToken = accessToken;
  socket.connect();

  return socket;
};

export const reconnectSocket = (accessToken = getStoredAccessToken()) => {
  if (!isValidToken(accessToken)) {
    disconnectSocket();
    return null;
  }

  if (socket && socketToken === accessToken) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  disconnectSocket();
  return connectSocket(accessToken);
};

export const disconnectSocket = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
  socketToken = null;
  onlineUserIds = [];
  notifyPresenceListeners();
};
