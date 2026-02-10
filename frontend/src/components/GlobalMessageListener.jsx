import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const GlobalMessageListener = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    // الانضمام لغرفة اليوزر الخاصة لتلقي الاشعارات
    socket.emit("join_room", `user_${user.id}`);
    console.log(`🔔 Joining personal notification room: user_${user.id}`);

    const handleNotification = (data) => {
      // اذا المستخدم فاتح نفس الشات حالياً، ممكن منطلع اشعار (اختياري)
      // لكن كبداية، نطلع اشعار بكل الاحوال
      console.log("New Notification Recieved:", data);

      toast(
        (t) => (
          <div className="flex items-start gap-3" dir="rtl">
            <div className="flex-1">
              <p className="font-bold text-sm text-white">{data.title}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {data.body}
              </p>
            </div>
          </div>
        ),
        {
          icon: "📩",
          style: {
            borderRadius: "15px",
            background: "#1E293B",
            color: "#fff",
            border: "1px solid #FACC15",
          },
          duration: 4000,
        },
      );
    };

    socket.on("message_notification", handleNotification);

    return () => {
      socket.off("message_notification", handleNotification);
    };
  }, [socket, user]);

  return null; // هذا المكون ميرسم شي، بس يشتغل بالخلفية
};

export default GlobalMessageListener;
