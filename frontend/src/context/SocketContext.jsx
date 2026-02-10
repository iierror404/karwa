import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // افترضت عندك AuthContext تجيب منه بيانات اليوزر

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth(); // حتى نعرف منو اللي اتصل

  useEffect(() => {
    if (!user?.id) return;

    if (user) {
      console.log(BACKEND_URL + ":" + BACKEND_PORT);
      // 🔗 ربط السوكيت بآي بي الباك أند مالتك
      const newSocket = io(BACKEND_URL + ":" + BACKEND_PORT, {
        query: { userId: user.id },
        withCredentials: true,
        transports: ["websocket"],
        upgrade: false,
        timeout: 20000,
        reconnectionAttempts: 5,

        rememberUpgrade: true,
      });

      newSocket.on("connect", () => {
        console.log("✅ تم الاتصال بالسوكيت بنجاح! ID:", newSocket.id);
        // 📢 تسجيل المستخدم فور الاتصال
        newSocket.emit("register_user", user.id || user._id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ فشل الاتصال بالسوكيت:", err.message);
      });

      // 🟢 متابعة حالة المستخدمين
      // ملاحظة: هذا الحل بسيط، الأفضل جلب القائمة الكاملة عند البدء ثم التحديث
      // أو استخدام React Query للحالة المعقدة.
      newSocket.on("user_status_change", ({ userId, status }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (status === "online") newSet.add(userId);
          else newSet.delete(userId);
          return Array.from(newSet);
        });
      });

      setSocket(newSocket);

      // التنظيف عند الخروج
      return () => {
        newSocket.off("user_status_change");
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
