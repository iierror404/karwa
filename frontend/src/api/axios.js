import axios from "axios";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;

const api = axios.create({
  baseURL: `${BACKEND_URL}:${BACKEND_PORT}/api`,
  withCredentials: true,
});

// هذا "الرادار" يصيد أي خطأ يرجع من السيرفر
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.msg || "اكو مشكلة بالسيرفر 🛑";
    toast.error(message); // يطلع التنبيه تلقائياً
    return Promise.reject(error);
  },
);

export default api;
