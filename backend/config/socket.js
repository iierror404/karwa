// backend/socket.js 🕵️‍♂️
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://192.168.0.196:3000", // بدون سلاش أخيرة 🚫 /
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      credentials: true // ضرورية للتعامل مع الكوكي والتوكن 🛡️
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ متصل جديد: ${socket.id} 🔌`);

    // انضمام لغرفة (شات الخط أو تحديثات الخط)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`👥 دخل للغرفة: ${roomId}`);
    });

    // مغادرة الغرفة (مهمة جداً للأداء)
    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`🚶 غادر الغرفة: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ قطع الاتصال");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io is not initialized! 🚫");
  return io;
};