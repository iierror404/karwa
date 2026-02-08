// src/pages/admin/AdminDashboard.jsx
import { useEffect } from "react";
import { useAdmin } from "../../context/AdminContext"; // 💡 نستخدم الكونتكس مالتنا
import {
  Users,
  Car,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Check,
} from "lucide-react";

const AdminDashboard = () => {
  const { stats, fetchStats, loading } = useAdmin();

  useEffect(() => {
    fetchStats(); // أول ما تفتح الصفحة نجيب الأرقام الفريش 🔄
  }, []);

  // دالة مساعدة لرسم الكارتات حتى لا نكرر كود
  const StatCard = ({ title, value, icon: Icon, color, shadowColor }) => (
    <div
      className={`bg-[#1E293B] p-6 rounded-[2.5rem] border border-gray-800 shadow-xl relative overflow-hidden group transition-all hover:-translate-y-2`}
    >
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color} group-hover:scale-150 transition-transform`}
      />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 font-bold mb-1">{title}</p>
          <h2 className="text-3xl font-black text-white">
            {loading ? "..." : value}
          </h2>
        </div>
        <div
          className={`p-4 rounded-2xl ${color} bg-opacity-20 text-white shadow-lg ${shadowColor}`}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#0F172A] p-4 md:p-8 text-white font-['Cairo']"
      dir="rtl"
    >
      {/* الهيدر 👑 */}
      <div className="mb-10 flex flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 mt-3 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-black text-white">
              لوحة التحكم <span className="text-[#FACC15]">الرئيسية</span>
            </h1>

            {/* علامة التوثيق الزرقاء 🔵 */}
            <div
              className="flex items-center justify-center bg-blue-500 rounded-full p-1 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-110 transition-transform"
              title="حساب مسؤول نظام موثق"
            >
              <Check size={14} strokeWidth={4} className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-1.5 w-10 bg-[#FACC15] rounded-full hidden md:block"></div>
            <p className="text-gray-400 font-bold text-sm md:text-lg">
              النظام تحت سيطرتك، إليك آخر التحديثات ⚡
            </p>
          </div>
        </div>

        {/* كارت حالة الحساب الموثق 🛡️ */}
        <div className="hidden md:block relative group">
          <div className="absolute inset-8 bg-[#FACC15] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative bg-[#FACC15] px-4 py-3 rounded-2xl flex items-center text-black font-black shadow-[0_10px_30px_rgba(250,204,21,0.2)] cursor-default">
            <ShieldCheck size={22} className="animate-pulse" />
            {/* <span className="text-sm md:text-base tracking-tight">حساب مسؤول موثق</span> */}
          </div>
        </div>
      </div>

      {/* كارتات الإحصائيات 📊 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="إجمالي السواق"
          value={stats.totalDrivers}
          icon={Car}
          color="bg-blue-500"
          shadowColor="shadow-blue-500/20"
        />
        <StatCard
          title="طلبات معلقة"
          value={stats.pendingDrivers}
          icon={Clock}
          color="bg-[#FACC15]"
          shadowColor="shadow-[#FACC15]/20"
        />
        <StatCard
          title="إجمالي الركاب"
          value={stats.totalPassengers}
          icon={Users}
          color="bg-purple-500"
          shadowColor="shadow-purple-500/20"
        />
        <StatCard
          title="عدد الخطوط"
          value={stats.totalRoutes}
          icon={MapPin}
          color="bg-green-500"
          shadowColor="shadow-green-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* قسم التنبيهات السريعة ⚠️ */}
        <div className="lg:col-span-2 bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-800">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <TrendingUp className="text-[#FACC15]" /> نشاط النظام الأخير
          </h3>
          <div className="space-y-6">
            {/* هنا تگدر تسوي Map لآخر أحداث صارت بالسيرفر */}
            {
              stats.pendingDrivers > 0 && (
                <div className="flex items-center gap-4 p-4 bg-[#0F172A]/50 rounded-2xl border border-gray-800">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-bold">
                  هناك {stats.pendingDrivers} سواق ينتظرون التفعيل
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  راجع صفحة التوثيق لإضافتهم ⏳
                </p>
              </div>
            </div>
              )
            }
            {/* مثال ثاني */}
            <div className="flex items-center gap-4 p-4 bg-[#0F172A]/50 rounded-2xl border border-gray-800">
              <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-bold">النظام مستقر تماماً</p>
                <p className="text-xs text-gray-500 mt-1">
                  كل الرحلات الحالية مراقبة ومؤمنة 🛡️
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* كارت "أكشن" سريع ⚡ */}
        <div className="bg-gradient-to-br from-[#FACC15] to-[#EAB308] rounded-[2.5rem] p-8 text-black flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#FACC15]/10">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">تحتاج مساعدة؟ 🧐</h3>
            <p className="font-bold opacity-80 text-sm">
              تگدر تصدر تقارير يومية أو تراجع أداء السواق من هنا.
            </p>
          </div>
          <button disabled className="cursor-not-allowed relative z-10 mt-6 bg-dark-bg/70 text-white/70 font-black py-4 rounded-2xl hover:scale-105 transition-transform shadow-xl">
            تحميل التقارير 📄
          </button>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
