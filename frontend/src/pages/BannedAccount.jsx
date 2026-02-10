import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  LogOut,
  MessageCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BannedAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getStatusIcon = () => {
    switch (user?.status) {
      case "banned":
        return <XCircle className="w-20 h-20 text-red-500" />;
      case "rejected":
        return <XCircle className="w-20 h-20 text-orange-500" />;
      case "pending":
        return <Clock className="w-20 h-20 text-yellow-500" />;
      default:
        return <ShieldAlert className="w-20 h-20 text-[#FACC15]" />;
    }
  };

  const getStatusTitle = () => {
    switch (user?.status) {
      case "banned":
        return "تم حظر حسابك 🚫";
      case "rejected":
        return "تم رفض طلبك ❌";
      case "pending":
        return "حسابك قيد المراجعة ⏳";
      default:
        return "تنبيه النظام ⚠️";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white font-['Inter']">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#1E293B] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
      >
        <div className="flex justify-center">{getStatusIcon()}</div>

        <h1 className="text-2xl font-bold">{getStatusTitle()}</h1>

        <div className="bg-[#0F172A]/50 p-4 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm leading-relaxed">
            {user?.message ||
              "عذراً، لا يمكنك استخدام التطبيق حالياً. يرجى مراجعة حالة حسابك أو التواصل مع فريق الدعم للمزيد من التفاصيل."}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={() => (window.location.href = "tel:0000000000")} // استبدلها برقم الدعم الحقيقي
            className="w-full flex items-center justify-center gap-2 bg-[#FACC15] text-[#0F172A] font-bold py-4 rounded-2xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
          >
            <MessageCircle className="w-5 h-5" />
            تواصل مع الدعم
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-transparent text-gray-400 border border-gray-800 font-semibold py-4 rounded-2xl hover:bg-gray-800 transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </motion.div>

      <p className="mt-8 text-gray-500 text-xs text-center max-w-xs">
        إذا كنت تعتقد أن هذا الحظر تم عن طريق الخطأ، يرجى تقديم طلب اعتراض عبر
        قنوات الدعم الرسمية.
      </p>
    </div>
  );
};

export default BannedAccount;
