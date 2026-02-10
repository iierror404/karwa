import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Power,
  MessageCircle,
  AlertCircle,
  Save,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../api/axios"; // حسب مسار الأكسيوس عندك
import { useRoutes } from "../../../context/RouteContext";

const ManageRoute = () => {
  const [loading, setLoading] = useState(false);
  const { routes } = useRoutes();
  const [statusData, setStatusData] = useState({
    status: "active",
    isDriverAvilable: true,
    noteMessage: "",
  });

  const statusOptions = [
    {
      id: "active",
      label: "نشط (متاح)",
      icon: <CheckCircle size={32} />,
      color: "#4ADE80", // اخضر
      bg: "bg-green-500/10",
    },
    {
      id: "full",
      label: "ممتلئ (قبط)",
      icon: <Users size={32} />,
      color: "#FACC15", // اصفر
      bg: "bg-yellow-500/10",
    },
    {
      id: "inactive",
      label: "متوقف (إجازة)",
      icon: <XCircle size={32} />,
      color: "#F87171", // احمر
      bg: "bg-red-500/10",
    },
  ];

  // تحديث الحالة للباك أند
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/routes/update-status`, {
        routeId: routes[0]._id,
        newStatus: statusData.status,
        isDriverAvilable: statusData.isDriverAvilable,
        noteMessage: statusData.noteMessage,
      });
      
      console.log("✅ الاستجابة من السيرفر:", res.data);
      
      toast.success("تم تحديث حالة الخط بنجاح! 🚐✨", {
        icon: "✅",
        style: { borderRadius: "15px", background: "#1E293B", color: "#fff" },
      });
    } catch (error) {
      console.error("❌ خطأ في التحديث:", error);
      toast.error("فشل التحديث، تأكد من الاتصال ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6 text-white" dir="rtl">
      <header className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <div className="p-3 bg-[#FACC15] text-black rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            <Power size={24} />
          </div>
          إدارة حالة الخط
        </h1>
        <p className="text-gray-400 mt-2">
          تحكم بظهور خطك للركاب وتحديثاتك اليومية 📋
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* كارت اختيار الحالة (Status Selector) مع الانميشن ⚡ */}
        <div className="flex flex-wrap gap-4 py-6 justify-center bg-[#1E293B] border border-gray-800 rounded-[2.5rem] p-4">
          {statusOptions.map((status) => (
            <motion.div
              key={status.id}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setStatusData({
                  ...statusData,
                  status: status.id,
                  isDriverAvilable: status.id !== "inactive",
                })
              }
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer transition-all duration-300 w-[140px] h-[160px] ${
                statusData.status === status.id
                  ? "bg-[#1e293b] border-4"
                  : "bg-[#0F172A]/50 border border-gray-700"
              }`}
              style={{
                borderColor: statusData.status === status.id ? status.color : "transparent",
              }}
            >
              <div 
                className="mb-3 transition-transform duration-300"
                style={{ color: statusData.status === status.id ? status.color : "#4b5563" }}
              >
                {status.icon}
              </div>
              
              <h3 className={`text-sm font-bold transition-colors ${
                statusData.status === status.id ? "text-white" : "text-gray-500"
              }`}>
                {status.label}
              </h3>

              {statusData.status === status.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                  style={{ color: status.color }}
                >
                  <CheckCircle size={20} fill="currentColor" className="text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* كارت الملاحظة 💬 */}
        <div className="bg-[#1E293B] border border-gray-800 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="text-[#FACC15]" size={20} />
            ملاحظة للركاب (اختياري)
          </h3>
          <textarea
            value={statusData.noteMessage}
            onChange={(e) =>
              setStatusData({ ...statusData, noteMessage: e.target.value })
            }
            placeholder="مثلاً: السيارة عطلانة اليوم، أو راح أتأخر 10 دقائق..."
            className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl p-4 text-white focus:border-[#FACC15] focus:outline-none transition-all resize-none h-32"
          />
          <div className="mt-4 flex items-start gap-2 text-gray-500 text-xs">
            <AlertCircle size={14} />
            <span>هذه الملاحظة ستظهر لجميع الركاب المشتركين في خطك. 📢</span>
          </div>
        </div>

        {/* زر الحفظ العائم 💾 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#FACC15] text-black font-black py-5 rounded-[2rem] text-lg shadow-[0_15px_30px_-10px_rgba(250,204,21,0.4)] flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          ) : (
            <>
              <Save size={22} /> حفظ التغييرات 💾
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ManageRoute;