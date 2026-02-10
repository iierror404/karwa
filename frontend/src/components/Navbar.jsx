import { Link } from "react-router-dom";
import karwaLogo from "../assets/karwa-logo-glow.png";
import { useAuth } from "../context/AuthContext";
import { LogIn, Menu, X, Bell } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Sidebar from "./Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useState } from "react";
import { USER_ROLES } from "../constants/constants";

const Navbar = () => {
  const { setSidebarOpen, sidebarOpen } = useAppContext();
  const { user } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  // تنسيق عنوان الاشعار بناءً على المرسل
  const getNotificationTitle = (notif) => {
    if (notif.type === "booking") return notif.title;

    // اذا رسالة
    // نفترض ان الداتا بيها senderName و routeName اذا موجود
    // user joined room: negotiation_routeId_passengerId
    // logic logic logic...
    // بس الداتا اللي دزيناها بالباك اند (message_notification) بيها:
    // content, senderId, senderName, routeId

    if (notif.routeName) {
      return `رسالة من ${notif.senderName} (${notif.routeName})`;
    } else {
      return `رسالة من ${notif.senderName}`;
    }
  };

  return (
    <>
      {/* 1. استدعاء السايدبار هنا حتى يكون جاهز للفتح في أي وقت 🛠️ */}
      {user?.role !== undefined && <Sidebar />}

      <nav className="flex items-center justify-between px-6 py-4 bg-[#1E293B]/50 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
        {/* القسم الأيمن: زر المنيو + اللوجو */}
        <div className="flex items-center gap-4">
          {/* زر فتح السايدبار 🔓 */}
          {user?.role !== undefined && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer p-2 hover:bg-[#0F172A] rounded-xl text-[#FACC15] transition-all active:scale-95"
            >
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}

          {/* اللوجو 🖼️ */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img
                src={karwaLogo}
                alt="Karwa Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-[#FACC15] tracking-tighter">
              <span className="text-white text-[18px] font-medium tracking-widest ml-1">
                KARWA
              </span>
            </h1>
          </Link>
        </div>

        {/* القسم الأيسر: البروفايل أو تسجيل الدخول */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* 🔔 جرس الاشعارات */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadCount > 0) markAllAsRead();
                  }}
                  className="p-2 bg-[#0F172A] text-gray-400 hover:text-white rounded-xl border border-gray-700 transition-all relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* القائمة المنسدلة للاشعارات */}
                {showNotifications && (
                  <div
                    dir="rtl"
                    className="absolute top-12 -left-69 w-80 bg-[#1E293B] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-[#0F172A]">
                      <h4 className="font-bold text-sm text-white">
                        الإشعارات
                      </h4>
                      <button
                        className="text-[10px] text-[#FACC15]"
                        onClick={markAllAsRead}
                      >
                        تحديد كمقروء
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                          <div
                            key={idx}
                            className="p-3 border-b border-gray-800 hover:bg-[#0F172A] transition-colors cursor-pointer"
                            dir="rtl"
                          >
                            <div className="flex items-start gap-3">
                              {notif.senderImage ? (
                                <img
                                  src={notif.senderImage}
                                  alt="sender"
                                  className="w-10 h-10 rounded-full object-cover border border-[#FACC15]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#FACC15]/20 flex items-center justify-center text-[#FACC15]">
                                  <Bell size={16} />
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-white mb-1">
                                  {getNotificationTitle(notif)}
                                </p>
                                <p className="text-[10px] text-gray-400 leading-relaxed">
                                  {notif.content || notif.body}
                                </p>
                                <span className="text-[9px] text-gray-600 block mt-2 text-left">
                                  الآن
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500 text-xs">
                          لا توجد إشعارات جديدة 🔕
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={user.role === USER_ROLES.DRIVER ? "/driver/dashboard" : "/search"}
              >
                <div className="flex items-center gap-2 bg-[#0F172A] py-1 px-2.5 rounded-full border border-gray-700 hover:border-[#FACC15] transition-all group">
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                    {user.fullName.split(" ")[0]}
                  </span>
                  {user.profileImg ? (
                    <img
                      src={user.profileImg}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#FACC15]"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#FACC15] rounded-full flex items-center justify-center text-black font-bold">
                      {user.fullName[0]}
                    </div>
                  )}
                </div>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[#FACC15] text-black px-5 py-2.5 rounded-xl font-black hover:bg-yellow-500 transition-all shadow-[0_4px_15px_rgba(250,204,21,0.2)]"
            >
              <LogIn size={20} />
              <span>دخول</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
