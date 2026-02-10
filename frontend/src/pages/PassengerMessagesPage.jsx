import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight, MessageCircle, Clock } from "lucide-react";

const PassengerMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchConversations();
  }, []);

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
          conversations.map((conv, idx) => (
            <div
              key={idx}
              onClick={() =>
                navigate(
                  `/chat/${conv._id.route}?type=private`,
                  // ما يحتاج نمرر passengerId لان اني الراكب، بس السايق يحتاجه
                )
              }
              className="bg-[#1E293B] p-4 rounded-2xl border border-gray-800 hover:border-[#FACC15]/30 cursor-pointer transition-all active:scale-98 shadow-lg"
            >
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
                    <h4 className="font-bold text-white text-lg">
                      {conv.otherPerson?.fullName}{" "}
                      <span className="text-xs text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5 rounded-md mr-2">
                        سائق
                      </span>
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString(
                        "en-GB",
                      )}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm truncate dir-rtl text-right">
                    {conv.lastMessage.content}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>
                      خط: {conv.route.fromArea} ⬅ {conv.route.toArea}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default PassengerMessagesPage;
