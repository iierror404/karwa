import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid"; // حبيبنا الـ UUID 🆔

// 2. تحديث البيانات (تعديل)
export const updateUserProfile = async (req, res) => {
  const { fullName, phone } = req.body;
  let updateData = { fullName, phone };
  console.log("Body:", req.body);
  console.log("Files:", req.files);

  try {
    let user = await User.findById(req.user.id);

    // إذا رفع صورة جديدة (الاسم جاي من الفرونت أند 'avatar')
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const customFileName = `${uuidv4()}-${Date.now()}`; // الـ UUID مالتنا 🆔

      // نستخدم upload بدل upload_stream لأن الملف موجود بالـ temp
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "karwa/profileImages",
        public_id: customFileName,
        resource_type: "image",
      });

      // حذف القديمة إذا موجودة
      if (user.avatar_id) {
        await cloudinary.uploader.destroy(user.avatar_id);
      }

      updateData.profileImg = uploadResult.secure_url;
      // updateData.avatar_id = uploadResult.public_id;
    }

    console.log(updateData);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    res.json({ msg: "تم التحديث بنجاح! ✅", user: updatedUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "خلل بالسيرفر! ❌" });
  }
};

// 3. حذف الحساب (حذف)
export const deleteUserAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "تم حذف الحساب نهائياً.. نتشاوف بخير 🗑️👋" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("خطأ أثناء الحذف ❌");
  }
};

// 4. جلب معلومات مستخدم معين (لأغراض الشات والملف العام)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("خطأ في السيرفر");
  }
};
