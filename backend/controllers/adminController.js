import User from "../models/User.js";
import Route from "../models/Route.js";

/**
 * @desc    جلب قائمة السواق اللي مستمسكاتهم قيد المراجعة
 * @route   GET /api/admin/pending-drivers
 */
export const getPendingDriversController = async (req, res) => {
  try {
    const driver = await User.find({
      role: "driver",
      accountStatus: "pending",
    });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ msg: "خطأ في جلب البيانات! ❌" });
  }
};

/**
 * @desc    الموافقة على السائق أو رفضه
 * @route   PATCH /api/admin/verify-driver/:id
 */
export const verifyDriverController = async (req, res) => {
  try {
    const { status, rejMsg } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.params.id,
      {
        accountStatus: status,
        message: status === "accepted" ? "تم قبولك من قبل الأدارة ✅" : rejMsg,
      },
      { new: true },
    );

    if (!driver) return res.status(404).json({ msg: "السائق غير موجود! 🔍" });

    res.json({ msg: `تم تحديث حالة الحساب إلى: ${status} ✅`, driver });
  } catch (error) {
    console.log("Error in VerifyDriverController: \n", error);
    res.status(500).json({ msg: "فشل في تحديث الحالة! ❌" });
  }
};

/**
 * 1. إحصائيات سريعة (Dashboard Stats) 📊
 * @route GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalDrivers = await User.countDocuments({ role: "driver" });
    const pendingDrivers = await User.countDocuments({
      role: "driver",
      accountStatus: "pending",
    });
    const totalPassengers = await User.countDocuments({ role: "passenger" });

    // إذا عندك مودل للرحلات تقدر تضيفه هنا
    const totalRoutes = await Route.countDocuments();

    res.status(200).json({
      success: true,
      status: {
        totalDrivers,
        pendingDrivers,
        totalPassengers,
        totalRoutes,
        activeUsers: totalDrivers + totalPassengers,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "خطأ في جلب الإحصائيات ❌", error: error.message });
  }
};

/**
 * 2. إيقاف حساب أو تفعيله (Ban/Unban) 🚫
 * @route PATCH /api/admin/toggle-status/:id
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const {status} = req.body;
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "المستخدم غير موجود! 🔍" });

    user.accountStatus = status; // يعكس الحالة الحالية
    await user.save();

    res.status(200).json({
      success: true,
      message: `تم ${user.isActive ? "تفعيل" : "إيقاف"} الحساب بنجاح ✅`,
      status: user.accountStatus,
    });
  } catch (error) {
    console.log("Error in ToggleStatusController: \n", error);
    res.status(500).json({ message: "فشل في تغيير حالة الحساب ❌" });
  }
};

/**
 * 3. جلب كل المستخدمين مع فلاتر (User Management) 👥
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.fullName = { $regex: search, $options: "i" }; // بحث بالاسم (Case-insensitive)
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب المستخدمين ❌" });
  }
};

/**
 * 4. جلب السواق اللي مستمسكاتهم قيد المراجعة 📂
 * @route GET /api/admin/pending-drivers
 */
export const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await User.find({
      role: "driver",
      isVerified: false,
      "documents.nationalCardFront": { $ne: "" }, // تأكد إنهم رافعين مستمسكات فعلاً
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, drivers: pendingDrivers });
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب طلبات السواق ❌" });
  }
};
