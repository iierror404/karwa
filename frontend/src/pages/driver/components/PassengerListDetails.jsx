import {
  Navigation,
  User,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const PassengerListDetails = ({ routeId, allBookings }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. فلترة الركاب مع التأكد من وجود البيانات
  const passengers = useMemo(() => {
    if (!allBookings || !Array.isArray(allBookings)) return [];
    return allBookings.filter((b) => b.routeId?._id === routeId);
  }, [allBookings, routeId]);

  // إذا لسبب ما الفلترة رجعت فارغة، ميسوي Render لـ "غير معروف" 🛑
  if (passengers.length === 0) return null;

  // 2. فحص حقيقي: هل البيانات المطلوبة (الأسماء والمناطق) وصلت فعلاً؟
  // سوينا check على أول عنصر بالمصفوفة المفلترة
  const isDataReady = passengers.length > 0 && passengers[0].routeId?.fromArea;

  const formatDate = (dateString) => {
    if (!dateString) return "----/--/--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // يظهر بشكل: 07/02/2026
  };

  const getExpiryDate = (dateString) => {
    if (!dateString) return "----/--/--";
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + 1); // إضافة شهر كامل ➕🗓️
    return date.toLocaleDateString("en-GB");
  };

  // داخل الـ Component مالتك تستخدمها هيج:
  const startDate = formatDate(passengers[0]?.bookingDate);
  const endDate = getExpiryDate(passengers[0]?.bookingDate);

  return (
    <div
      className="mb-4 border-t border-gray-800/50 pt-4 text-right lg:max-w-[60%] lg:mx-auto"
      dir="rtl"
    >
      {/* عرض اسم الخط - التعديل هنا 👇 */}
      <div className="mb-2 px-1">
        <span className="text-[10px] text-[#FACC15] font-bold block mb-1">
          اسم الخط:
        </span>
        {!isDataReady ? (
          // بمكان "غير معروف" نطلع وميض هادئ لحد ما تجهز الداتا 💡
          <div className="flex gap-2 items-center">
            <div className="h-4 w-20 bg-gray-800 animate-pulse rounded"></div>
            <span className="text-gray-600">-</span>
            <div className="h-4 w-20 bg-gray-800 animate-pulse rounded"></div>
          </div>
        ) : (
          <h3 className="text-sm font-black text-white animate-in fade-in duration-500">
            {passengers[0].routeId.fromArea} - {passengers[0].routeId.toArea} 📍
          </h3>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        // الزر ميتفعل إلا إذا اكو بيانات حقيقية
        className={`w-full flex items-center justify-between bg-[#0F172A] p-3 rounded-2xl border border-transparent transition-all group ${!isDataReady ? "opacity-60 cursor-not-allowed" : "hover:border-[#FACC15]"}`}
      >
        <div className="flex items-center gap-2">
          <div className="bg-[#FACC15] p-1.5 rounded-lg text-black">
            <User size={16} />
          </div>
          <span className="font-bold text-xs text-white">
            {isDataReady
              ? `الركاب المشتركين (${passengers.length}) 👥`
              : "جاري تحميل الركاب..."}
          </span>
        </div>
        {isDataReady && (
          <Navigation
            size={14}
            className={`text-[#FACC15] transform transition-transform ${isOpen ? "rotate-180" : "rotate-90"}`}
          />
        )}
      </button>

      {isOpen && isDataReady && (
        <div className="mt-3 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          {passengers.map((booking) => {
            const isSubscribed = passengers[0]?.status;

            return (
              <div
                key={booking._id}
                className="bg-[#0F172A]/40 p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      booking.passengerId?.profileImg ||
                      `https://ui-avatars.com/api/?name=${booking.passengerId?.fullName}&background=FACC15&color=000`
                    }
                    className="w-12 h-12 rounded-full border-2 border-[#FACC15]/30 object-cover"
                    alt="passenger"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-white truncate">
                        {booking.passengerId?.fullName} ✨
                      </p>
                      {isSubscribed === "accepted" ? (
                        <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                          <CheckCircle size={10} /> مشترك ✅
                        </span>
                      ) : (
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                          <XCircle size={10} /> غير مشترك ❌
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#94A3B8] mb-2">
                      <Phone size={10} />
                      <p className="text-[10px] font-mono tracking-wider">
                        {booking.passengerId?.phone || "07XXXXXXXXX"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-800/50">
                      <div>
                        <p className="text-[9px] text-gray-500 mb-0.5">
                          بدأ الاشتراك 📥
                        </p>
                        <div className="flex items-center gap-1 text-white text-[10px] font-bold">
                          <Calendar size={10} className="text-[#FACC15]" />
                          {startDate || "----/--/--"}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-500 mb-0.5">
                          انتهاء الاشتراك 📤
                        </p>
                        <div className="flex items-center gap-1 text-white text-[10px] font-bold">
                          <Calendar size={10} className="text-red-400" />
                          {endDate || "----/--/--"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* في حال فعلاً ماكو ركاب وره ما خلص التحميل */}
      {isDataReady && passengers.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-xs italic">
          لا يوجد ركاب في هذا الخط حالياً 🧊
        </div>
      )}
    </div>
  );
};

export default PassengerListDetails;
