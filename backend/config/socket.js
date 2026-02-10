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

  // تخزين المستخدمين المتصلين: userId -> socketId
  // نستخدم Map لسرعة الوصول
  // لكن المتغير global في هذا الملف فقط، اذا سيرفرك يسوي restart يضيعون
  // للمشاريع الكبيرة نستخدم Redis. هنا Map كافية.

  io.on("connection", (socket) => {
    console.log(`⚡ متصل جديد: ${socket.id} 🔌`);

    // 1. تسجيل المستخدم عند الاتصال
    socket.on("register_user", (userId) => {
      if (userId) {
        // انضمام لغرفة الاشعارات الخاصة به
        socket.join(`user_${userId}`);

        // تحديث حالة الاتصال
        // يمكن للمستخدم ان يكون متصل من عدة اجهزة، لذا القيمة ممكن تكون Set او Array
        // للتبسيط الان: كل يوزر عنده سوكيت واحد نشط (الاخير)
        // او نخزن sockedId بداخل الـ user room وخلاص؟
        // لا، نحتاج قائمة Online Users عشان الفرونت يعرض النقطة الخضراء

        socket.userId = userId; // تخزين الـ ID في السوكيت نفسه للمغادرة

        // نبعث للكل ان هذا المستخدم صار اونلاين
        io.emit("user_status_change", { userId, status: "online" });
        console.log(`✅ User Registered: ${userId}`);
      }
    });

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
      if (socket.userId) {
        io.emit("user_status_change", {
          userId: socket.userId,
          status: "offline",
        });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io is not initialized! 🚫");
  return io;
};
