import { useState, useEffect } from "react";
import { Bell, Check, X, User, Clock, AlertTriangle } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

const DriverNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { socket } = useSocket();
  const { user } = useAuth();

  // جلب الطلبات المعلقة (Pending) عند التحميل
  const fetchPendingBookings = async () => {
    try {
      const res = await api.get("/bookings/driver");
      // نفلتر بس الطلبات المعلقة
      const pending = res.data.bookings.filter((b) => b.status === "pending");
      setNotifications(pending);
      setUnreadCount(pending.length);
      console.log("Pending Bookings: ", res.data);
    } catch (err) {
      console.error("خطأ بجلب الإشعارات", err);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  // 🔌 الاستماع للسوكيت - Socket.io Listener
  useEffect(() => {
    if (!socket || !user) return;

    const eventName = `new_booking_notification_${user._id}`;

    // الاستماع لحدث طلب الحجز الجديد
    const handleNewBooking = (data) => {
      console.log("🔔 إشعار جديد من السوكيت:", data);

      // تشغيل صوت تنبيه خفيف (اختياري)
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.log("Audio play failed"));

      toast(data.msg, {
        icon: "🎟️",
        style: {
          borderRadius: "15px",
          background: "#1E293B",
          color: "#FACC15",
          border: "1px solid #FACC15",
        },
      });

      // نضيف الطلب الجديد للقائمة فوراً بدون ريفريش
      setNotifications((prev) => [data.booking, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on(eventName, handleNewBooking);

    // تنظيف المستمع عند الخروج
    return () => {
      socket.off(eventName, handleNewBooking);
    };
  }, [socket, user]);

  const handleAction = async (id, status) => {
    try {
      const res = await api.patch(`/bookings/status/${id}`, { status });

      if (status === "accepted") {
        toast.success(res.data.msg);
      } else {
        toast.error("تم رفض الطلب");
      }

      // نحذف الإشعار من القائمة بعد المعالجة
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      toast.error("فشلت العملية! 🔥");
    }
  };

  return (
    <div className="relative font-cairo" dir="rtl">
      {/* أيقونة الجرس */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1E293B] p-3 rounded-2xl border border-gray-700 relative cursor-pointer hover:border-[#FACC15] transition-all"
      >
        <Bell size={24} className="text-[#FACC15]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1E293B] animate-pulse"></span>
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
              <h3 className="font-black text-sm text-white">
                إشعارات الحجز والطلبات 📩
              </h3>
              <span className="text-[10px] bg-[#FACC15]/10 text-[#FACC15] px-2 py-1 rounded-lg">
                {unreadCount} قيد الانتظار
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <Clock className="mx-auto mb-2 opacity-20" size={32} />
                  لا توجد طلبات حجز جديدة حالياً..
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-4 border-b border-gray-800/50 hover:bg-[#0F172A]/40 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                          notif.type === "absence"
                            ? "bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg shadow-red-900/20"
                            : "bg-gradient-to-br from-[#FACC15] to-orange-500 text-[#0F172A]"
                        }`}
                      >
                        {notif.type === "absence" ? (
                          <AlertTriangle size={20} />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          طلب من: {notif.passengerId?.fullName || "راكب"}
                        </p>
                        <p className="text-[10px] text-gray-500 mb-2">
                          المسار: {notif.routeId?.fromArea} ⬅️{" "}
                          {notif.routeId?.toArea}
                        </p>

                        {/* أزرار سريعة */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(notif._id, "accepted")}
                            className="flex-1 bg-green-600 hover:bg-green-500 py-1.5 rounded-lg text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Check size={14} /> قبول
                          </button>
                          <button
                            onClick={() => handleAction(notif._id, "rejected")}
                            className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-1.5 rounded-lg text-[11px] font-bold border border-red-500/20 transition-colors flex items-center justify-center gap-1"
                          >
                            <X size={14} /> رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 text-center bg-[#0F172A]/30">
              <button className="text-[11px] text-[#94A3B8] hover:text-[#FACC15] transition-colors">
                عرض جميع الحجوزات 🔎
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverNotifications;
