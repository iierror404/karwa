import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Eye,
  Check,
  X,
  Phone,
  Calendar,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext"; // استدعاء الكونتكس 💡

  const RejectionModal = ({ isOpen, onClose, onConfirm, reason, setReason, driverName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* الخلفية المظلمة 🌑 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* محتوى المودال 📦 */}
      <div className="relative bg-[#1E293B] w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* الهيدر */}
        <div className="bg-red-500/10 p-6 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-xl text-red-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">رفض طلب الانضمام</h3>
              <p className="text-gray-400 text-xs font-bold">للسائق: {driverName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* الجسم (Body) */}
        <div className="p-6">
          <label className="block text-gray-400 font-bold text-sm mb-3 mr-2">
            اكتب سبب الرفض (سيصل كرسالة للسائق) ✍️
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثلاً: صورة السنوية غير واضحة، يرجى إعادة الإرسال..."
            className="w-full bg-[#0F172A] border-2 border-gray-800 rounded-2xl py-4 px-4 text-white font-bold text-sm focus:outline-none focus:border-red-500/50 transition-all min-h-[150px] resize-none"
          />
        </div>

        {/* الأزرار (Footer) */}
        <div className="p-6 bg-[#161E2E] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-3 rounded-2xl transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)]"
          >
            <Send size={18} />
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingDrivers = () => {
  // جلب الدوال والبيانات من الـ Context
  const {
    pendingDrivers,
    loading,
    fetchPendingDrivers,
    approveDriver,
    rejectDriver,
  } = useAdmin();
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPendingDrivers(); // جلب السواق المعلقين أول ما تفتح الصفحة 📡
  }, []);

  const openRejectModal = (driverId) => {
    setSelectedDriver(driverId);
    setIsModalOpen(true);
  };
  const handleFinalReject = () => {
    rejectDriver(selectedDriver, rejectReason);
    setIsModalOpen(false);
    setRejectReason("");
  };

  // دالة مساعدة لعرض الصور (DocImage)
  const DocImage = ({ title, src }) => (
    <div className="flex flex-col gap-2">
      <span className="text-gray-400 font-bold text-sm mr-2 italic">
        ● {title}
      </span>
      <div className="rounded-3xl border-2 border-gray-800 overflow-hidden bg-black/40 aspect-video flex items-center justify-center group relative">
        {src ? (
          <>
            <img
              src={src}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white"
              >
                <Eye size={24} />
              </a>
            </div>
          </>
        ) : (
          <div className="text-gray-600 flex flex-col items-center gap-2">
            <ImageIcon size={40} />
            <span className="text-xs">الصورة غير متوفرة</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading && pendingDrivers.length === 0)
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-[#FACC15] animate-spin" size={50} />
        <p className="font-black text-[#FACC15] animate-pulse">
          جاري فحص الطلبات... 🕵️‍♂️
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F172A] p-4 md:p-8 text-white" dir="rtl">
      <div className="mb-8">
        <h1 className="text-[22px] md:text-3xl font-black text-white flex items-center gap-3">
          <ShieldAlert className="text-[#FACC15]" size={35} />
          طلبات التوثيق <span className="text-[#FACC15]">المعلقة</span>
        </h1>
        <p className="text-gray-400 font-bold mt-2 text-xs md:text-base">
          راجع مستمسكات السواق بعناية قبل الموافقة على انضمامهم. ✨
        </p>
      </div>

      {pendingDrivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-[#1E293B] rounded-[3rem] border-2 border-dashed border-gray-800">
          <Check className="text-green-500 mb-4" size={50} />
          <p className="text-gray-400 font-black text-xl text-center">
            عاشت ايدك! <br /> ماكو أي طلبات تنتظر حالياً.
          </p>
        </div>
      ) : (
        <>
          {/* عرض اللابتوب: جدول */}
          <div className="hidden md:block bg-[#1E293B] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#0F172A] text-gray-400 text-sm">
                  <th className="px-6 py-5 font-black">السائق</th>
                  <th className="px-6 py-5 font-black">تاريخ التقديم</th>
                  <th className="px-6 py-5 font-black">المستمسكات</th>
                  <th className="px-6 py-5 font-black text-center">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pendingDrivers.map((driver) => (
                  <tr
                    key={driver._id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#FACC15] text-black rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-[#FACC15]/10">
                          {driver.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg leading-tight">
                            {driver.fullName}
                          </p>
                          <p className="text-gray-500 text-sm tracking-widest">
                            {driver.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-400 font-medium text-sm">
                      {new Date(driver.createdAt).toLocaleDateString("ar-IQ")}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setSelectedDocs(driver)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all font-black text-sm cursor-pointer"
                      >
                        <Eye size={18} /> عرض الملفات
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => approveDriver(driver._id)}
                          className="p-3 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-green-600/5 active:scale-90"
                        >
                          <Check size={22} />
                        </button>
                        <button
                          onClick={() => openRejectModal(driver._id)}
                          className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-lg shadow-red-600/5 active:scale-90"
                        >
                          <X size={22} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الموبايل كارتات */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {pendingDrivers.map((driver) => (
              <div
                key={driver._id}
                className="bg-[#1E293B] rounded-3xl p-5 border border-gray-800 shadow-xl"
              >
                <div className="flex items-center gap-4 mb-4 border-b border-gray-800 pb-4">
                  <div className="w-14 h-14 bg-[#FACC15] text-black rounded-2xl flex items-center justify-center font-black text-xl">
                    {driver.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">
                      {driver.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Phone size={14} className="text-[#FACC15]" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> تاريخ التقديم:
                    </span>
                    <span className="text-gray-300 font-bold">
                      {new Date(driver.createdAt).toLocaleDateString("ar-IQ")}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedDocs(driver)}
                    className="col-span-2 py-4 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-600/20 flex items-center justify-center gap-2 font-black cursor-pointer"
                  >
                    <Eye size={20} /> عرض المستمسكات
                  </button>
                  <button
                    onClick={() => approveDriver(driver._id)}
                    className="py-4 bg-green-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black cursor-pointer active:scale-95 shadow-lg shadow-green-600/20"
                  >
                    <Check size={20} /> قبول
                  </button>
                  <button
                    onClick={() => openRejectModal(driver._id)}
                    className="py-4 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black cursor-pointer active:scale-95 shadow-lg shadow-red-600/20"
                  >
                    <X size={20} /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal عرض المستمسكات 🖼️ */}
      {selectedDocs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
          <div className="bg-[#1E293B] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border border-gray-700 overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1E293B]">
              <h3 className="text-xl font-black flex items-center gap-2">
                <ImageIcon className="text-[#FACC15]" />
                مستمسكات: {selectedDocs.fullName}
              </h3>
              <button
                onClick={() => setSelectedDocs(null)}
                className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0F172A]/30">
              <DocImage
                title="البطاقة الوطنية - وجه"
                src={selectedDocs.documents?.nationalCardFront}
              />
              <DocImage
                title="البطاقة الوطنية - ظهر"
                src={selectedDocs.documents?.nationalCardBack}
              />
              <DocImage
                title="بطاقة السكن - وجه"
                src={selectedDocs.documents?.residencyCardFront}
              />
              <DocImage
                title="بطاقة السكن - ظهر"
                src={selectedDocs.documents?.residencyCardBack}
              />
            </div>
            <div className="p-6 border-t border-gray-800 flex flex-col md:flex-row justify-end gap-3 bg-[#1E293B]">
              <button
                onClick={() => setSelectedDocs(null)}
                className="order-2 md:order-1 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl font-black cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  approveDriver(selectedDocs._id);
                  setSelectedDocs(null);
                }}
                className="order-1 md:order-2 px-8 py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-black cursor-pointer shadow-lg shadow-green-600/20"
              >
                تفعيل حساب السائق ✅
              </button>
            </div>
          </div>
        </div>
      )}
      <RejectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalReject}
        reason={rejectReason}
        setReason={setRejectReason}
        driverName={selectedDriver?.fullName}
      />
    </div>
  );
};

export default PendingDrivers;
