import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  const userId = user?.id || user?._id;

  // جلب الطلبات من الباك-أند 📥
  const fetchBookings = async () => {
    if (!userId) return;
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
    fetchBookings();
  }, [userId]);

  // 🔔 استماع للحجوزات الجديدة لحظياً
  useEffect(() => {
    if (!socket || !userId) return;

    const eventName = `new_booking_notification_${userId}`;

    const handleNewBooking = (data) => {
      console.log("🆕 Real-time booking received in Context:", data);
      // إضافة الحجز الجديد لبداية القائمة
      setBookings((prev) => [data.booking, ...prev]);
    };

    socket.on(eventName, handleNewBooking);

    return () => {
      socket.off(eventName, handleNewBooking);
    };
  }, [socket, userId]);

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
