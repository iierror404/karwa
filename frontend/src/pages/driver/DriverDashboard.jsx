import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Car,
  User,
  Plus,
  Navigation,
  Loader2,
  Bell,
  AlertCircle,
  Check,
  X,
  Menu,
  Users,
  LogOut,
  ChevronLeft,
  SquareCheckBigIcon,
  XCircle,
  AlertTriangle,
  LogOutIcon,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-hot-toast";
import AddRouteModal from "../../components/AddRouteModal";
import PassengerListDetails from "./components/PassengerListDetails";
import Sidebar from "./components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { useRoutes } from "../../context/RouteContext";
import DriverBookings from "./components/DriverBookings";

const DriverDashboard = () => {
  // 1. استخدام الكونتيكست بدل الـ Local States 🔄
  const { user, logout } = useAuth(); // لجلب بيانات السائق (الاسم، الصورة، الـ ID)
  const { routes, setRoutes } = useRoutes(); // لجلب وإدارة الخطوط
  const { setSidebarOpen } = useAppContext(); // لإدارة حالة السايدبار العامة

  // 2. الـ States الخاصة بالداشبورد فقط 📊
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigate = useNavigate();

  // --- 🔄 دالة تحديث قائمة الخطوط (مربوطة بالـ RouteContext) ---
  const refreshRoutes = async () => {
    try {
      const res = await api.get("/routes/my-routes");
      setRoutes(res.data); // تحديث الكونتيكست العام
      console.log("تم تحديث الخطوط بنجاح! 🚀");
    } catch (err) {
      console.error("خطأ بجلب الخطوط:", err);
    }
  };

  // --- 📩 دالة جلب طلبات الحجز (الإشعارات) ---
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/bookings/driver");

      // الطلبات الجديدة (بانتظار الموافقة) 🔔
      const pending = res.data.bookings.filter((b) => b.status === "pending");
      setNotifications(pending);

      // الركاب المثبتين (المقبولين) ✅
      const accepted = res.data.bookings.filter((b) => b.status === "accepted");
      setAcceptedBookings(accepted);
    } catch (err) {
      console.error("خطأ بجلب البيانات:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  // --- ✅ دالة القبول أو الرفض ---
  const handleBookingAction = async (id, status) => {
    try {
      await api.patch(`/bookings/status/${id}`, { status });

      if (status === "accepted") {
        toast.success("تم قبول الراكب بنجاح! ✅");
      } else {
        toast.error("تم رفض الطلب ❌");
      }

      // تحديث فوري للقوائم
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      fetchNotifications(); // إعادة جلب للتأكد من المزامنة
      refreshRoutes(); // تحديث المقاعد المتاحة في الكونتيكست
    } catch (err) {
      toast.error("فشلت العملية، جرب مرة ثانية 🔥");
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // جلب كل البيانات سوية
        await Promise.all([refreshRoutes(), fetchNotifications()]);
      } catch (err) {
        toast.error("فشل جلب البيانات! 📶");
      } finally {
        setLoading(false);
      }
    };

    console.log(user);

    initData();

    // تحديث تلقائي كل دقيقة
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-white font-cairo p-4 lg:p-8"
      dir="rtl"
    >
      {/* --- الهيدر (Header) --- */}
      <div className="flex justify-between items-center mb-10">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex items-center gap-4">
          {user.status === "approved" && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer p-2 bg-[#1E293B] rounded-xl text-white"
            >
              <Menu size={24} />
            </button>
          )}
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">
              لوحة التحكم ✨
            </h1>
            <p className="text-[#94A3B8] text-xs">مرحبا {user?.fullName}</p>
          </div>
        </div>

        <div className="relative font-cairo">
          {/* الجرس */}
          {user.status === "approved" ? (
            <div
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-[#1E293B] p-3 rounded-2xl border border-gray-700 relative cursor-pointer hover:border-[#FACC15] transition-all"
            >
              <Bell size={24} className="text-[#FACC15]" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1E293B] animate-pulse"></span>
              )}
            </div>
          ) : (
            <button
              onClick={logout}
              title="تسجيل خروج"
              className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-2xl cursor-pointer"
            >
              <LogOutIcon size={20} />
            </button>
          )}

          {/* صندوق الإشعارات */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              ></div>

              <div className="absolute left-0 mt-4 w-80 md:w-[400px] bg-[#1E293B] border-2 border-gray-700 rounded-[2rem] shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-[#1e293b]">
                  <h3 className="font-black text-white text-sm">
                    طلبات الحجز الجديدة 📩
                  </h3>
                  <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {notifications.length}
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto bg-[#1e293b]">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Loader2 className="animate-spin mx-auto text-[#FACC15]" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 text-xs font-bold">
                      لا توجد طلبات جديدة حالياً.. 🧊
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="p-4 border-b border-gray-800/50 hover:bg-[#0F172A]/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FACC15] to-orange-500 flex items-center justify-center text-[#0F172A] font-black shrink-0">
                            <User size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-white truncate">
                                {notif.passengerId?.fullName || "راكب مجهول"}
                              </h4>
                              <span className="text-[10px] text-[#FACC15] font-mono">
                                {notif.routeId?.price} د.ع
                              </span>
                            </div>
                            <p className="text-[11px] text-[#94A3B8] mt-1 mb-3">
                              يريد حجز مقعد في خط:{" "}
                              <span className="text-gray-300 font-bold">
                                {notif.routeId?.fromArea}
                              </span>
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleBookingAction(notif._id, "accepted")
                                }
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-lg shadow-green-900/20"
                              >
                                <Check size={14} /> قبول
                              </button>
                              <button
                                onClick={() =>
                                  handleBookingAction(notif._id, "rejected")
                                }
                                className="flex-1 bg-gray-800 text-red-500 hover:bg-red-500 hover:text-white text-[11px] font-bold py-2 rounded-xl transition-all border border-red-500/20"
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
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            /* --- حالة التحميل 🔃 --- */
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-[#FACC15]" size={40} />
              <p className="text-[#94A3B8] animate-pulse font-bold">
                جاري جلب بياناتك... 🔃
              </p>
            </div>
          ) : user.status === "pending" ? (
            /* --- حالة قيد الانتظار ⏳ --- */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="bg-[#1E293B] border border-[#FACC15]/20 rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden max-w-md w-full">
                <div className="absolute top-0 inset-x-0 h-2 bg-[#FACC15] shadow-[0_0_15px_#FACC15]"></div>
                <div className="bg-[#FACC15]/10 p-6 rounded-3xl text-[#FACC15] animate-bounce">
                  <Clock size={60} />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-white">
                    قيد المراجعة ⏳
                  </h2>
                  <p className="text-gray-400 font-bold leading-relaxed">
                    أهلاً بك {user.fullName}! بياناتك الآن قيد التدقيق من قبل
                    الإدارة. سنقوم بتفعيل حسابك قريباً جداً.
                  </p>
                </div>
              </div>
            </div>
          ) : user.status === "rejected" ? (
            /* --- حالة الرفض ❌ --- */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="bg-[#1E293B] border border-red-500/20 rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden max-w-md w-full">
                <div className="absolute top-0 inset-x-0 h-2 bg-red-500 shadow-[0_0_15px_#ef4444]"></div>
                <div className="bg-red-500/10 p-6 rounded-3xl text-red-500">
                  <XCircle size={60} />
                </div>
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-black text-white">
                    تم رفض الطلب 🔴
                  </h2>
                  <div className="bg-[#0F172A] p-4 rounded-2xl border border-gray-800">
                    <p className="text-gray-500 text-xs mb-1 font-bold italic underline">
                      سبب الرفض المذكور:
                    </p>
                    <p className="text-red-400 font-black">
                      {user?.message ||
                        "لم يتم ذكر سبب محدد، يرجى التواصل مع الدعم."}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm font-bold">
                    يرجى تعديل البيانات المطلوبة وإعادة المحاولة.
                  </p>
                </div>
              </div>
            </div>
          ) : user.status === "banned" ? (
            /* --- حالة الحساب الموقوف ⚠️ --- */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="bg-[#1E293B] border border-orange-500/20 rounded-[3rem] p-10 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden max-w-md w-full">
                <div className="absolute top-0 inset-x-0 h-2 bg-orange-500 shadow-[0_0_15px_#f97316]"></div>
                <div className="bg-orange-500/10 p-6 rounded-3xl text-orange-500">
                  <AlertTriangle size={60} />
                </div>
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-black text-white">
                    الحساب متوقف مؤقتاً ⚠️
                  </h2>
                  <p className="text-gray-400 font-bold">
                    تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.
                  </p>
                  {user?.message && (
                    <div className="bg-[#0F172A] p-4 rounded-2xl border border-gray-800">
                      <p className="text-orange-400 font-bold">
                        {user.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- حالة المقبول (الواجهة الرئيسية) ✅ --- */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* كود الواجهة مالتك ينزل هنا بدون تعديل */}
              <div className="lg:col-span-2 space-y-6">
                {routes.length > 0 ? (
                  routes.map((route) => (
                    <div
                      key={route._id}
                      className="bg-[#1E293B] border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-[#FACC15]/40 transition-all shadow-xl"
                    >
                      <div className="absolute top-0 right-0 h-full w-1 bg-[#FACC15] shadow-[0_0_15px_#FACC15]"></div>

                      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div>
                          <span className="text-[10px] bg-[#FACC15] text-black font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {route.carType}
                          </span>
                          <h4 className="text-lg font-black mt-2">
                            {route.province}
                          </h4>
                        </div>
                        <div className="text-left">
                          <p className="text-[#94A3B8] text-xs">رقم السيارة</p>
                          <p className="font-mono font-bold text-[#FACC15]">
                            {route.carNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-6 bg-[#0F172A]/50 p-4 rounded-2xl border border-gray-800">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-4 h-4 rounded-full border-2 border-[#FACC15] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-[#FACC15] rounded-full"></div>
                          </div>
                          <div className="w-0.5 h-8 border-r border-dashed border-gray-600"></div>
                          <MapPin size={18} className="text-red-500" />
                        </div>
                        <div className="space-y-4 flex-1">
                          <div>
                            <p className="text-[10px] text-[#94A3B8]">
                              نقطة الانطلاق
                            </p>
                            <p className="font-bold text-sm">
                              {route.fromArea}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#94A3B8]">
                              وجهة الوصول
                            </p>
                            <p className="font-bold text-sm">{route.toArea}</p>
                          </div>
                        </div>
                        <div className="bg-[#1E293B] p-3 rounded-xl text-center border border-gray-700 min-w-[80px]">
                          <Clock
                            size={16}
                            className="mx-auto mb-1 text-[#FACC15]"
                          />
                          <p className="text-xs font-black">{route.time}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-500/20 p-2 rounded-lg">
                            <DollarSign size={20} className="text-green-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#94A3B8]">
                              أجرة المقعد
                            </p>
                            <p className="font-black text-[#FACC15]">
                              {route.price} د.ع
                            </p>
                          </div>
                        </div>
                        <div className="text-left flex flex-col items-end">
                          <p className="text-[10px] text-[#94A3B8] mb-1">
                            المقاعد المتاحة: <span>{route.avilableSeats}</span>{" "}
                            من {route.totalSeats}
                          </p>
                          <div className="flex gap-1">
                            {[...Array(route.totalSeats)].map(
                              (_, i) =>
                                route.totalSeats < 15 && (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-sm ${
                                      i < route.avilableSeats
                                        ? "bg-[#FACC15] shadow-[0_0_5px_#FACC15]"
                                        : "bg-gray-700"
                                    }`}
                                  ></div>
                                ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1E293B] border-2 border-dashed border-gray-800 rounded-3xl p-12 text-center">
                    <div className="bg-[#0F172A] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                      <Car size={40} className="text-gray-600" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      ما عندك أي خط حالياً! 🛑
                    </h4>
                    <p className="text-[#94A3B8] text-sm mb-6 px-10">
                      إبدأ بإضافة خطك الأول حتى الركاب يكدرون يشوفوك ويشتركون
                      وياك.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#FACC15] text-black font-black py-4 px-8 rounded-2xl shadow-[0_10px_25px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Plus size={20} /> إضافة خط جديد
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "passengers" && (
        <div className="p-4 md:p-10 bg-[#1E293B] rounded-3xl shadow-2xl border border-gray-800">
          <div className="text-center mb-8">
            <Users
              size={48}
              className="mx-auto mb-4 text-[#FACC15] opacity-20"
            />
            <h2 className="text-xl font-bold text-white">
              قائمة الركاب التفصيلية 📋
            </h2>
          </div>

          {routes.length > 0 ? (
            // نفلتر الخطوط: بس الخط اللي ID مالته موجود بداخل acceptedBookings
            routes
              .filter((route) =>
                acceptedBookings.some((b) => b.routeId?._id === route._id),
              )
              .map((route) => (
                <PassengerListDetails
                  key={route._id} // ضيف الـ key ضروري جداً بالـ React 🔑
                  routeId={route._id}
                  allBookings={acceptedBookings}
                />
              ))
          ) : (
            <p className="text-center text-gray-500 italic">
              لا يوجد أي ركاب حالياً ❄️
            </p>
          )}

          {/* ملاحظة: إذا كل الخطوط ما بيها ركاب وره الفلترة، ممكن تطلع رسالة "لا يوجد ركاب" */}
          {routes.length > 0 &&
            !routes.some((route) =>
              acceptedBookings.some((b) => b.routeId?._id === route._id),
            ) && (
              <div className="text-center py-10">
                <p className="text-gray-500">كل الخطوط فارغة حالياً.. 🚌</p>
              </div>
            )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="p-6 md:p-10 bg-[#1E293B] rounded-3xl border border-gray-800 animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-2">
              الإعدادات العامة ⚙️
            </h2>
            <p className="text-gray-400 text-xs">
              إدارة حسابك وتفضيلات التطبيق
            </p>
          </div>

          <div className="space-y-4">
            {/* كارت معلومات الحساب - عرض فقط */}
            <div className="p-4 bg-[#0F172A]/50 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
                  <img
                    className="rounded-full border border-primary-dark shadow-[0_4px_20px_rgba(250,204,21,0.3)] "
                    src={user?.profileImg}
                    alt="Profile Image"
                  />
                  <User size={20} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">
                    {user?.fullName}
                  </p>
                  <p className="text-gray-500 text-[10px]">{user?.phone}</p>
                </div>
              </div>
              <span className="bg-green-500/10 text-green-500 shadow-[0_4px_20px_rgba(0,201,81,0.1)] text-[10px] px-2 py-1 rounded-lg border border-green-500/20">
                نشط الآن
              </span>
            </div>

            <hr className="border-gray-800 my-6" />

            {/* زر تسجيل الخروج 🚪 */}
            <button
              onClick={() => {
                // مسح البيانات من التخزين المحلي
                logout();
                navigate("/login");
              }}
              className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="bg-red-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <LogOut size={18} />
                </div>
                <span className="font-bold text-sm">
                  تسجيل الخروج من الحساب
                </span>
              </div>
              <ChevronLeft size={16} className="text-red-500/50" />
            </button>

            <p className="text-center text-[10px] text-gray-600 mt-10">
              اصدار التطبيق v1.0.2 🚀
            </p>
          </div>
        </div>
      )}

      {activeTab === "bookings" && <DriverBookings />}

      {/* الـ Modal الخاص بإضافة خط */}
      <AddRouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshRoutes={refreshRoutes}
      />
    </div>
  );
};

export default DriverDashboard;
