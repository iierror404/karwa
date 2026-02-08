import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // نسحب بيانات اليوزر
import { Award, Heart, ShieldCheck, MapPin } from "lucide-react"; // أيقونات للقصة والرؤية

const About = () => {
  const { user } = useAuth(); // نشوف اليوزر مسجل دخول لو لا

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* --- محتوى صفحة "من نحن" 🌟 --- */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-[#FACC15] mb-4 relative z-10">
            قصتنا
            <span className="absolute -inset-2 bg-[#FACC15] blur-2xl opacity-10 rounded-full z-0"></span>
          </h2>
          <p className="max-w-3xl mx-auto text-gray-400 text-lg">
            كروة ليست مجرد تطبيق، بل هي رؤية لتحويل تجربة النقل في العراق. بدأت
            فكرتنا من الحاجة الملحة لحلول نقل آمنة، موثوقة، ومريحة تناسب
            التحديات الفريدة لمدننا. نحن نؤمن بقوة التكنولوجيا في تسهيل حياة
            الناس وربطهم ببعضهم البعض.
          </p>
        </div>

        {/* --- قيمنا الأساسية (Our Values) 💪 --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          <div className="bg-[#1E293B] p-8 rounded-3xl border border-gray-800 text-center shadow-xl hover:shadow-2xl hover:border-[#FACC15]/30 transition-all duration-300">
            <Award size={48} className="text-[#FACC15] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">الجودة</h3>
            <p className="text-gray-400">
              نلتزم بتقديم أفضل الخدمات، من اختيار السائقين إلى دعم العملاء.
            </p>
          </div>
          <div className="bg-[#1E293B] p-8 rounded-3xl border border-gray-800 text-center shadow-xl hover:shadow-2xl hover:border-[#FACC15]/30 transition-all duration-300">
            <ShieldCheck size={48} className="text-[#FACC15] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">الأمان</h3>
            <p className="text-gray-400">
              سلامة ركابنا وسائقينا هي أولويتنا القصوى في كل رحلة.
            </p>
          </div>
          <div className="bg-[#1E293B] p-8 rounded-3xl border border-gray-800 text-center shadow-xl hover:shadow-2xl hover:border-[#FACC15]/30 transition-all duration-300">
            <Heart size={48} className="text-[#FACC15] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">الثقة</h3>
            <p className="text-gray-400">
              نبني علاقات طويلة الأمد مع مستخدمينا على أساس الشفافية والمصداقية.
            </p>
          </div>
        </section>

        {/* --- رؤيتنا (Our Vision) 🌍 --- */}
        <section className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
            رؤيتنا للمستقبل
          </h3>
          <p className="max-w-3xl mx-auto text-gray-400 text-lg mb-8">
            نتطلع لأن نكون الرائد الأول في حلول النقل الذكي في العراق، مساهمين
            في بناء مجتمعات أكثر ترابطاً وازدهاراً. هدفنا هو توفير تجربة نقل لا
            مثيل لها، تجمع بين التكنولوجيا المتقدمة واللمسة الإنسانية.
          </p>
          <MapPin
            size={64}
            className="text-[#FACC15] mx-auto animate-bounce-slow"
          />
        </section>

        {/* --- دعوة للعمل (Call to Action) 🏁 --- */}
        {!user ? (
          <div className="text-center mt-12">
            <h3 className="text-3xl font-black text-white mb-10">
              انضم إلى عائلة كروة اليوم!
            </h3>
            <Link
              to="/register"
              className="px-8 py-4 bg-[#FACC15] text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]"
            >
              ابدأ رحلتك كراكب أو سائق
            </Link>
          </div>
        ) : (
          <Link
            to="/search"
            className="block mx-auto w-fit px-8 py-4 bg-[#FACC15] text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]"
          >
            ابحث عن خطك الأن
          </Link>
        )}
      </main>

      {/* --- Footer (اختياري) --- */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-800 mt-10">
        &copy; 2026 كروة. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};

export default About;
