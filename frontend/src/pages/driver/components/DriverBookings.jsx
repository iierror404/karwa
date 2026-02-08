import { Check, X, MessageSquare, Phone, Loader2 } from "lucide-react";
import { useBookings } from "../../../context/BookingContext"; // استدعاء الـ Hook الجديد 🔗

const DriverBookings = () => {
  // أخذنا البيانات والدوال من الـ Context مباشرة 😎
  const { bookings, loading, handleStatusUpdate } = useBookings();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="animate-spin text-[#FACC15]" size={40} />
      </div>
    );

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-white p-4 lg:p-10 font-cairo"
      dir="rtl"
    >
      <h1 className="text-2xl font-black mb-8 flex items-center gap-3">
        <div className="w-2 h-8 bg-[#FACC15] rounded-full"></div>
        طلبات الحجز الواردة 📩
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-20">
            ماكو أي طلبات حجز حالياً.. 🕸️
          </p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className={`bg-[#1E293B] border-2 rounded-[2.5rem] p-6 transition-all shadow-xl ${
                booking.status === "pending"
                  ? "border-gray-800"
                  : booking.status === "accepted"
                    ? "border-green-500/30"
                    : "border-red-500/30"
              }`}
            >
              {/* رأس الكارت: معلومات الراكب */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FACC15] to-orange-500 flex items-center justify-center text-[#0F172A] font-black text-xl shadow-lg">
                  {booking.passengerId?.fullName?.[0] || "P"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">
                    {booking.passengerId?.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-[#94A3B8] text-xs">
                    <Phone size={12} /> {booking.passengerId?.phone}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                    booking.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : booking.status === "accepted"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {booking.status === "pending"
                    ? "قيد الانتظار"
                    : booking.status === "accepted"
                      ? "تم القبول"
                      : "مرفوض"}
                </span>
              </div>

              {/* تفاصيل الخط المحجوز */}
              <div className="bg-[#0F172A] rounded-2xl p-4 mb-6 border border-gray-800">
                <p className="text-[10px] text-gray-500 mb-1">الخط المطلوب:</p>
                <p className="text-sm font-bold text-[#FACC15]">
                  {booking.routeId?.fromArea} ⬅️ {booking.routeId?.toArea}
                </p>
              </div>

              {/* رسالة الراكب */}
              {booking.message && (
                <div className="flex items-start gap-2 bg-blue-500/5 p-3 rounded-xl mb-6 border border-blue-500/10">
                  <MessageSquare
                    size={16}
                    className="text-blue-400 shrink-0 mt-1"
                  />
                  <p className="text-xs text-blue-200 italic">
                    "{booking.message}"
                  </p>
                </div>
              )}

              {/* أزرار التحكم */}
              {booking.status === "pending" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusUpdate(booking._id, "accepted")}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(22,163,74,0.2)]"
                  >
                    <Check size={18} /> قبول
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking._id, "rejected")}
                    className="bg-red-600/10 hover:bg-red-600 border border-red-600/50 text-red-500 hover:text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <X size={18} /> رفض
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverBookings;
