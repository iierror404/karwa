import { useState, useEffect } from "react";
import { Bell, Check, X, User, MessageSquare, Clock } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const DriverNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب الطلبات المعلقة (Pending)
  const fetchPendingBookings = async () => {
    try {
      const res = await api.get("/bookings/driver");
      // نفلتر بس الطلبات المعلقة حتى تطلع كإشعار
      const pending = res.data.bookings.filter((b) => b.status === "pending");
      setNotifications(pending);
      setUnreadCount(pending.length);
      console.log("Pending Bookings: ", res)
    } catch (err) {
      console.error("خطأ بجلب الإشعارات", err);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
    // نكدر نسوي Interval حتى يشيك كل دقيقة مثلاً
    const interval = setInterval(fetchPendingBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await api.patch(`/bookings/status/${id}`, { status });
      toast.success(res.data.msg);
      // نحذف الإشعار من القائمة بعد المعالجة
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      toast.error("فشلت العملية! 🔥");
    }
  };

  return (
    <div className="relative font-cairo" dir="rtl">
      {/* أيقونة الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-[#FACC15] transition-colors bg-[#1E293B] rounded-full border border-gray-700"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0F172A] animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* صندوق الإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 md:w-96 bg-[#1E293B] border border-gray-700 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1E293B]">
            <h3 className="font-black text-sm text-white">
              إشعارات الحجز الجدیدة 📩
            </h3>
            <span className="text-[10px] bg-[#FACC15]/10 text-[#FACC15] px-2 py-1 rounded-lg">
              قيد الانتظار
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
                    <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center text-black font-bold shrink-0">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        طلب من: {notif.passengerId?.fullName}
                      </p>
                      <p className="text-[10px] text-gray-500 mb-2">
                        المسار: {notif.routeId?.fromArea} ⬅️{" "}
                        {notif.routeId?.toArea}
                      </p>

                      {/* أزرار سريعة */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(notif._id, "accepted")}
                          className="flex-1 bg-green-600 hover:bg-green-500 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
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
      )}
    </div>
  );
};

export default DriverNotifications;
