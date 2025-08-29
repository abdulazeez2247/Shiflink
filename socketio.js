let io;
const mongoose = require('mongoose');

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
      },
    });

    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      if (userId) {
        socket.userId = userId;
        next();
      } else {
        next(new Error("Unauthorized"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected`);

      socket.join(socket.userId);

      socket.on("mark_as_read", async (messageId) => {
        await mongoose
          .model("Message")
          .updateOne(
            { _id: messageId },
            { $addToSet: { readBy: socket.userId } }
          );
      });

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  },
};
