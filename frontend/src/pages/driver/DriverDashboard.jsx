import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Car,
  User,
  Plus,
  Menu,
  Users,
  LogOut,
  ChevronLeft,
  XCircle,
  AlertTriangle,
  LogOutIcon,
  MessageCircle,
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
import ManageRoute from "./components/ManageRoute";
import DriverNotifications from "../../components/DriverNotifications";

const DriverDashboard = () => {
  // 1. استخدام الكونتيكست بدل الـ Local States 🔄
  const { user, logout } = useAuth(); // لجلب بيانات السائق (الاسم، الصورة، الـ ID)
  const { routes, setRoutes } = useRoutes(); // لجلب وإدارة الخطوط
  const { setSidebarOpen } = useAppContext(); // لإدارة حالة السايدبار العامة

  // 2. الـ States الخاصة بالداشبورد فقط 📊
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedBookings, setAcceptedBookings] = useState([]);
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

  // --- 📩 دالة جلب الركاب المقبولين فقط ---
  const fetchAcceptedBookings = async () => {
    try {
      const res = await api.get("/bookings/driver");

      // الركاب المثبتين (المقبولين) ✅
      const accepted = res.data.bookings.filter((b) => b.status === "accepted");
      setAcceptedBookings(accepted);
    } catch (err) {
      console.error("خطأ بجلب البيانات:", err);
    }
  };

  const [conversations, setConversations] = useState([]);

  // --- 💬 جلب المحادثات (الإنبوكس) ---
  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      console.log("Conversations: \n", res.data)
      setConversations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // جلب كل البيانات سوية
        await Promise.all([
          refreshRoutes(),
          fetchAcceptedBookings(),
          fetchConversations(),
        ]);
      } catch (err) {
        toast.error("فشل جلب البيانات! 📶");
      } finally {
        setLoading(false);
      }
    };

    console.log(user);

    initData();

    // تحديث تلقائي كل دقيقة لقائمة الركاب
    const interval = setInterval(fetchAcceptedBookings, 60000);
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
          {/* الجرس ومكون الإشعارات */}
          {user.status === "approved" ? (
            <DriverNotifications />
          ) : (
            <button
              onClick={logout}
              title="تسجيل خروج"
              className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-2xl cursor-pointer"
            >
              <LogOutIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            /* --- حالة التحميل 🔃 --- */
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              {/* <Loader2 className="animate-spin text-[#FACC15]" size={40} /> */}
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
                        <div className="flex flex-col gap-2">
                          <div className="bg-[#1E293B] p-3 rounded-xl text-center border border-gray-700 min-w-[80px]">
                            <Clock
                              size={16}
                              className="mx-auto mb-1 text-[#FACC15]"
                            />
                            <p className="text-xs font-black">{route.time}</p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/chat/${route._id}?type=group`)
                            }
                            title="فتح شات الخط"
                            className="bg-[#FACC15]/10 hover:bg-[#FACC15] text-[#FACC15] hover:text-black p-3 rounded-xl transition-all border border-[#FACC15]/20"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <LogOutIcon size={16} className="rotate-180" />
                              {/* استخدمت ايقونة مؤقتة لأن MessageCircle ممستوردة، رح استوردها هسة */}
                            </div>
                          </button>
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
      {activeTab === "manageRoute" && <ManageRoute />}

      {/* --- تبويب الرسائل (Inbox) 📨 --- */}
      {activeTab === "messages" && (
        <div className="p-4 md:p-10 bg-[#1E293B] rounded-3xl shadow-2xl border border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                الرسائل الواردة 💬
              </h2>
              <p className="text-gray-400 text-xs">استفسارات ومفاوضات الركاب</p>
            </div>
            <button
              onClick={fetchConversations}
              className="p-2 bg-[#0F172A] rounded-xl hover:bg-gray-700 transition-colors"
            >
              <Clock size={16} className="text-[#FACC15]" />
            </button>
          </div>

          <div className="space-y-3">
            {conversations.length > 0 ? (
              conversations.map((conv, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    navigate(
                      `/chat/${conv._id.route}?type=private&passengerId=${conv._id.otherPerson}`,
                    )
                  }
                  className="bg-[#0F172A]/50 p-4 rounded-2xl border border-gray-800 hover:border-[#FACC15]/30 cursor-pointer transition-all hover:bg-[#0F172A]"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        conv.otherPerson?.profileImg ||
                        `https://ui-avatars.com/api/?name=${conv.otherPerson?.fullName}&background=FACC15&color=000`
                      }
                      className="w-12 h-12 rounded-full object-cover border border-gray-700"
                      alt="passenger"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white text-sm">
                          {conv.otherPerson?.fullName}
                        </h4>
                        <span className="text-[10px] text-gray-500">
                          {new Date(
                            conv.lastMessage.createdAt,
                          ).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate dir-rtl text-right">
                        {conv.lastMessage.sender === user._id ? "أنت: " : ""}
                        {conv.lastMessage.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-[#FACC15]">
                        <div className="bg-[#FACC15]/10 px-2 py-0.5 rounded-md">
                          خط: {conv.route.fromArea} ⬅ {conv.route.toArea}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                <p>لا توجد رسائل جديدة 📭</p>
              </div>
            )}
          </div>
        </div>
      )}

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
