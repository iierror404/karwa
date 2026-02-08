import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // نسحب بيانات اليوزر 📦

const Home = () => {
  const { user } = useAuth(); // نشوف اليوزر مسجل دخول لو لا

  return (
    <div className="height bg-[#0F172A] text-white">
      {/* --- محتوى الصفحة الرئيسي (Hero Section) 🚀 --- */}
      <main className="flex flex-col items-center justify-center text-center px-4 pt-32">
        <div className="relative">
          <div className="absolute -inset-4 bg-[#FACC15] blur-3xl opacity-10 rounded-full"></div>
          <h2 className="text-6xl md:text-8xl font-black mb-6 relative">
            تطبيق <span className="text-[#FACC15]">كروة</span>
          </h2>
        </div>

        <p className="max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed mb-10">
          المنصة الأولى في العراق لربط السائقين بالركاب بكل سهولة وأمان. سواء
          كنت صاحب سيارة تريد تزيد دخلك، أو راكب يبحث عن رحلة مريحة.. كروة هي
          خيارك الأنسب.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {!user && (
            <>
              <Link
                to="/register"
                className="px-8 py-4 bg-[#FACC15] text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]"
              >
                ابدأ رحلتك الآن
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all"
              >
                تعرف علينا
              </Link>
            </>
          )}
          {user && (
            <>
              <Link
                to={user.role === "driver" ? "/driver/dashboard" : "/search"}
                className="px-8 py-4 bg-[#FACC15] text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform"
              >
                {user.role === "driver"
                  ? "انتقل إلى لوحة تحكم السائق"
                  : "ابحث عن خط"}
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-transparent border border-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all"
              >
                تعرف علينا
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
