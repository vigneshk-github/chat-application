import { io } from "socket.io-client";

export const socket = io("http://localhost:8000", {
  autoConnect: false, // Prevents auto-connecting on import
  transports: ["websocket"], // Force WebSocket transport
  withCredentials: true, // Required for auth if using cookies
});
