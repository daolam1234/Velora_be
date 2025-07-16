// socketServer.js
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";

const app = express();
const server = http.createServer(app);

// Lưu username -> socket.id
const userSockets = new Map(); // { username: socketId }

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Khi người dùng đăng ký username (từ FE client)
  socket.on("register_user", (username) => {
    userSockets.set(username, socket.id);
    console.log(`📌 Registered user ${username} with socket ID: ${socket.id}`);
  });

  // Khi người dùng yêu cầu hỗ trợ
  socket.on("user_support_request", (data) => {
    console.log("📨 Support request from", data.userName, ":", data.message);

    // Broadcast đến admin (có thể là tất cả các client đang mở giao diện admin)
    io.emit("user_support_request", data);
  });

  // Khi admin gửi tin nhắn trả lời user
  socket.on("admin_reply", ({ toUser, message }) => {
    const targetSocketId = userSockets.get(toUser);
    if (targetSocketId) {
      io.to(targetSocketId).emit("admin_reply", { toUser, message });
      console.log(`📤 Gửi tin nhắn đến ${toUser}: ${message}`);
    } else {
      console.log(`❌ Không tìm thấy socket của user ${toUser}`);
    }
  });

  // Khi user hoặc admin rời khỏi
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);

    // Xóa khỏi danh sách userSockets nếu có
    for (const [username, id] of userSockets.entries()) {
      if (id === socket.id) {
        userSockets.delete(username);
        console.log(`🗑️ Đã xóa user ${username} khỏi userSockets`);
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🧠 Socket.IO server is running on http://localhost:${PORT}`);
});
