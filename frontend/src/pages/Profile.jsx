import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Shield,
  Edit3,
  Trash2,
  X,
  Check,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser, logout } = useAuth(); // ضفنا logout هنا 🚪
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // حالة المودال 🗑️
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    profileImg: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        profileImg: user.profileImg || "",
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success("تم اختيار الصورة بنجاح! ✨");
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("phone", formData.phone);

    if (selectedFile) {
      data.append("avatar", selectedFile);
    }

    toast.promise(
      api.put("/user/profile/update", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      {
        loading: "جاري تحديث ملفك الشخصي... 🔄",
        success: (res) => {
          setIsEditing(false);
          setUser(res.data.user);
          setSelectedFile(null);
          return <b>تم الحفظ بنجاح، يا بطل! ✅</b>;
        },
        error: (err) => {
          const errMsg = err.response?.data?.msg || "صار خلل بالاتصال ❌";
          return <b>{errMsg}</b>;
        },
      },
      {
        style: {
          minWidth: "250px",
          background: "#1E293B",
          color: "#fff",
          fontFamily: "Cairo",
          border: "1px solid #FACC15",
        },
      },
    );
  };

  // دالة حذف الحساب 🧨
  const confirmDeleteAccount = async () => {
    toast.promise(
      api.delete("/user/profile/delete"),
      {
        loading: "جاري حذف الحساب... ⏳",
        success: () => {
          setTimeout(() => logout(), 2000);
          return <b>تم الحذف، نتشاوف على خير 👋</b>;
        },
        error: (err) => <b>{err.response?.data?.msg || "فشل الحذف ❌"}</b>,
      },
      {
        style: {
          background: "#1E293B",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-['Cairo'] text-right"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#1E293B]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="h-32 bg-gradient-to-r from-[#FACC15] to-[#EAB308] relative">
          <motion.div className="absolute bottom-[-40px] right-8 w-24 h-24 rounded-3xl bg-[#0F172A] border-4 border-[#1E293B] shadow-2xl overflow-hidden group">
            {selectedFile || formData.profileImg ? (
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : formData.profileImg
                }
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-[#FACC15]">
                <User size={40} />
              </div>
            )}

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/60 transition-all"
                >
                  <Camera size={24} className="text-[#FACC15] mb-1" />
                  <span className="text-[10px] text-white font-bold text-center px-2">
                    تغيير الصورة
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="pt-14 px-8 pb-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-none">
              الملف الشخصي
            </h2>
            <p className="text-[#94A3B8] mt-2 italic text-sm">
              Manage your 404Coder identity 🆔
            </p>
          </div>

          <div className="space-y-4">
            <ProfileField
              label="الاسم الكامل"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              icon={<User size={18} />}
              isEditing={isEditing}
            />
            <ProfileField
              label="رقم الهاتف"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              icon={<Phone size={18} />}
              isEditing={isEditing}
            />
            <ProfileField
              label="نوع الحساب"
              value={user?.role === "driver" ? "سائق" : user?.role === "admin" ? "مسؤل" : "راكب"}
              icon={<Shield size={18} />}
              isEditing={false}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.button
                  key="edit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer w-full bg-[#FACC15] text-[#0F172A] py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/10"
                >
                  <Edit3 size={20} /> تعديل البيانات
                </motion.button>
              ) : (
                <div className="flex gap-3 w-full">
                  <motion.button
                    key="save"
                    onClick={handleSave}
                    className="cursor-pointer flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> حفظ
                  </motion.button>
                  <motion.button
                    key="cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setFormData({ ...user });
                    }}
                    className="cursor-pointer flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/10"
                  >
                    <X size={20} /> إلغاء
                  </motion.button>
                </div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setShowDeleteModal(true)} // فتح المودال 🔓
              whileHover={{ color: "#ef4444", opacity: 1 }}
              className="mt-4 text-[#94A3B8] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 opacity-50 transition-all cursor-pointer"
            >
              <Trash2 size={14} /> حذف الحساب نهائياً
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* مودال التأكيد (Delete Confirmation Modal) 🛡️ */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1E293B] border border-red-500/20 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">حذف الحساب؟</h3>
              <p className="text-[#94A3B8] text-sm mb-6">
                هذا الإجراء سيؤدي لحذف جميع بياناتك نهائياً
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmDeleteAccount}
                  className="cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  حذف
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="cursor-pointer w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileField = ({ label, value, icon, isEditing, onChange }) => (
  <motion.div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:border-[#FACC15]/30 transition-all">
    <div className="text-[#94A3B8] group-hover:text-[#FACC15]">{icon}</div>
    <div className="flex-1 text-right">
      <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-tighter">
        {label}
      </p>
      <input
        disabled={!isEditing}
        value={value}
        onChange={onChange}
        className="bg-transparent text-white font-bold w-full outline-none disabled:text-gray-400 cursor-text text-right"
      />
    </div>
  </motion.div>
);

export default Profile;
