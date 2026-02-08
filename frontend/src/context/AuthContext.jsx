import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; // تأكد إن ملف الـ axios فيه withCredentials: true

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. اليوزر نجيبه من الـ localStorage كـ Cache أولي فقط 💾
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const initAuth = async () => {
      // إذا ماكو يوزر بالكاش، نكدر نكتفي بالتحميل
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // نضرب عصفورين بحجر: نشيك التوكن (الكوكي) ونجيب أحدث حالة للمستخدم 🎯
        const res = await api.get("/auth/me");

        if (res.data.success) {
          const freshData = res.data.user;
          setUser(freshData);
          localStorage.setItem("user", JSON.stringify(freshData));
        }
      } catch (error) {
        console.error("Auth check failed ❌:", error.response?.data?.msg);
        
        // إذا الكوكي انمسحت أو انتهت (401 أو 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout(); // نمسح الكاش ونرجع للـ login
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 🔥 دالة تسجيل الدخول (ما تحتاج token هسة) 🔑
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // الـ Role والتوكن صاروا بأمان (واحد بالـ User object والثاني بالكوكي)
  };

  // 🔥 دالة إنشاء حساب جديد (Register)
  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData);

      // الباك أند دز الكوكي بالـ Response تلقائياً 🍪
      const { user } = res.data;
      login(user);

      return { success: true, role: user.role };
    } catch (err) {
      console.error("Register Error 🛑:", err.response?.data?.msg);
      return {
        success: false,
        message: err.response?.data?.msg || "صار خطأ أثناء إنشاء الحساب",
      };
    }
  };

  // 🔥 دالة تسجيل الخروج (لازم تبلغ الباك أند يمسح الكوكي) 🚪
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // نضرب راوت المسح بالباك أند
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.clear(); // تنظيف الـ Cache 🧹
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, setUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
