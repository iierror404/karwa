import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import {
  Search,
  UserX,
  UserCheck,
  ShieldAlert,
  Phone,
  Calendar,
  User,
  Hash,
  Car,
  PersonStanding,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ManageUsers = () => {
  const { users, fetchUsers, loading, toggleUserStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    console.log(users);
  }, []);

  const getStatusStyles = (status) => {
    const styles = {
      approved: "bg-green-500/10 text-green-500",
      banned: "bg-red-500/10 text-red-500",
      pending: "bg-yellow-500/10 text-yellow-500",
    };
    return styles[status] || "bg-gray-500/10 text-gray-500";
  };

  // الفلترة حسب الاسم أو رقم الهاتف (مع حماية ضد الـ undefined) 🔍
  const allUsers = Array.isArray(users) ? users : users?.users || [];

  const filteredUsers = allUsers.filter((user) => {
    const nameMatch = user.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const phoneMatch = String(user.phone || "").includes(searchTerm);
    return nameMatch || phoneMatch;
  });

  return (
    <div
      className="min-h-screen bg-[#0F172A] p-4 md:p-8 text-white font-['Cairo']"
      dir="rtl"
    >
      {/* الهيدر والبحث 👑 */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            إدارة <span className="text-[#FACC15]">المستخدمين</span> 👥
          </h1>
          <p className="text-gray-500 font-bold mt-1 text-sm md:text-base">
            تَحكم في حسابات الركاب والسواق من مكان واحد.
          </p>
        </div>

        <div className="relative w-full xl:w-96">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-full bg-[#1E293B] border border-gray-800 rounded-2xl py-3 pr-12 pl-4 focus:outline-none focus:border-[#FACC15] transition-all font-bold text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* عرض البيانات 📊 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FACC15]"></div>
        </div>
      ) : (
        <>
          {/* نسخة اللابتوب: جدول (Desktop Table) 💻 */}
          <div className="hidden lg:block bg-[#1E293B] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-[#161E2E] text-gray-400 text-sm uppercase">
                  <th className="p-6 font-black text-center">المستخدم</th>
                  <th className="p-6 font-black text-center">رقم الهاتف</th>
                  <th className="p-6 font-black text-center">النوع</th>
                  <th className="p-6 font-black text-center">الحالة</th>
                  <th className="p-6 font-black text-center">التاريخ</th>
                  <th className="p-6 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#161E2E]/50 transition-colors"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-black">
                          <User size={20} />
                        </div>
                        <span className="font-black truncate max-w-[150px]">
                          {user.fullName}
                        </span>
                      </div>
                    </td>
                    <td
                      className="p-6 text-center font-bold text-gray-300"
                      dir="ltr"
                    >
                      {user.phone}
                    </td>
                    <td
                      className="p-6 text-center font-bold text-gray-300"
                      dir="ltr"
                    >
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black ${
                          user.role === "driver"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {user.role === "driver" ? "🚗 سائق" : "🧍‍♂️ راكب"}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-black ${getStatusStyles(
                          user.accountStatus,
                        )}`}
                      >
                        {user.accountStatus === "approved"
                          ? "نشط ✅"
                          : user.accountStatus === "banned" && "محظور 🚫"}
                      </span>
                    </td>
                    <td className="p-6 text-center text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            toggleUserStatus(
                              user._id,
                              user.accountStatus === "approved"
                                ? "banned"
                                : "approved",
                            )
                          }
                          className={`p-2 cursor-pointer rounded-xl transition-all ${user.accountStatus === "approved" ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"}`}
                        >
                          {user.accountStatus === "approved" ? (
                            <UserX size={18} />
                          ) : (
                            user.accountStatus === "banned" && (
                              <UserCheck size={18} />
                            )
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نسخة الموبايل: كارتات (Mobile Cards) 📱 */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-[#1E293B] p-5 rounded-3xl border border-gray-800 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FACC15] text-black flex items-center justify-center font-black text-xl">
                      {user.fullName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-white">{user.fullName}</h3>
                      <p className="text-xs text-gray-500" dir="ltr">
                        {user.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-1">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black ${getStatusStyles(user.accountStatus)}`}
                    >
                      {user.accountStatus === "approved"
                        ? "نشط 🟢"
                        : user.accountStatus === "banned"
                          ? "🔴 محظور"
                          : user.accountStatus === "pending" && "قيد المعالجة"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        user.role === "driver"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {user.role === "driver" ? (
                        <span className="flex items-center justify-center gap-0.5">
                          سائق <Car size={14} />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-0.5">
                          راكب <PersonStanding size={14} />
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(user.createdAt).toLocaleDateString("ar-IQ")}
                  </div>
                  <button
                    onClick={() =>
                      toggleUserStatus(
                        user._id,
                        user.accountStatus === "approved"
                          ? "banned"
                          : user.accountStatus === "banned" && "approved",
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                      user.accountStatus === "approved"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {user.accountStatus === "approved" ? (
                      <>
                        <UserX size={14} /> حظر الحساب
                      </>
                    ) : (
                      user.accountStatus === "banned" && (
                        <>
                          <UserCheck size={14} /> تفعيل
                        </>
                      )
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* رسالة في حال لا يوجد نتائج */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-20 bg-[#1E293B] rounded-[2.5rem] border border-dashed border-gray-700">
          <p className="text-gray-500 font-bold text-lg">
            ماكو مستخدم بهذا الاسم أو الرقم! 🧐
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
