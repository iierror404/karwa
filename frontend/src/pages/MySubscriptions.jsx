import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Car,
  CalendarOff,
  MapPin,
  AlertCircle,
  Loader2,
  Navigation,
  LogOut,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const navigate = useNavigate();

  const fetchSubs = async () => {
    try {
      const res = await api.get("/bookings/my-bookings");
      const activeSubs = res.data.bookings.filter(
        (sub) => sub.status === "accepted",
      );
      setSubscriptions(activeSubs);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("فشل في تحديث الاشتراكات ❌");
    } finally {
      setLoading(false);
    }
  };

  // جلب الاشتراكات المقبولة
  useEffect(() => {
    fetchSubs();
  }, []);

  // وظيفة مغادرة الخط
  const handleLeaveRoute = (bookingId, routeName) => {
    setConfirmModal({
      isOpen: true,
      title: "مغادرة الخط 🚪",
      message: `هل أنت متأكد من مغادرة الخط: ${routeName}؟ هذا الإجراء سيؤدي إلى إلغاء اشتراكك.`,
      onConfirm: async () => {
        try {
          await api.post("/bookings/cancel", { bookingId });
          toast.success(`تمت مغادرة الخط ${routeName} بنجاح ✅`);
          fetchSubs();
        } catch (err) {
          toast.error("فشل في مغادرة الخط ❌");
        }
      },
    });
  };

  // وظيفة إبلاغ الغياب
  const handleNoShow = async (driverId, routeId, driverName) => {
    try {
      // إرسال طلب للباك أند 📢
      await api.post("/bookings/report-absence", {
        driverId,
        routeId,
      });

      toast.success(`تم إبلاغ الكابتن ${driverName} بأنك معطل غداً 👍`, {
        icon: "🛑",
        duration: 4000,
        style: {
          borderRadius: "20px",
          background: "#1E293B",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      });
    } catch (err) {
      console.error("Absence Report Error:", err);
      toast.error("فشل في إرسال البلاغ ❌");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F172A]">
        <Loader2 className="w-12 h-12 text-[#FACC15] animate-spin" />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-right overflow-x-hidden"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto p-4 pb-28">
        {/* Header - واجهة العناوين */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative mb-10 mt-6"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FACC15] opacity-5 blur-[100px] rounded-full"></div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-[#FACC15] text-black p-2.5 rounded-2xl shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
              🎫
            </span>
            اشتراكاتي
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium mr-1">
            إدارة رحلاتك اليومية والتواصل مع الكباتن 🚐
          </p>
        </motion.div>

        {/* قائمة الاشتراكات */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub, index) => (
                <motion.div
                  key={sub._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                    delay: index * 0.05,
                  }}
                  className="relative group bg-[#1E293B]/60 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-5 shadow-2xl hover:border-[#FACC15]/30 transition-all"
                >
                  {/* Driver Profile Section */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={
                            sub.driverId?.profileImg ||
                            `https://ui-avatars.com/api/?name=${sub.driverId?.fullName}&background=FACC15&color=000`
                          }
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FACC15]/20 shadow-lg"
                          alt="driver"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-[#1E293B] rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {sub.driverId?.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-[#FACC15] mt-1 font-bold">
                          <span className="text-[11px] uppercase tracking-wide">
                            {sub.driverId?.phone || "رقم الكابتن"}
                          </span>
                          <Phone size={14} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-xl text-[10px] font-black border border-green-500/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        متاح الآن
                      </div>
                      <button
                        onClick={() =>
                          handleLeaveRoute(
                            sub._id,
                            `${sub.routeId?.fromArea} - ${sub.routeId?.toArea}`,
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all"
                        title="خروج من الخط"
                      >
                        <LogOut size={12} />
                        مغادرة الخط
                      </button>
                    </div>
                  </div>

                  {/* Route Details - تفاصيل الطريق */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#0F172A]/80 p-4 rounded-[2rem] border border-gray-800/50">
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-1 font-bold">
                        <Navigation size={12} className="text-red-400" />{" "}
                        الانطلاق
                      </div>
                      <p className="text-white text-sm font-bold truncate">
                        {sub.routeId?.fromArea}
                      </p>
                    </div>
                    <div className="bg-[#0F172A]/80 p-4 rounded-[2rem] border border-gray-800/50">
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-1 font-bold">
                        <MapPin size={12} className="text-green-400" /> الوجهة
                      </div>
                      <p className="text-white text-sm font-bold truncate">
                        {sub.routeId?.toArea}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - أزرار التواصل */}
                  <div className="flex gap-3">
                    <motion.a
                      whileTap={{ scale: 0.95 }}
                      href={`tel:${sub.driverId?.phone}`}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm border border-gray-700 transition-all"
                    >
                      <Phone size={18} className="text-[#FACC15]" />
                      اتصال
                    </motion.a>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        navigate(`/chat/${sub.routeId?._id}?type=group`)
                      }
                      className="flex-[1.5] bg-[#FACC15] hover:bg-[#eab308] text-black py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-[0_10px_30px_-10px_rgba(250,204,21,0.4)] transition-all"
                    >
                      <MessageCircle size={18} />
                      دخول شات الخط
                    </motion.button>
                  </div>

                  {/* Absence Toggle - زر التعطيل */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleNoShow(
                        sub.driverId?._id,
                        sub.routeId?._id,
                        sub.driverId?.fullName,
                      )
                    }
                    className="w-full mt-4 group py-3.5 bg-red-500/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-dashed border-gray-800 hover:border-red-500/50 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-bold transition-all"
                  >
                    <CalendarOff size={16} />
                    أني باجر معطل، لا تمر عليه ✋
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 flex flex-col items-center"
              >
                <div className="bg-[#1E293B] w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gray-800 shadow-inner">
                  <AlertCircle size={48} className="text-gray-700" />
                </div>
                <h3 className="text-white font-black text-xl">
                  ما عندك أي اشتراك! 😕
                </h3>
                <p className="text-gray-500 text-sm mt-2 max-w-[200px] leading-relaxed font-medium">
                  احجز مقعدك بخطوط "كروة" وراح تظهر اشتراكاتك الفعالة هنا.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

export default MySubscriptions;
