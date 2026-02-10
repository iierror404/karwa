import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// الصفحات والمكونات 📄
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DriverDashboard from "./pages/driver/DriverDashboard";
import Home from "./pages/Home";
import About from "./pages/About";
import PassengerHome from "./components/PassengerHome";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PendingDrivers from "./pages/Admin/PendingDrivers";
import ManageUsers from "./pages/Admin/ManageUsers";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MySubscriptions from "./pages/MySubscriptions";
import Chat from "./pages/Chat";
import PassengerNotifications from "./components/PassengerNotifications";
import GlobalMessageListener from "./components/GlobalMessageListener";
import PassengerMessagesPage from "./pages/PassengerMessagesPage";
import BannedAccount from "./pages/BannedAccount"; // 👈 استيراد صفحة الحظر
import { USER_ROLES } from "./constants/constants";
import { useAuth } from "./context/AuthContext"; // 👈 استيراد useAuth

function App() {
  const location = useLocation();
  // نحدد المسارات اللي "ما نريد" يظهر بيها النافبار
  const isDriverPage = location.pathname.startsWith("/driver");
  const isLoginPage = location.pathname.startsWith("/login");
  const isRegisterPage = location.pathname.startsWith("/register");
  const isChatPage = location.pathname.startsWith("/chat");
  const isBannedPage = location.pathname.startsWith("/banned"); // 👈 صفحة الحظر بدون نافبار

  // الشرط: نظهر النافبار فقط إذا كنا بغير هذني الصفحات
  const shouldShowNavbar =
    !isDriverPage &&
    !isLoginPage &&
    !isRegisterPage &&
    !isChatPage &&
    !isBannedPage;

  const { user } = useAuth(); // 👈 جلب اليوزر الحالي

  // 🔐 🛡️ - نظام حظر وتحقق صارم - العالمي
  // إذا اليوزر محظور أو مرفوض، ميكدر يشوف أي شي من التطبيق
  // ملاحظة: للسائق، إذا حالته pending ميكدر يشوف الداشبورد بس يكدر يشوف الـ Profile ماله؟
  // المستخدم طلب: "الواجهة كلها ماتطلعله اذا كان محظور"
  if (user && user.status && user.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Toaster position="top-center" reverseOrder={false} />
        <BannedAccount />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Toaster
        dir="rtl"
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            zIndex: 9999,
            backgroundColor: "#1E293B",
            border: "1px solid #FACC15",
            color: "#94A3B8",
            textAlign: "right",
          },
        }}
      />

      {/* مكون الاستماع لإشعارات الراكب (قبول/رفض) */}
      {/* مكون الاستماع لإشعارات الراكب (قبول/رفض) */}
      <PassengerNotifications />

      {/* --- 🔔 Global Message Listener for EVERYONE (Driver & Passenger) --- */}
      <GlobalMessageListener />

      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* المسارات العامة 🔓 */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<PassengerHome />} />
        <Route path="/passenger/messages" element={<PassengerMessagesPage />} />
        <Route path="/banned" element={<BannedAccount />} />{" "}
        {/* 👈 إضافة المسار */}
        {/* مسارات السائق المحمية 🛡️👨‍✈️ */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute roleRequired={USER_ROLES.DRIVER}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roleRequired={USER_ROLES.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute roleRequired={USER_ROLES.ADMIN}>
              <PendingDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roleRequired={USER_ROLES.ADMIN}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/me"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-subscriptions"
          element={
            <ProtectedRoute>
              <MySubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:routeId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        {/* المسار الافتراضي */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
