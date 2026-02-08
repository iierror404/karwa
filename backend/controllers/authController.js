import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid"; // استيراد المكتبة 🆔

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
@desc    تسجيل مستخدم جديد (راكب أو سائق)
@route   POST /api/auth/register
*/
export const registerController = async (req, res) => {
  try {
    const { fullName, phone, password, role } = req.body;

    // 🕵️‍♂️ فحص يدوي سريع للرقم قبل أي شي
    const iraqiPhoneRegex = /^07[785]\d{8}$/;
    if (!iraqiPhoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        msg: "الرقم غير صحيح",
      });
    }
    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ msg: "هذا الرقم مسجل مسبقاً! ⚠️" });

    // * if he is driver upload the files

    let documents = {};
    if (role === "driver" && req.files) {
      const uploadPromises = Object.keys(req.files).map(async (key) => {
        // توليد اسم فريد باستخدام UUID + الوقت الحالي لزيادة الأمان 🛡️
        const uniqueFileName = `${uuidv4()}-${Date.now()}`;

        const result = await cloudinary.uploader.upload(
          req.files[key].tempFilePath,
          {
            folder: "karwa/documents",
            public_id: uniqueFileName, // 👈 هنا نحدد الاسم الجديد بالـ Cloudinary
            overwrite: false, // لضمان عدم مسح ملف قديم بالصدفة
          },
        );

        console.log(`✅ File uploaded successfully: ${uniqueFileName} 📁`);
        return { [key]: result.secure_url };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      documents = Object.assign({}, ...uploadedImages);
    }
    // * Create User
    user = await User.create({
      fullName,
      phone,
      password,
      role,
      documents,
      accountStatus: role === "passenger" ? "approved" : "pending",
    });

    console.log(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
      role === "passenger" && "approved",
    );

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true, // 🔒 أهم خاصية: تمنع الـ JS من قراءة الكوكي
      secure: false, // تشتغل بس وية HTTPS
      sameSite: "lax", // تمنع هجمات الـ CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // مدة الصلاحية (مثلاً 7 أيام)
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        status: user.accountStatus,
        profileImg: user.profileImg,
        phone: user.phone,
        message: user.message,
      },
    });
    console.log(`✅ يوزر جديد انضم لكروة: ${fullName} (${role})`);
  } catch (err) {
    res.status(500).json({ msg: "خطأ بالسيرفر! 🔥", error: err.message });
    console.log(err);
  }
};

/**
 * @desc    تسجيل الدخول
 * @route   POST /api/auth/login
 */
export const loginController = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(400).json({ msg: "الرقم أو الباسورد خطأ! ❌" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ msg: "الرقم أو الباسورد خطأ! ❌" });

    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true, // 🔒 أهم خاصية: تمنع الـ JS من قراءة الكوكي
      secure: false, // تشتغل بس وية HTTPS
      sameSite: "lax", // تمنع هجمات الـ CSRF stric
      maxAge: 7 * 24 * 60 * 60 * 1000, // مدة الصلاحية (مثلاً 7 أيام)
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        status: user.accountStatus,
        profileImg: user.profileImg,
        phone: user.phone,
        message: user.message,
      },
    });

    console.log(`🔓 تم تسجيل دخول: ${user.fullName}`);
  } catch (err) {
    res.status(500).json({ msg: "خطأ بالسيرفر! 🔥" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // نمسح الكوكي فوراً بجعل تاريخها قديم
  });
  res.status(200).json({ success: true, msg: "تم تسجيل الخروج بنجاح 👋" });
};

// دالة التحقق من المستخدم الحالي
export const getMe = async (req, res) => {
  try {
    // بما إننا استخدمنا protectMidleware، فاليوزر صار موجود بـ req.user
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, msg: "المستخدم غير موجود 🕵️‍♂️" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        status: user.accountStatus,
        profileImg: user.profileImg,
        phone: user.phone,
        message: user.message,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: "خطأ في السيرفر ⚠️" });
  }
};

/**
 * @desc    (تحديث حالة الحساب (شغال, متبند, قيد المراجعة, مرفوض
 * @route   GET /api/auth/userStatus
 */
export const userStatusController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    res.status(200).json({
      userStatus: user.accountStatus,
    });
  } catch (error) {
    console.log("error in userStatusController: \n", error);
    res.status(500).json({ msg: "فشل في جلب حالة المستخدم" });
  }
};
