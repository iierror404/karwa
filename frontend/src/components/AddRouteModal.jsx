import { useState } from "react";
import {
  X,
  MapPin,
  Car,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Hash,
  Loader2,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const AddRouteModal = ({ isOpen, onClose, refreshRoutes }) => {
  const [formData, setFormData] = useState({
    province: "",
    fromArea: "",
    toArea: "",
    price: "",
    time: "",
    days: "",
    totalSeats: "",
    carNumber: "",
    carType: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/routes/add", formData);
      toast.success("تم إضافة الخط بنجاح! 🚐✨", {
        style: {
          background: "#1E293B",
          color: "#FACC15",
          border: "1px solid #FACC15",
        },
      });
      refreshRoutes(); // تحديث القائمة بالداشبورد تلقائياً
      onClose(); // غلق النافذة
    } catch (error) {
      toast.error(error.response?.data?.msg || "فشل إضافة الخط! 🔥");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-[#1E293B] border border-gray-700 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(250,204,21,0.15)] relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]">
          <h2 className="text-xl font-black text-[#FACC15] flex items-center gap-2">
            <PlusCircle className="animate-pulse" /> إضافة خط جديد
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto max-h-[70vh]"
        >
          {/* المحافظة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              المحافظة
            </label>
            <div className="relative">
              <MapPin
                className="absolute right-4 top-3.5 text-[#FACC15]"
                size={18}
              />
              <input
                name="province"
                onChange={handleChange}
                required
                placeholder="مثلاً: بغداد"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* نوع السيارة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              نوع السيارة
            </label>
            <div className="relative">
              <Car
                className="absolute right-4 top-3.5 text-[#FACC15]"
                size={18}
              />
              <input
                name="carType"
                onChange={handleChange}
                required
                placeholder="مثلاً: ستاريكس"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* من منطقة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              من (نقطة الانطلاق)
            </label>
            <input
              name="fromArea"
              onChange={handleChange}
              required
              placeholder="مثلاً: الدورة"
              className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 px-5 focus:border-[#FACC15] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* إلى منطقة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              إلى (الوجهة)
            </label>
            <input
              name="toArea"
              onChange={handleChange}
              required
              placeholder="مثلاً: الكرادة"
              className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 px-5 focus:border-[#FACC15] outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          {/* السعر */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              السعر (دينار)
            </label>
            <div className="relative">
              <DollarSign
                className="absolute right-4 top-3.5 text-green-500"
                size={18}
              />
              <input
                name="price"
                type="number"
                onChange={handleChange}
                required
                placeholder="5000"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* عدد المقاعد */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              عدد المقاعد الكلي
            </label>
            <div className="relative">
              <Users
                className="absolute right-4 top-3.5 text-blue-500"
                size={18}
              />
              <input
                name="totalSeats"
                type="number"
                onChange={handleChange}
                required
                placeholder="مثلاً: 11"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* الوقت */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              وقت التحرك
            </label>
            <div className="relative">
              <Clock
                className="absolute right-4 top-3.5 text-[#FACC15]"
                size={18}
              />
              <input
                name="time"
                type="text"
                onChange={handleChange}
                required
                placeholder="مثلاً: 7:30 صباحاً"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* رقم السيارة */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#94A3B8] mr-2">
              رقم السيارة
            </label>
            <div className="relative">
              <Hash
                className="absolute right-4 top-3.5 text-gray-500"
                size={18}
              />
              <input
                name="carNumber"
                onChange={handleChange}
                required
                placeholder="أ-12345 بغداد"
                className="w-full bg-[#0F172A] border border-gray-700 rounded-2xl py-3 pr-12 pl-4 focus:border-[#FACC15] outline-none transition-all"
              />
            </div>
          </div>

          {/* اختيار الأيام */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-bold text-[#94A3B8] mr-2 flex items-center gap-2">
              <Calendar size={16} className="text-[#FACC15]" /> أيام العمل في
              الأسبوع
            </label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {[
                "السبت",
                "الأحد",
                "الاثنين",
                "الثلاثاء",
                "الأربعاء",
                "الخميس",
                "الجمعة",
              ].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const currentDays = formData.days
                      ? formData.days.split(" - ")
                      : [];
                    const newDays = currentDays.includes(day)
                      ? currentDays.filter((d) => d !== day)
                      : [...currentDays, day];
                    setFormData({ ...formData, days: newDays.join(" - ") });
                  }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    formData.days?.includes(day)
                      ? "bg-[#FACC15] text-black border-[#FACC15] shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                      : "bg-[#0F172A] text-gray-400 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FACC15] text-black font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(250,204,21,0.2)] hover:shadow-[0_10px_30px_rgba(250,204,21,0.4)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "اضافة الخط"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PlusCircle = (props) => (
  <svg
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default AddRouteModal;
