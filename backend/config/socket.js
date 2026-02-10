// backend/socket.js 🕵️‍♂️
import { Server } from "socket.io";
const FRONTEND_IP = process.env.FRONTEND_URL;
const FRONTEND_PORT = process.env.FRONTEND_PORT;

const FRONTEND_URL = FRONTEND_IP + ":" + FRONTEND_PORT;

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: FRONTEND_URL, // بدون سلاش أخيرة 🚫 /
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      credentials: true, // ضرورية للتعامل مع الكوكي والتوكن 🛡️
    },
    transports: ["websocket", "polling"],
  });

  // تخزين المستخدمين المتصلين: userId -> Set of socketIds (لعلاج مشكلة عدة أجهزة)
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`⚡ متصل جديد: ${socket.id} 🔌`);

    // 1. تسجيل المستخدم عند الاتصال
    socket.on("register_user", (userId) => {
      if (userId) {
        // انضمام لغرفة الاشعارات الخاصة به
        socket.join(`user_${userId}`);
        socket.userId = userId;

        // تحديث قائمة المتصلين
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
          // نبعث للكل ان هذا المستخدم صار اونلاين (فقط المرة الأولى)
          io.emit("user_status_change", { userId, status: "online" });
        }
        onlineUsers.get(userId).add(socket.id);

        // إرسال قائمة المتصلين الحالية للمستخدم الجديد فقط
        socket.emit("online_users_list", Array.from(onlineUsers.keys()));

        console.log(
          `✅ User Registered: ${userId} (Total Online: ${onlineUsers.size})`,
        );
      }
    });

    // انضمام لغرفة (شات الخط أو تحديثات الخط)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`👥 دخل للغرفة: ${roomId}`);
    });

    // مغادرة الغرفة
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      console.log(`🚶 غادر الغرفة: ${roomId}`);
    });

    socket.on("disconnect", () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          // نبلغ الكل ان اليوزر صار اوفلاين
          io.emit("user_status_change", {
            userId: socket.userId,
            status: "offline",
          });
          console.log(`❌ User Offline: ${socket.userId}`);
        }
      }
      console.log(`❌ قطع الاتصال: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io is not initialized! 🚫");
  return io;
};
