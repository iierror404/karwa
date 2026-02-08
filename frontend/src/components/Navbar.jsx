import { Link } from "react-router-dom";
import karwaLogo from "../assets/karwa-logo-glow.png";
import { useAuth } from "../context/AuthContext";
import { LogIn, Menu, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const { setSidebarOpen, sidebarOpen } = useAppContext();
  const { user } = useAuth();
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
            <Link to={user.role === "driver" ? "/driver/dashboard" : "/search"}>
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
