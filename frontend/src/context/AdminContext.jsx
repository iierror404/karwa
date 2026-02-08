// src/context/AdminContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios"; // الرادار مالتك 🔌
import toast from "react-hot-toast";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    pendingDrivers: 0,
    totalPassengers: 0,
    activeTrips: 0,
    totalRoutes: 0
  });
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [users, setUsers] = useState([]); // 👥 قائمة المستخدمين العامة
  const [loading, setLoading] = useState(false);

  // 1️⃣ جلب الإحصائيات العامة 📈
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.status);
      console.log(res.data)
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  // 2️⃣ جلب السواق اللي ينتظرون موافقة ⏳
  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pending-drivers");
      setPendingDrivers(res.data);
    } catch (err) {
      console.error("Error fetching pending drivers", err);
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ الموافقة على سائق ✅
  const approveDriver = async (driverId) => {
    try {
      await api.patch(`/admin/verify-driver/${driverId}`, {
        status: "approved"
      });
      toast.success("تم تفعيل حساب السائق بنجاح! 🎊");
      setPendingDrivers((prev) => prev.filter((d) => d._id !== driverId));
      fetchStats();
    } catch (err) {}
  };

  // 4️⃣ رفض سائق ❌
  const rejectDriver = async (driverId, rejMsg) => {
    try {
      await api.patch(`/admin/verify-driver/${driverId}`, {
        status: "rejected",
        rejMsg: rejMsg
      });
      toast.success("تم رفض الطلب وحذفه 🗑️");
      setPendingDrivers((prev) => prev.filter((d) => d._id !== driverId));
      fetchStats();
    } catch (err) {}
  };

  // 5️⃣ جلب كل المستخدمين (ركاب وسواق) 📥
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users", err);
      toast.error("فشل في تحديث قائمة المستخدمين ❌");
    } finally {
      setLoading(false);
    }
  };

  // 6️⃣ حظر أو تفعيل مستخدم 🚫
  const toggleUserStatus = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/toggle-status/${userId}`, {
        status: newStatus
      });
      
      // تحديث فوري بالواجهة بدون ريفرش ⚡
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, accountStatus: newStatus } : u
      ));

      toast.success(!currentStatus ? "تم تفعيل الحساب ✅" : "تم الحظر بنجاح 🔒");
    } catch (err) {
      // الخطأ يتعالج بالـ Interceptor مال أكسيوس
    }
  };

  return (
    <AdminContext.Provider
      value={{
        stats,
        pendingDrivers,
        users, // ضفنا اليوزرز هنا
        loading,
        fetchStats,
        fetchPendingDrivers,
        approveDriver,
        rejectDriver,
        fetchUsers, // ضفنا فنكشن جلب اليوزرز
        toggleUserStatus, // ضفنا فنكشن الحظر
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);