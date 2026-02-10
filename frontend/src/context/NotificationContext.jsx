import { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import api from "../api/axios";
import { useAppContext } from "./AppContext";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { activeChat } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب الاشعارات الغير مقروءة عند التحميل (اذا اكو API)
  // حالياً حنعتمد على اللي يجي من السوكيت واللوكال ستيت

  useEffect(() => {
    if (!socket || !user) return;
    console.log("notifications: ", notifications);

    const handleNewMessage = (data) => {
      // 🕵️ التحقق من الدردشة النشطة
      if (activeChat) {
        const isSameRoute = data.routeId === activeChat.routeId;
        const isSameType = data.chatType === activeChat.chatType;
        let isSamePerson = true;
        if (data.chatType === "private" && activeChat.otherParticipantId) {
          isSamePerson = data.senderId === activeChat.otherParticipantId;
        }

        if (isSameRoute && isSameType && isSamePerson) {
          return; // تجاهل التحديث للعداد والاشعارات
        }
      }

      console.log("🔔 New Message Notification:", data);

      // اضافة الاشعار للقائمة
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // تشغيل صوت اشعار
      new Audio("/sounds/notification_sound.mp3").play().catch(() => {});
    };

    const handleBookingUpdate = (data) => {
      console.log("🔔 Booking Update:", data);
      setNotifications((prev) => [
        {
          type: "booking",
          title:
            data.status === "accepted" ? "تم قبول الحجز ✅" : "تم رفض الحجز ❌",
          body: data.msg,
          time: new Date(),
          id: Date.now(),
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("message_notification", handleNewMessage);
    socket.on(`booking_status_updated_${user._id}`, handleBookingUpdate);

    return () => {
      socket.off("message_notification", handleNewMessage);
      socket.off(`booking_status_updated_${user._id}`, handleBookingUpdate);
    };
  }, [socket, user]);

  const markAllAsRead = () => {
    setUnreadCount(0);
    // ممكن هنا ندز ريكويست للباك اند نصفر الاشعارات
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
