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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const { logout, user } = useAuth();

  const menuItems = [
    { id: "home", label: "الرئيسية", icon: <Home size={20} />, path: "/" },
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: <LayoutDashboard size={20} />,
      path: "/driver/dashboard",
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
      id: "about",
      label: "تعرف علينا",
      icon: <Info size={20} />,
      path: "/about",
    },
  ];

  return (
    // ضفنا overflow-x-hidden هنا حتى نمنع أي شطحة جانبية 🛑
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
            {user?.role === "admin"
              ? "الأدمن"
              : user?.role === "driver"
                ? "السائق"
                : "الراكب"}
          </h2>
        </div>

        {/* الروابط */}
        <nav className="p-4 flex flex-col h-[calc(100%-100px)] justify-between">
          <div className="space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
            {menuItems
              .filter((item) => {
                if (user?.role === "passenger") {
                  return ![
                    "dashboard",
                    "admin_stats",
                    "pending_drivers",
                    "manage_users",
                  ].includes(item.id);
                }
                if (user?.role === "driver") {
                  return ![
                    "admin_stats",
                    "pending_drivers",
                    "manage_users",
                    "search",
                  ].includes(item.id);
                }
                if (user?.role === "admin") {
                  return !["dashboard", "search"].includes(item.id);
                }
                return true;
              })
              .map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-[#FACC15] text-black shadow-lg"
                        : "text-gray-400 hover:bg-[#0F172A] hover:text-white"
                    }`}
                  >
                    <span
                      className={`${isActive ? "text-black" : "text-gray-400 group-hover:text-[#FACC15]"}`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
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
