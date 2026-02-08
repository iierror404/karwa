import { useState } from "react"; // 👈 أضفنا useContext
import { Phone, Lock, LogIn, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom"; // 👈 غيرنا Navigate إلى useNavigate
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // 👈 هسة كدرنا نوصل لدالة حفظ المستخدم
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);

      if (res.data.success) {
        const userData = res.data.user;

        // 1. خزن البيانات بالـ Context فوراً
        login(userData);

        // 2. طلع التنبيه
        toast.success("أهلاً بعودتك! نورت كروة ✨");

        console.log("Role is:", userData.role);

        // 3. الـ Navigation لازم يصير فوراً بدون ما ننتظر setLoading
        // الـ setLoading(false) راح تصير بالـ finally أصلاً
        if (userData.role === "driver") {
          navigate("/driver/dashboard", { replace: true }); // replace تخلي المستخدم ما يگدر يرجع للـ login بـ Back
        } else {
          navigate("/search", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login failed ❌", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-dark-bg flex items-center justify-center p-6 text-white">
      <div className="bg-dark-card p-8 rounded-3xl w-full max-w-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-primary mb-2">كروة</h1>
          <p className="text-secondary text-sm">
            سجل دخولك وابدأ رحلتك ويا خطوط العراق 🚐
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-md mx-auto w-full"
        >
          {/* Phone Input */}
          <div className="relative">
            <Phone className="absolute right-4 top-4 text-gray-500" size={20} />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              className="w-full p-4 pr-12 rounded-2xl bg-dark-bg border border-gray-800 outline-none focus:border-primary transition-all text-right"
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute right-4 top-4 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full p-4 pr-12 rounded-2xl bg-dark-bg border border-gray-800 outline-none focus:border-primary transition-all text-right"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary text-black font-bold p-4 rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-[0_4px_20px_rgba(250,204,21,0.3)]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <LogIn size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-500 text-sm">
            ما عندك حساب؟{" "}
            <span className="text-primary font-bold cursor-pointer hover:underline">
              <Link to="/register">سجل من هنا 📝</Link>
            </span>
          </p>
          <button className="text-gray-400 text-xs flex items-center justify-center mx-auto hover:text-white transition-colors">
            نسيت كلمة المرور؟{" "}
            <ArrowRight size={14} className="mr-1 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
