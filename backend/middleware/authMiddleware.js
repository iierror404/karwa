import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectMidleware = async (req, res, next) => {
  let token;

  // 1. هسة نجيب التوكن من الكوكيز بدلاً من الـ Authorization Header 🍪
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // 2. فك التوكن واستخراج الـ ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. نجيب بيانات اليوزر ونحطها بـ req.user
      // ملاحظة: الـ Role هسة صار جزء من req.user يعني الـ adminProtect راح تشتغل طبيعي 😎
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ msg: "اليوزر ما موجود بالنظام! 🕵️‍♂️" });
      }

      // 4. التحقق من حالة الحساب 🛡️
      const { accountStatus, role } = req.user;

      if (accountStatus === "banned") {
        return res.status(403).json({
          msg: "حسابك محظور من قبل الإدارة! 🚫",
          status: "banned",
          message:
            req.user.message || "يرجى التواصل مع الإدارة للمزيد من التفاصيل",
        });
      }

      if (accountStatus === "rejected") {
        return res.status(403).json({
          msg: "تم رفض طلب انضمامك للنظام ❌",
          status: "rejected",
          message:
            req.user.message || "يرجى مراجعة بياناتك والتواصل مع الإدارة",
        });
      }

      // للسائقين: يجب أن يكون الحساب APPROVED للوصول للمسارات المحمية
      if (role === "driver" && accountStatus === "pending") {
        return res.status(403).json({
          msg: "حسابك قيد المراجعة حالياً ⏳",
          status: "pending",
        });
      }

      next();
    } catch (error) {
      console.error("Cookie Token Error ❌:", error.message);
      res.status(401).json({ msg: "الجلسة منتهية، سجل دخول مرة ثانية 🔑" });
    }
  } else {
    // 4. إذا أصلاً ماكو كوكي اسمها token
    res.status(401).json({ msg: "غير مصرح لك، سجل دخول أولاً! 🛑" });
  }
};

// الـ adminProtect مالتك كلش تمام وما تحتاج تغيير ✅
export const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "عذراً، هذا القسم مخصص للأدمن فقط! 🚫" });
  }
};
