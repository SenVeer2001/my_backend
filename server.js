const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

const rooms = {}; // Store users in rooms

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId, userId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(userId);
    socket.join(roomId);

    // Send list of users in the room
    io.to(roomId).emit("user-list", rooms[roomId]);

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
      io.to(roomId).emit("user-list", rooms[roomId]);
    });
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", data);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
