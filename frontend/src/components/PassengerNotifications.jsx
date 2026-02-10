import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const PassengerNotifications = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `booking_status_updated_${user._id}`;

    const handleStatusUpdate = (data) => {
      console.log("🔔 تحديث حالة الحجز:", data);

      if (data.status === "accepted") {
        toast.success(data.msg || "تم قبول حجزك! ✅", {
          duration: 5000,
          style: {
            border: "1px solid #22c55e",
            background: "#1E293B",
            color: "#fff",
          },
        });
        // صوت بسيط (اختياري)
        new Audio("/sounds/success.mp3").play().catch(() => {});
      } else {
        toast.error(data.msg || "تم رفض الحجز ❌", {
          duration: 5000,
          style: {
            border: "1px solid #ef4444",
            background: "#1E293B",
            color: "#fff",
          },
        });
      }
    };

    socket.on(eventName, handleStatusUpdate);

    return () => {
      socket.off(eventName, handleStatusUpdate);
    };
  }, [socket, user]);

  return null; // هذا المكون لا يعرض شيئاً، فقط يستمع
};

export default PassengerNotifications;
