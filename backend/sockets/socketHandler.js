const prisma = require("../config/prisma");

const socketHandler = (io) => {
  const users = {}; // Stores { email -> socketId }

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user with email
    socket.on("register", (email) => {
      users[email] = socket.id;
      console.log(`${email} registered with socket ID: ${socket.id}`);
    });

    // Handle private messages
    socket.on("privateMessage", async ({ to, message, from }) => {
      try {
        const toSocketId = users[to];

        // Find users in the database
        const user1 = await prisma.user.findFirst({
          where: { email: to },
        });

        const user2 = await prisma.user.findFirst({
          where: { email: from },
        });

        if (!user1 || !user2) {
          return socket.emit("error", "One or both users not found");
        }

        // Ensure conversation exists
        const conversation = await prisma.conversation.upsert({
          where: {
            userAId_userBId: {
              userAId: Math.min(user1.id, user2.id),
              userBId: Math.max(user1.id, user2.id),
            },
          },
          update: {},
          create: {
            userAId: Math.min(user1.id, user2.id),
            userBId: Math.max(user1.id, user2.id),
          },
        });

        // Save the message
        await prisma.message.create({
          data: {
            content: message,
            userId: user2.id, // Ensure sender's ID is stored
            conversationId: conversation.id,
          },
        });

        // Emit message to recipient if online
        if (toSocketId) {
          io.to(toSocketId).emit("privateMessage", { from, message });
        }

        // Send the message back to the sender
        socket.emit("privateMessage", { from, message });
      } catch (error) {
        console.error("Error handling private message:", error);
        socket.emit("error", "An error occurred while sending the message");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const disconnectedUser = Object.keys(users).find(
        (key) => users[key] === socket.id
      );
      if (disconnectedUser) {
        delete users[disconnectedUser];
      }
    });
  });
};

module.exports = socketHandler;
