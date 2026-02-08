import { User, Car, Navigation, HousePlus, Home } from "lucide-react";
import { useAppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "home", label: "الصفحة الرئيسية", icon: <Home size={20} /> },
    {
      id: "dashboard",
      label: "لوحة تحكم السائق",
      icon: <Navigation size={20} />,
    },
    { id: "passengers", label: "الركاب", icon: <User size={20} /> },
    { id: "bookings", label: "طلبات الحجز", icon: <HousePlus size={20} /> },
    { id: "settings", label: "الإعدادات", icon: <Car size={20} /> },
  ];
  // 👈 سحبنا التحكم بالسايدبار من الكونتيكست العام
  const { sidebarOpen, setSidebarOpen } = useAppContext();

  return (
    <>
      {/* موبايل منيو - الشاشة المظلمة */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#1E293B] border-l border-gray-800 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center font-black text-black text-xl">
            K
          </div>
          <h2 className="text-xl font-black text-white">كروة - السائق</h2>
        </div>

        <nav className="p-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`cursor-pointer w-full flex items-center gap-4 ${item.id !== "home" && "px-4 py-4 flex items-center gap-4"} rounded-2xl font-bold transition-all ${activeTab === item.id ? "bg-[#FACC15] text-black shadow-lg" : "text-gray-400 hover:bg-[#0F172A] hover:text-white"}`}
            >
              {item.id === "home" ? (
                <Link to="/" className="w-full px-4 py-4 flex items-center gap-4">
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <>
                  {item.icon}
                  <span>{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
