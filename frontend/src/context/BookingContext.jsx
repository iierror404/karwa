import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // جلب الطلبات من الباك-أند 📥
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/driver");
      setBookings(res.data.bookings);
      console.log("Bookings loaded successfully! 🔄");
    } catch (err) {
      toast.error("ما كدرنا نجيب الطلبات! 🛑");
    } finally {
      setLoading(false);
    }
  };

  // دالة تحديث الحالة (قبول/رفض) ⚖️
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await api.patch(`/bookings/status/${id}`, { status });
      toast.success(res.data.msg + " ✅");

      // تحديث الحالة بالـ State العام
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch (err) {
      toast.error(err.response?.data?.msg || "فشل التحديث! 🔥");
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{ bookings, loading, handleStatusUpdate, fetchBookings }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// Hook مخصص حتى نستدعي السياق بسهولة 🪝
export const useBookings = () => useContext(BookingContext);
