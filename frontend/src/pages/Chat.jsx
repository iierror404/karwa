import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext"; // استدعاء السوكيت
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowRight,
  Phone,
  User,
  MapPin,
  Ticket,
  MessageSquare,
} from "lucide-react";
import {
  API_ENDPOINTS,
  CHAT_TYPES,
  getAvatarUrl,
  UI_COLORS,
  ERROR_MESSAGES,
  USER_ROLES,
  SOCKET_EVENTS
} from "../constants/constants";

// 🎨 Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const Chat = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengerIdParam = searchParams.get("passengerId"); // للسائق لما يفتح شات محدد

  // تحديد نوع الشات: اذا اكو passengerId يعني برايفت (تفاوض)، والا فهو (جروب الخط)
  // ملاحظة: الراكب دائماً "تفاوض" الا اذا دخل للجروب العام (ميزة مستقبلية)
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket(); // 🟢 سحبنا قائمة المتصلين

  const chatType = searchParams.get("type") || CHAT_TYPES.PRIVATE; // private | group

  // --- 📊 الـ States ---
  const [messages, setMessages] = useState([]); // قائمة الرسائل
  const [newMessage, setNewMessage] = useState(""); // نص الرسالة الجديد
  const [routeData, setRouteData] = useState(null); // معلومات الخط
  const [otherUser, setOtherUser] = useState(null); // معلومات الطرف الثاني (السايق او الراكب)
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null); // للنزول لآخر رسالة

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- 🔄 1. جلب البيانات عند فتح الصفحة ---
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);

        // 1. جلب تفاصيل الخط أولاً
        const routeRes = await api.get(`/routes/${routeId}`);
        const route = routeRes.data;
        setRouteData(route);

        // 2. تحديد الطرف الثاني 👤
        let targetId = null;
        let fetchedOtherUser = null;

        if (chatType === CHAT_TYPES.GROUP) {
          fetchedOtherUser = {
            fullName: "شات الخط الجماعي 🚌",
            profileImg: route.driverId?.profileImg,
            phone: null,
            isGroup: true,
          };
        } else {
          // شات خاص
          if (user.role === USER_ROLES.PASSENGER) {
            targetId = route.driverId?._id || route.driverId;
            fetchedOtherUser = route.driverId;
          } else if (user.role === USER_ROLES.DRIVER) {
            targetId = passengerIdParam;
            // تحقق إضافي من صحة الايدي
            if (targetId && targetId !== "undefined" && targetId !== "null") {
              try {
                const userRes = await api.get(`/user/${targetId}`);
                fetchedOtherUser = userRes.data;
              } catch (e) {
                console.error("Failed to fetch user info", e);
                fetchedOtherUser = { fullName: "الراكب", _id: targetId };
              }
            } else {
              targetId = null; // الغاء الايدي الفاسد
            }
          }
        }

        setOtherUser(fetchedOtherUser);
        console.log("Target ID:", targetId);

        // 3. جلب التاريخ
        // اذا كنت سائق وما عندي targetId صالح، نحاول نجيب الكل (معتمدة على الباك اند)
        // او ننتظر؟ لا، نجرب

        const historyParams = { chatType };
        if (targetId) historyParams.otherUserId = targetId;

        if (targetId || chatType === CHAT_TYPES.GROUP) {
          const historyRes = await api.get(
            API_ENDPOINTS.CHAT.HISTORY(routeId),
            {
              params: historyParams,
            },
          );
          setMessages(historyRes.data.data);

          // تحسين: استنتاج اسم الراكب من الرسائل
          if (
            chatType === CHAT_TYPES.PRIVATE &&
            user.role === USER_ROLES.DRIVER &&
            historyRes.data.data.length > 0 &&
            !fetchedOtherUser?._id
          ) {
            const msgFromPassenger = historyRes.data.data.find(
              (m) => (m.sender._id || m.sender) === targetId,
            );
            if (msgFromPassenger && msgFromPassenger.sender.fullName) {
              setOtherUser(msgFromPassenger.sender);
            }
          }
        }
      } catch (err) {
        console.error(err);
        toast.error(ERROR_MESSAGES.CHAT_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };

    if (user && routeId) {
      initChat();
    }
  }, [routeId, chatType, passengerIdParam, user]);

  // --- 🔌 2. الانضمام للغرفة (منفصل لضمان وجود السوكيت) ---
  useEffect(() => {
    if (!socket || !user || loading) return;

    let roomName;
    const currentUserId = user.id || user._id;

    // بناء اسم الغرفة بنفس المنطق
    // ملاحظة: نحتاج نعرف targetId هنا ايضاً، وهذا يطلب اننا نجيبه من الـ state
    // لهذا السبب، يفضل نخزن roomName بالـ state عند تحميل البيانات

    // 💡 حل سريع: نعيد حساب المنطق هنا، لكن نحتاج otherUser يكون محمل
    if (chatType === CHAT_TYPES.GROUP) {
      roomName = `route_${routeId}`;
    } else {
      const pId =
        user.role === USER_ROLES.PASSENGER
          ? currentUserId
          : otherUser?._id || passengerIdParam;
      if (pId) {
        roomName = `negotiation_${routeId}_${pId}`;
      }
    }

    if (roomName) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomName);
      console.log(`🔌 Socket Joined Room: ${roomName}`);
    }

    // تنظيف عند تغيير الغرفة
    return () => {
      if (roomName) socket.emit("leave_room", roomName);
    };
  }, [socket, routeId, chatType, passengerIdParam, user, otherUser, loading]);

  // --- 📩 2. استلام الرسائل الفورية ---
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // نتأكد ان الرسالة تخصنا (ولو احنا سوينا Join لغرفة محددة بس زيادة حرص)
      console.log("New Message Received:", msg);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [socket]);

  // سكرول تلقائي عند تحديث الرسائل 📜
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- 📤 3. إرسال رسالة ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // تحديد المستلم (للاشعارات)
      // اذا اني راكب، المستلم هو السايق
      // اذا اني سايق، المستلم هو الراكب (otherUser._id)
      let receiverId = null;
      if (chatType === CHAT_TYPES.PRIVATE) {
        receiverId =
          user.role === USER_ROLES.PASSENGER ? routeData.driverId?._id : otherUser?._id;
      }

      // ارسال للباك اند
      const res = await api.post(API_ENDPOINTS.CHAT.SEND, {
        routeId,
        content: newMessage,
        chatType,
        receiverId, // مهم جداً للاشعارات والغرف الخاصة
      });

      // ملاحظة: ماكو داعي نضيف الرسالة يدوياً هنا، لأن السوكيت رح يرجعها النا (new_message)

      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast.error(ERROR_MESSAGES.CHAT_SEND_FAILED);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col font-cairo"
      dir="rtl"
    >
      {/* 1. الخلفية والاضاءة ✨ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15] blur-[100px] opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 blur-[120px] opacity-10 rounded-full"></div>
      </div>

      {/* 2. الهيدر (معلومات الطرف الثاني) 🔝 */}
      <div className="relative bg-[#1E293B]/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-4 shadow-xl z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-700/50 rounded-full transition-colors text-gray-400"
        >
          <ArrowRight size={24} />
        </button>

        {!loading && otherUser ? (
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={
                  otherUser.profileImg ||
                  getAvatarUrl(otherUser.fullName, "FACC15", "000")
                }
                className="w-12 h-12 rounded-full object-cover border-2 border-[#FACC15]/20 shadow-md"
                alt="User"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1E293B]"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {otherUser?.fullName || "جاري التحميل..."}
                {/* 🟢 مؤشر الاتصال */}
                {otherUser?._id && onlineUsers.includes(otherUser._id) && (
                  <span
                    className="w-2.5 h-2.5 bg-green-500 rounded-full border border-[#1E293B] animate-pulse"
                    title="متصل الآن"
                  ></span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                {chatType === CHAT_TYPES.GROUP
                  ? "دردشة جماعية للخط"
                  : routeData
                    ? `${routeData.fromArea} ⬅ ${routeData.toArea}`
                    : "جاري التحميل..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 animate-pulse">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="w-32 h-4 bg-gray-700 rounded"></div>
              <div className="w-20 h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        )}

        <div className="flex gap-2 text-gray-400 items-center">
          {/* زر حجز المقعد (يظهر فقط للركاب وفي الشات الخاص) 🎫 */}
          {user.role === USER_ROLES.PASSENGER && chatType === CHAT_TYPES.PRIVATE && (
            <button
              onClick={() => navigate(`/book/${routeId}`)} // توجيه لصفحة الحجز (أو كود الحجز)
              className="bg-[#FACC15] text-black px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.4)] animate-pulse"
            >
              احجز مقعدك 🎫
            </button>
          )}

          {otherUser?.phone && (
            <a
              href={`tel:${otherUser.phone}`}
              className="p-3 bg-gray-800 rounded-full hover:bg-[#FACC15] hover:text-black transition-all"
            >
              <Phone size={20} />
            </a>
          )}
        </div>
      </div>

      {/* 3. منطقة الرسائل (Chat Area) 💬 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pb-24">
        {loading ? (
          <div className="text-center text-gray-500 mt-20">
            جاري تحميل المحادثة... 🔄
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
            <MessageSquare size={60} className="mb-4 text-[#FACC15]" />
            <p>بداية المحادثة.. قل مرحباً 👋</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {messages.map((msg, index) => {
              // 🛠️ إصلاح: توحيد الايدي كنصوص للمقارنة
              const currentUserId = (user.id || user._id).toString();
              const senderId = (msg.sender._id || msg.sender).toString();
              const isMe = senderId === currentUserId;

              return (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <img
                      src={
                        msg.sender.profileImg ||
                        getAvatarUrl(msg.sender.fullName || "User", "random")
                      }
                      className="w-8 h-8 rounded-full object-cover mb-1 opacity-70"
                    />
                  )}

                  <div
                    className={`
                            max-w-[75%] p-4 rounded-2xl relative shadow-lg
                            ${
                              isMe
                                ? "bg-[#FACC15] text-black rounded-br-none"
                                : "bg-[#1E293B] text-white border border-gray-700 rounded-bl-none"
                            }
                        `}
                  >
                    <p className="text-sm font-medium leading-relaxed">
                      {msg.content}
                    </p>
                    <span
                      className={`text-[10px] block mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. حقل الإدخال (Input Area) ⌨️ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1E293B]/90 backdrop-blur border-t border-gray-800 z-10">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-4xl mx-auto w-full"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-[#0F172A] text-white border border-gray-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#FACC15] transition-all placeholder:text-gray-600 shadow-inner"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#FACC15] text-black p-4 rounded-2xl hover:bg-[#eab308] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(250,204,21,0.3)]"
          >
            <Send
              size={24}
              className={
                newMessage.trim() ? "-translate-x-0.5 translate-y-0.5" : ""
              }
            />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
