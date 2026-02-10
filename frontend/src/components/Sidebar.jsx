import {
  Home,
  LogOut,
  LayoutDashboard,
  Search,
  UserCircle,
  Info,
  ShieldCheck,
  Clock,
  Users,
  Ticket,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext"; // استدعاء السوكيت 🔌
import { useEffect, useState } from "react";
import { USER_ROLES } from "../constants/constants";

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const { logout, user } = useAuth();
  const { socket } = useSocket(); // استخدام السوكيت للتعامل مع التنبيهات
  const [notification, setNotification] = useState(false); // حالة النقطة الحمراء 🔴

  // 🔔 مراقبة التنبيهات القادمة من السيرفر
  useEffect(() => {
    if (!socket) return;

    // استماع لإشعارات الحجز (للسائق والراكب)
    const handleNotification = () => {
      setNotification(true);
    };

    socket.on(`new_booking_notification_${user?._id}`, handleNotification);
    socket.on(`booking_status_updated_${user?._id}`, handleNotification);

    return () => {
      socket.off(`new_booking_notification_${user?._id}`);
      socket.off(`booking_status_updated_${user?._id}`);
    };
  }, [socket, user?._id]);

  // إخفاء النقطة الحمراء عند الدخول لصفحة الاشتراكات
  useEffect(() => {
    if (
      location.pathname === "/my-subscriptions" ||
      location.pathname === "/driver/dashboard"
    ) {
      setNotification(false);
    }
  }, [location.pathname]);

  const menuItems = [
    { id: "home", label: "الرئيسية", icon: <Home size={20} />, path: "/" },
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: <LayoutDashboard size={20} />,
      path: "/driver/dashboard",
    },
    {
      id: "my_subscriptions", // العنصر الجديد للراكب 🎫
      label: "اشتراكاتي",
      icon: <Ticket size={20} />,
      path: "/my-subscriptions",
    },
    {
      id: "admin_stats",
      label: "إحصائيات النظام",
      icon: <ShieldCheck size={20} />,
      path: "/admin/dashboard",
    },
    {
      id: "pending_drivers",
      label: "طلبات السواق",
      icon: <Clock size={20} />,
      path: "/admin/pending",
    },
    {
      id: "manage_users",
      label: "إدارة المستخدمين",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "search",
      label: "ابحث عن خط",
      icon: <Search size={20} />,
      path: "/search",
    },
    {
      id: "profile",
      label: "حسابي",
      icon: <UserCircle size={20} />,
      path: "/account/me",
    },
    {
      id: "passenger_messages",
      label: "رسائلي",
      icon: <MessageSquare size={20} />, // نحتاج نستورد الأيقونة
      path: "/passenger/messages",
    },
    {
      id: "about",
      label: "تعرف علينا",
      icon: <Info size={20} />,
      path: "/about",
    },
  ];

  return (
    <div className="z-[60] overflow-x-hidden" dir="rtl">
      {/* موبايل منيو - الشاشة المظلمة */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1E293B] border-l border-gray-800 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* اللوجو */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="min-w-[40px] h-10 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-black text-xl">
            K
          </div>
          <h2 className="text-lg font-black text-white truncate">
            {user?.role === USER_ROLES.ADMIN
              ? "الأدمن"
              : user?.role === USER_ROLES.DRIVER
                ? "السائق"
                : "الراكب"}
          </h2>
        </div>

        {/* الروابط */}
        <nav className="p-4 flex flex-col h-[calc(100%-100px)] justify-between">
          <div className="space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
            {menuItems
              .filter((item) => {
                if (user?.role === USER_ROLES.PASSENGER) {
                  return ![
                    "dashboard",
                    "admin_stats",
                    "pending_drivers",
                    "manage_users",
                  ].includes(item.id);
                }
                if (user?.role === USER_ROLES.DRIVER) {
                  return ![
                    "admin_stats",
                    "pending_drivers",
                    "manage_users",
                    "search",
                    "my_subscriptions",
                    "passenger_messages", // السائق عنده انبوكس خاص بيه بالداشبورد
                  ].includes(item.id);
                }
                if (user?.role === USER_ROLES.ADMIN) {
                  return ![
                    "dashboard",
                    "search",
                    "my_subscriptions",
                    "passenger_messages",
                  ].includes(item.id);
                }
                return true;
              })
              .map((item) => {
                const isActive = location.pathname === item.path;
                // إظهار النقطة الحمراء فقط للأيقونات المعنية بالتنبيهات
                const showBadge =
                  notification &&
                  ((user?.role === USER_ROLES.PASSENGER &&
                    item.id === "my_subscriptions") ||
                    (user?.role === USER_ROLES.DRIVER && item.id === "dashboard"));

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl font-bold transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-[#FACC15] text-black shadow-lg"
                        : "text-gray-400 hover:bg-[#0F172A] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`${isActive ? "text-black" : "text-gray-400 group-hover:text-[#FACC15]"}`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* النقطة الحمراء (Badge) 🔴 */}
                    {showBadge && (
                      <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
          </div>

          {/* زر تسجيل الخروج 💣 */}
          <div className="pt-4 border-t border-gray-800 cursor-pointer">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
