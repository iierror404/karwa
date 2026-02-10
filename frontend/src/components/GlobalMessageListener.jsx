import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const GlobalMessageListener = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const { activeChat } = useAppContext();

  useEffect(() => {
    if (!socket || !user) return;

    // الانضمام لغرفة اليوزر الخاصة لتلقي الاشعارات
    socket.emit("join_room", `user_${user.id}`);
    console.log(`🔔 Joining personal notification room: user_${user.id}`);

    const handleNotification = (data) => {
      // 🕵️ التحقق مما إذا كان المستخدم يفتح نفس الشات حالياً
      if (activeChat) {
        const isSameRoute = data.routeId === activeChat.routeId;
        const isSameType = data.chatType === activeChat.chatType;

        // في الشات الخاص، نتأكد ان المرسل هو نفسه الشخص اللي بالشات
        let isSamePerson = true;
        if (data.chatType === "private" && activeChat.otherParticipantId) {
          isSamePerson = data.senderId === activeChat.otherParticipantId;
        }

        if (isSameRoute && isSameType && isSamePerson) {
          console.log("🚫 Suppressing notification for active chat");
          return; // لا تظهر الإشعار
        }
      }

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
