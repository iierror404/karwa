import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Navigation,
  Clock,
  Star,
  Phone,
  Car,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const PassengerHome = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // لمعرفة إذا تم البحث أول مرة
  const [userBookings, setUserBookings] = useState([]);
  const {user} = useAuth();

  // بيانات البحث
  const [searchTerm, setSearchTerm] = useState({
    province: "",
    fromArea: "",
    toArea: "",
  });

  // 🛡️ دالة البحث مع الحماية من الحقول الفارغة
  const handleSearch = async (e) => {
    e.preventDefault();

    // التأكد من أن حقل واحد على الأقل ممتلئ
    if (
      !searchTerm.province.trim() &&
      !searchTerm.fromArea.trim() &&
      !searchTerm.toArea.trim()
    ) {
      return toast.error("اكتب اسم المنطقة أو المحافظة أولاً!", {
        icon: "⚠️",
        style: {
          borderRadius: "15px",
          background: "#1E293B",
          color: "#FACC15",
        },
      });
    }

    setLoading(true);
    try {
      // بناء الـ Query String
      const params = new URLSearchParams();
      if (searchTerm.province) params.append("province", searchTerm.province);
      if (searchTerm.fromArea) params.append("fromArea", searchTerm.fromArea);
      if (searchTerm.toArea) params.append("toArea", searchTerm.toArea);

      const res = await api.get(`/routes/search?${params.toString()}`);

      // التعديل هنا ليتناسب مع الـ Controller مالتك (data هو اسم المصفوفة)
      setRoutes(res.data.data);
      setHasSearched(true);

      if (res.data.data.length === 0) {
        toast("مالقينا خط حالياً بهذا المسار.. جرب غير منطقة", { icon: "😕" });
      }
    } catch (err) {
      console.error(err);
      toast.error("صارت مشكلة بالبحث، جرب مرة ثانية! ❌");
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة تجيب حجوزات الراكب (تتنفذ أول ما تفتح الصفحة)
  const fetchUserBookings = async () => {
    try {
      const res = await api.get("/bookings/my-bookings"); // روت يجيب حجوزات الراكب
      setUserBookings(res.data.bookings.map((b) => b.routeId._id)); // نخزن بس الـ IDs
    } catch (err) {
      console.log("User not logged in or no bookings");
    }
  };

  const handleBooking = async (route) => {

    // 1. حماية: إذا مو مسجل دخول
    if (!user) {
      return toast.error("عذرا, يجيب ان تسجل حساب اولأ", {
        icon: "⚠",
        style: {
          borderRadius: "15px",
          background: "#1E293B",
          color: "#FACC15",
        },
      });
    }

    // 2. تأكيد الحجز (اختياري بس ينطي احترافية)
    const confirm = window.confirm(
      `هل أنت متأكد من حجز مقعد في خط: ${route.fromArea}؟`,
    );
    if (!confirm) return;

    try {
      setLoading(true); // نكدر نستخدم Loading خاص بالحجز
      const res = await api.post("/bookings/request", {
        routeId: route._id,
        message: "طلب حجز مقعد", // نكدر نخلي اليوزر يكتب رسالة بعدين
      });

      if (res.data.success) {
        toast.success("تم إرسال طلب الحجز! السايق راح يوصله إشعار ✅", {
          duration: 4000,
          style: {
            borderRadius: "15px",
            background: "#1E293B",
            color: "#10B981",
          },
        });

        // 3. تحديث الـ State محلياً حتى الزر يتغير فوراً لـ "بانتظار الموافقة"
        setUserBookings((prev) => [...prev, route._id]);
      }
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.msg || "صارت مشكلة بالحجز، جرب مرة ثانية";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3. اللوجك المطور للزر بداخل الـ Map
  const renderBookingButton = (route) => {
    const isFull = route.avilableSeats <= 0;
    const alreadyBooked = userBookings.includes(route._id);

    if (isFull) {
      return (
        <button
          disabled
          className="flex-[3] bg-gray-700 text-gray-400 font-bold py-4 rounded-2xl cursor-not-allowed"
        >
          الخط فول (مكتمل) 🈵
        </button>
      );
    }

    else if (alreadyBooked) {
      return (
        <button
          disabled
          className="flex-[3] bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <Clock size={18} /> بانتظار الموافقة..
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleBooking(route)}
          className="flex-[3] bg-[#FACC15] text-black font-black py-4 rounded-2xl"
        >
          حجز مقعد 💺
        </button>
      );
    }
  };

  useEffect(() => {

    if (user) {
      fetchUserBookings();
    } else {
      console.log("الراكب يتصفح كـ ضيف (Guest) 🕵️‍♂️");
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-white font-cairo p-4 lg:p-8"
      dir="rtl"
    >
      {/* --- العنوان الرئيسي --- */}
      <div className="text-center mb-12 mt-6">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          بحث عن{" "}
          <span className="text-[#FACC15] drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">
            خط كروة
          </span>
        </h1>
        <p className="text-[#94A3B8] max-w-md mx-auto">
          أسهل طريقة حتى تلكي خط يوصلك لشغلك أو كليتك بكل راحة وأمان
        </p>
      </div>

      {/* --- 🔍 فورم البحث الـ VIP --- */}
      <div className="max-w-5xl mx-auto mb-16">
        <form
          onSubmit={handleSearch}
          className="bg-[#1E293B] p-2 md:p-3 rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center gap-3 transition-all focus-within:border-[#FACC15]/30"
        >
          {/* المحافظة */}
          <div className="w-full relative flex-1">
            <MapPin
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FACC15]"
              size={20}
            />
            <input
              value={searchTerm.province}
              onChange={(e) =>
                setSearchTerm({ ...searchTerm, province: e.target.value })
              }
              placeholder="المحافظة (مثلاً: واسط)"
              className="w-full bg-[#0F172A] border border-transparent rounded-[1.8rem] py-4 pr-12 pl-4 focus:bg-[#0F172A] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* من منطقة */}
          <div className="w-full relative flex-1">
            <Navigation
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FACC15]"
              size={20}
            />
            <input
              value={searchTerm.fromArea}
              onChange={(e) =>
                setSearchTerm({ ...searchTerm, fromArea: e.target.value })
              }
              placeholder="منطقة الانطلاق..."
              className="w-full bg-[#0F172A] border border-transparent rounded-[1.8rem] py-4 pr-12 pl-4 focus:bg-[#0F172A] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* زر البحث */}
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-[#FACC15] text-black font-black px-10 py-4 rounded-[1.8rem] shadow-[0_8px_20px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Search size={22} /> بحث
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- 🚐 عرض النتائج --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {routes.map((route) => (
          <div
            key={route._id}
            className="bg-[#1E293B] border border-gray-800 rounded-[2.8rem] p-7 hover:border-[#FACC15]/40 transition-all group relative"
          >
            {/* معلومات السائق (Populated Data) */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={
                    route.driverId?.profileImg ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=driver"
                  }
                  alt="Driver"
                  className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-[#0F172A] shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#FACC15] p-1.5 rounded-xl border-4 border-[#1E293B]">
                  <Car size={14} className="text-black" />
                </div>
              </div>
              <div>
                <h4 className="font-black text-white text-lg">
                  {route.driverId?.fullName || "كابتن الخط"}
                </h4>
                <div className="flex items-center gap-1.5 text-[#FACC15]">
                  <Star size={14} fill="#FACC15" />
                  <span className="text-xs font-bold">
                    4.9 • {route.carType}
                  </span>
                </div>
              </div>
            </div>

            {/* تفاصيل المسار */}
            <div className="bg-[#0F172A]/60 rounded-[2rem] p-5 border border-gray-800/50 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] mt-1 shadow-[0_0_8px_#FACC15]"></div>
                <p className="text-sm font-bold">
                  <span className="text-gray-500 text-xs block">من:</span>
                  {route.fromArea}
                </p>
              </div>
              <div className="flex items-start gap-3 border-t border-gray-800/50 pt-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shadow-[0_0_8px_#ef4444]"></div>
                <p className="text-sm font-bold">
                  <span className="text-gray-500 text-xs block">إلى:</span>
                  {route.toArea}
                </p>
              </div>
            </div>

            {/* تفاصيل الكروة والمقاعد */}
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  سعر المقعد
                </span>
                <span className="text-xl font-black text-[#FACC15]">
                  {route.price.toLocaleString()}{" "}
                  <small className="text-[10px]">د.ع</small>
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-gray-500 block uppercase">
                  المقاعد المتاحة
                </span>
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                  {route.avilableSeats} من {route.totalSeats}
                </span>
              </div>
            </div>

            {/* أزرار الحجز والاتصال */}
            <div className="flex gap-3">
              {renderBookingButton(route)}
              {/* <button className="flex-[3] bg-[#FACC15] text-black font-black py-4 rounded-2xl hover:shadow-[0_10px_20px_rgba(250,204,21,0.2)] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                حجز مقعد 💺
              </button>*/}
              <a
                href={`tel:${route.driverId?.phone}`}
                className="flex-1 bg-[#1E293B] border border-gray-700 rounded-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#FACC15] hover:border-[#FACC15] transition-all"
              >
                <Phone size={22} />
              </a>
            </div>
          </div>
        ))}

        {/* حالة عدم وجود نتائج بعد البحث */}
        {hasSearched && routes.length === 0 && !loading && (
          <div className="col-span-full text-center py-20">
            <AlertCircle size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-bold text-lg">
              للأسف، ماكو خطوط مطابقة لهذا البحث حالياً..
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerHome;
