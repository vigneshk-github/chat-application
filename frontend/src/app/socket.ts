import { io } from "socket.io-client";

export const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
  autoConnect: false, // Prevents auto-connecting on import
  transports: ["websocket"], // Force WebSocket transport
  withCredentials: true, // Required for auth if using cookies
});
