import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  type = "danger", // danger, warning, info
}) => {
  if (!isOpen) return null;

  const themes = {
    danger: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      border: "border-red-500/20",
      btn: "bg-red-500 hover:bg-red-600",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    },
    warning: {
      bg: "bg-[#FACC15]/10",
      text: "text-[#FACC15]",
      border: "border-[#FACC15]/20",
      btn: "bg-[#FACC15] hover:bg-[#eab308] text-black",
      glow: "shadow-[0_0_20px_rgba(250,204,21,0.2)]",
    },
  };

  const theme = themes[type] || themes.danger;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md bg-[#1E293B] border ${theme.border} rounded-[2.5rem] p-8 ${theme.glow} z-10`}
          dir="rtl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div
            className={`${theme.bg} ${theme.text} w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto`}
          >
            <AlertTriangle size={32} />
          </div>

          {/* Content */}
          <div className="text-center space-y-3 mb-8">
            <h3 className="text-xl font-black text-white">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-bold">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm border border-gray-700 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl ${theme.btn} font-black text-sm transition-all shadow-lg active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
