import { useState } from "react"; // 👈 أضفنا useContext
import api from "../api/axios";
import { toast } from "react-hot-toast";
import FileInputCustom from "../components/FileInputCustom";
import { Loader2, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // 👈 استخدمنا useNavigate للتوجيه
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("passenger");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const [documents, setDocuments] = useState({
    nationalCardFront: null,
    nationalCardBack: null,
    residencyCardFront: null,
    residencyCardBack: null,
  });
  const { login } = useAuth(); // سحبنا الأدوات من الكونتيكست 🛠️

  const navigate = useNavigate(); // 👈 دالة التوجيه

  // دالة لتحديث اختيار الملفات 📂
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("هاي الحركات مال أول ابتدائي.. ارفع صورة JPG وبس");
        e.target.value = "";
        return;
      }

      const fileNameParts = file.name.split(".");
      if (fileNameParts.length > 2) {
        toast.error("هاي الحركات مال أول ابتدائي.. ارفع صورة JPG وبس");
        e.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("عمي هاي صخرة مو صورة! سويها أقل من 2 ميجا رحم لوالديك");
        e.target.value = "";
        return;
      }

      setDocuments((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. تحضير البيانات (بما إنو اكو ملفات نستخدم FormData) 📂
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("phone", formData.phone);
    data.append("password", formData.password);
    data.append("role", role);

    // 2. التحقق من مستندات السائق 🪪
    if (role === "driver") {
      const {
        nationalCardFront,
        nationalCardBack,
        residencyCardFront,
        residencyCardBack,
      } = documents;

      if (
        !nationalCardFront ||
        !nationalCardBack ||
        !residencyCardFront ||
        !residencyCardBack
      ) {
        toast.error("يرجى ارفاق جميع الصور المطلوبة 📸");
        setLoading(false);
        return;
      }

      // إضافة الصور للـ FormData
      data.append("nationalCardFront", nationalCardFront);
      data.append("nationalCardBack", nationalCardBack);
      data.append("residencyCardFront", residencyCardFront);
      data.append("residencyCardBack", residencyCardBack);
    }

    try {
      // 3. إرسال البيانات للسيرفر 🚀
      const res = await api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const userData = res.data.user;

      // 4. 🔥 تحديث الـ Context والخزن (استخدمنا دالة login الموحدة)
      // هاي الدالة هي اللي راح تسوي stringify وتخزن بالـ localStorage
      login(userData);

      toast.success(
        `أهلاً بيك يا ${role === "driver" ? "سايقنا" : "راكبنا"} الجديد! 🎉`,
      );

      if (userData.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/search");
      }

      console.log("Registration Success ✅:", userData);

    } catch (err) {
      const errorMsg = err.response?.data?.msg || "اكو مشكلة بالتسجيل 🛑";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (role !== "driver") return 0;
    const fields = [
      formData.fullName,
      formData.phone,
      formData.password,
      documents.nationalCardFront,
      documents.nationalCardBack,
      documents.residencyCardFront,
      documents.residencyCardBack,
    ];
    const completedFields = fields.filter(
      (field) => field !== "" && field !== null && field !== undefined,
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div
      dir="auto"
      className="min-h-screen bg-dark-bg flex items-center justify-center p-6 text-white"
    >
      <div className="bg-dark-card p-8 rounded-3xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex flex-row-reverse bg-dark-bg p-1 rounded-2xl mb-8 border border-gray-800">
          <button
            type="button"
            onClick={() => setRole("passenger")}
            className={`cursor-pointer flex-1 py-3 rounded-xl transition-all ${
              role === "passenger"
                ? "bg-primary text-black font-bold"
                : "text-secondary"
            }`}
          >
            راكب 🙋‍♂️
          </button>
          <button
            type="button"
            onClick={() => setRole("driver")}
            className={`cursor-pointer flex-1 py-3 rounded-xl transition-all ${
              role === "driver"
                ? "bg-primary text-black font-bold"
                : "text-secondary"
            }`}
          >
            سائق 🚖
          </button>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-primary">
          إنشاء حساب {role === "driver" ? "سائق كروة" : "راكب جديد"}
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            className="w-full p-4 rounded-xl bg-dark-bg border border-gray-700 outline-none focus:border-primary placeholder:text-right"
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required
          />

          <input
            type="tel"
            placeholder="رقم الهاتف"
            className="w-full p-4 rounded-xl bg-dark-bg border border-gray-700 outline-none focus:border-primary placeholder:text-right"
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          {role === "driver" && (
            <>
              <h4 className="text-xs font-bold text-primary text-center mb-2">
                {progress}%
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <FileInputCustom
                    label="البطاقة الموحدة (وجه)"
                    onChange={(e) => handleFileChange(e, "nationalCardFront")}
                    fileName={documents.nationalCardFront}
                  />
                </div>
                <div className="space-y-1">
                  <FileInputCustom
                    label="البطاقة الموحدة (ظهر)"
                    onChange={(e) => handleFileChange(e, "nationalCardBack")}
                    fileName={documents.nationalCardBack}
                  />
                </div>
                <div className="h-px my-1.5 bg-secondary opacity-50 md:hidden"></div>
                <div className="space-y-1">
                  <FileInputCustom
                    label="بطاقة السكن (وجه)"
                    onChange={(e) => handleFileChange(e, "residencyCardFront")}
                    fileName={documents.residencyCardFront}
                  />
                </div>
                <div className="space-y-1">
                  <FileInputCustom
                    label="بطاقة السكن (ظهر)"
                    onChange={(e) => handleFileChange(e, "residencyCardBack")}
                    fileName={documents.residencyCardBack}
                  />
                </div>
              </div>
            </>
          )}

          <input
            type="password"
            placeholder="كلمة السر"
            className="w-full p-4 rounded-xl bg-dark-bg border border-gray-700 outline-none focus:border-primary placeholder:text-right"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button
            disabled={loading}
            type="submit"
            className={`cursor-pointer w-full font-bold py-4 rounded-xl shadow-lg transition-all ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-primary hover:bg-yellow-500 text-black shadow-[0_4px_20px_rgba(250,204,21,0.3)] active:scale-95"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin ml-2" size={20} />
              </div>
            ) : (
              <span>سجل الآن 📝</span>
            )}
          </button>
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-500 text-sm flex justify-center items-center">
              عندك حساب؟{" "}
              <span className="text-primary flex items-center justify-center font-bold cursor-pointer hover:underline">
                <Link to="/register">سجل من هنا </Link>
                <LogIn size={16} className="mr-0.5" />
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
