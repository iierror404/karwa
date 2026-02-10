import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // استدعاء الهوك مالتنا

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth(); // سحب البيانات من الكونتيكست

  // 1️⃣ إذا التطبيق بعده ديسوي Load للبيانات من الـ Storage
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FACC15]"></div>
      </div>
    );
  }

  // 2️⃣ 🛑 إذا ماكو توكن (يعني مسجل خروج)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ 🛡️ التحقق من حالة الحساب (محظور/مرفوض/قيد الانتظار للسايق)
  if (user.status !== "approved") {
    // نسمح له فقط بالوصول لراوت الحساب الشخصي (إذا احتاج يشوف ليش انرفض) أو صفحة الحظر
    // بما إن الـ Route هنا يغلف المكونات، حنحول الكل لـ /banned
    return <Navigate to="/banned" replace />;
  }

  // 4️⃣ 🛑 إذا اليوزر موجود بس الـ Role مالته ميسوي Match
  // مثلاً: راكب يحاول يدخل لصفحة السايق
  if (roleRequired && user?.role !== roleRequired) {
    console.log("Access Denied 🚫: Role mismatch");
    return <Navigate to="/" replace />;
  }

  // ✅ كلشي تمام؟ اعرض الصفحة
  return children;
};

export default ProtectedRoute;
