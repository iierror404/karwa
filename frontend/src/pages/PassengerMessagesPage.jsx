import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight, MessageCircle, Clock, Trash2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../constants/constants";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

const PassengerMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const navigate = useNavigate();

  const { socket } = useSocket();

  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/my-conversations");
      setConversations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = (e, conv) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "حذف المحادثة 🗑️",
      message: "هل أنت متأكد من حذف هذه المحادثة؟ ستُحذف جميع الرسائل نهائياً.",
      onConfirm: async () => {
        try {
          await api.delete(
            `/chat/conversation/${conv.route._id}?otherUserId=${conv.otherPerson._id}`,
          );
          toast.success("تم حذف المحادثة بنجاح ✅");
          fetchConversations();
        } catch (err) {
          toast.error("فشل حذف المحادثة ❌");
        }
      },
    });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 🔔 استلام التحديثات الفورية لصندوق الرسائل
  useEffect(() => {
    if (!socket) return;

    const handleMessageNotification = (notif) => {
      if (notif.type !== "message") return;

      setConversations((prev) => {
        const existingIdx = prev.findIndex(
          (c) =>
            c.route._id === notif.routeId &&
            c.otherPerson._id === notif.senderId,
        );

        if (existingIdx !== -1) {
          // تحديث محادثة موجودة
          const updated = [...prev];
          const conv = updated[existingIdx];

          updated[existingIdx] = {
            ...conv,
            lastMessage: {
              ...conv.lastMessage,
              content: notif.body,
              createdAt: new Date().toISOString(),
              sender: notif.senderId,
            },
            unreadCount: (conv.unreadCount || 0) + 1,
          };

          // نقل المحادثة للأعلى
          const item = updated.splice(existingIdx, 1)[0];
          updated.unshift(item);
          return updated;
        } else {
          // إذا كانت محادثة جديدة تماماً، يفضل إعادة الجلب من السيرفر لضمان جلب كل البيانات (Route info etc)
          // أو يمكننا "حقن" كائن بسيط، لكن الأجمل إعادة الجلب لتجنب التعقيد
          const fetchConversations = async () => {
            try {
              const res = await api.get("/chat/my-conversations");
              setConversations(res.data.data);
            } catch (err) {}
          };
          fetchConversations();
          return prev;
        }
      });
    };

    socket.on("message_notification", handleMessageNotification);

    return () => {
      socket.off("message_notification", handleMessageNotification);
    };
  }, [socket]);

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-white font-cairo p-4 pb-20"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-[#1E293B] rounded-xl text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-2xl font-black text-white">صندوق الرسائل 📩</h1>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">
            جاري تحميل المحادثات...
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv, idx) => {
            const hasUnread = conv.unreadCount > 0;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/chat/${conv.route._id}?type=private`)}
                className={`bg-[#1E293B] p-4 rounded-2xl border ${
                  hasUnread
                    ? "border-[#FACC15] shadow-[#FACC15]/5"
                    : "border-gray-800"
                } hover:border-[#FACC15]/30 cursor-pointer transition-all active:scale-98 shadow-lg relative`}
              >
                {hasUnread && (
                  <div className="absolute -top-2 -right-2 bg-[#FACC15] text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10 animate-bounce">
                    {conv.unreadCount}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      conv.otherPerson?.profileImg ||
                      `https://ui-avatars.com/api/?name=${conv.otherPerson?.fullName}&background=random`
                    }
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                    alt="driver"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4
                        className={`font-bold text-white text-lg ${hasUnread ? "text-[#FACC15]" : ""}`}
                      >
                        {conv.otherPerson?.fullName}{" "}
                        <span className="text-xs text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-md mr-2">
                          سائق
                        </span>
                      </h4>
                      <span className="text-[10px] text-gray-500">
                        {new Date(
                          conv.lastMessage.createdAt,
                        ).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <p
                      className={`text-sm truncate dir-rtl text-right ${hasUnread ? "text-white font-bold" : "text-gray-400"}`}
                    >
                      {conv.lastMessage.sender === conv.otherPerson?._id
                        ? ""
                        : "أنت: "}
                      {conv.lastMessage.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>
                          خط: {conv.route.fromArea} ⬅ {conv.route.toArea}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv)}
                        className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                        title="حذف المحادثة"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-500">
            <MessageCircle size={60} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">ما عندك أي محادثات سابقة 📭</p>
            <p className="text-sm mt-2">
              ابدأ بالتفاوض مع السائقين من خلال البحث في الخطوط
            </p>
          </div>
        )}
      </div>

      {/* نافذة التأكيد المخصصة ✨ */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

export default PassengerMessagesPage;
