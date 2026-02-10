import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  X,
  User,
  Clock,
  AlertTriangle,
  Ticket,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { CHAT_TYPES, getAvatarUrl } from "../constants/constants";

const DriverNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookingNotifications, setBookingNotifications] = useState([]);

  const { socket } = useSocket();
  const { user } = useAuth();
  const {
    notifications: otherNotifications,
    unreadCount: otherUnreadCount,
    markAllAsRead,
  } = useNotification();

  const userId = user?.id || user?._id;

  // جلب الطلبات المعلقة (Pending) عند التحميل
  const fetchPendingBookings = async () => {
    if (!userId) return;
    try {
      const res = await api.get("/bookings/driver");
      const pending = res.data.bookings.filter((b) => b.status === "pending");
      setBookingNotifications(pending);
    } catch (err) {
      console.error("خطأ بجلب الإشعارات", err);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    const eventName = `new_booking_notification_${userId}`;

    const handleNewBooking = (data) => {
      console.log("🔔 New Booking Received:", data);
      const audio = new Audio("/sounds/notification_sound.mp3");
      audio.play().catch((e) => console.log("Audio play failed"));

      toast.dismiss();
      toast(data.msg, {
        icon: "🎟️",
        style: {
          borderRadius: "15px",
          background: "#1E293B",
          color: "#FACC15",
          border: "1px solid #FACC15",
        },
      });

      setBookingNotifications((prev) => [data.booking, ...prev]);
    };

    socket.on(eventName, handleNewBooking);
    return () => socket.off(eventName, handleNewBooking);
  }, [socket, userId]);

  const handleAction = async (id, status) => {
    try {
      toast.dismiss();
      const res = await api.patch(`/bookings/status/${id}`, { status });
      if (status === "accepted") {
        toast.success(res.data.msg);
      } else {
        toast.error("تم رفض الطلب");
      }
      setBookingNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error("فشلت العملية! 🔥");
    }
  };

  const totalUnread = bookingNotifications.length + otherUnreadCount;

  return (
    <div className="relative font-cairo" dir="rtl">
      {/* أيقونة الجرس */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllAsRead();
        }}
        className="bg-[#1E293B] p-3 rounded-2xl border border-gray-700 relative cursor-pointer hover:border-[#FACC15] transition-all"
      >
        <Bell size={24} className="text-[#FACC15]" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1E293B] animate-pulse">
            {totalUnread > 9 ? "+9" : totalUnread}
          </span>
        )}
      </div>

      {/* صندوق الإشعارات */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute left-0 mt-3 w-80 md:w-96 bg-[#1E293B] border border-gray-700 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1E293B]">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                مركز التنبيهات <Bell size={16} className="text-[#FACC15]" />
              </h3>
              {totalUnread > 0 && (
                <span className="text-[10px] bg-[#FACC15]/10 text-[#FACC15] px-2 py-1 rounded-lg">
                  {bookingNotifications.length} حجز • {otherUnreadCount} رسائل
                </span>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {bookingNotifications.length === 0 &&
              otherNotifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  <Clock className="mx-auto mb-3 opacity-20" size={40} />
                  لا توجد إشعارات جديدة حالياً..
                </div>
              ) : (
                <>
                  {/* طلبات الحجز */}
                  {bookingNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="p-4 border-b border-gray-800/50 hover:bg-[#0F172A]/40 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FACC15] to-orange-500 flex items-center justify-center text-[#0F172A] shrink-0 shadow-lg shadow-orange-900/20">
                          <Ticket size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-white truncate">
                              حجز جديد: {notif.passengerId?.fullName}
                            </p>
                            <span className="text-[9px] text-gray-500 italic">
                              الآن
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mb-3 truncate">
                            من {notif.routeId?.fromArea} إلى{" "}
                            {notif.routeId?.toArea}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleAction(notif._id, "accepted")
                              }
                              className="flex-1 bg-green-600 hover:bg-green-500 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1 shadow-md shadow-green-900/20"
                            >
                              <Check size={14} /> قبول
                            </button>
                            <button
                              onClick={() =>
                                handleAction(notif._id, "rejected")
                              }
                              className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-1.5 rounded-lg text-[11px] font-bold border border-red-500/20 transition-all"
                            >
                              رفض
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* رسائل الدردشة */}
                  {otherNotifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-b border-gray-800/50 hover:bg-[#0F172A]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 shrink-0 border border-gray-700">
                          <img
                            src={
                              notif.senderImage ||
                              getAvatarUrl(notif.senderName || "User")
                            }
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-white truncate">
                              {notif.senderName || "رسالة جديدة"}
                            </p>
                            <span className="text-[9px] text-gray-500">
                              {notif.chatType === "group" ? "مجموعة" : "خاص"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate line-clamp-1">
                            {notif.title || notif.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="p-3 text-center bg-[#0F172A]/30">
              <button
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-[#94A3B8] hover:text-[#FACC15] transition-colors font-medium"
              >
                إغلاق القائمة
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverNotifications;
