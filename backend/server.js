require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const socketHandler = require("./sockets/socketHandler");

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Explicitly allow frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize WebSockets
socketHandler(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
