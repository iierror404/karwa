import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  USER_ROLES,
  ACCOUNT_STATUS,
  VALIDATION,
  DEFAULT_VALUES,
} from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
      // Regex يتحقق يبدأ بـ 07 وبعده (7 أو 8 أو 5) وبعده 8 أرقام
      match: [VALIDATION.PHONE_REGEX, VALIDATION.PHONE_ERROR_MESSAGE],
      minlength: [VALIDATION.PHONE_LENGTH, VALIDATION.PHONE_LENGTH_ERROR],
      maxlength: [VALIDATION.PHONE_LENGTH, VALIDATION.PHONE_LENGTH_ERROR],
    },
    password: {
      type: String,
      required: true,
      minlength: DEFAULT_VALUES.PASSWORD_MIN_LENGTH,
    },
    role: {
      // Admin, Driver, Passenger
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
      default: USER_ROLES.PASSENGER,
    },
    accountStatus: {
      type: String,
      required: true,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },
    profileImg: {
      type: String,
      default: DEFAULT_VALUES.PROFILE_IMAGE,
    },
    documents: {
      // اذا كان سائق
      nationalCardFront: { type: String, default: "" }, // رابط الصورة من Cloudinary
      nationalCardBack: { type: String, default: "" },
      residencyCardFront: { type: String, default: "" },
      residencyCardBack: { type: String, default: "" },
    },
    message: {
      // رسالة من الادمن للسائق عند الرفض او القبول او الحظر
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // 🔔 إعدادات كتم الإشعارات
    muteNotificationsUntil: {
      type: Date,
      default: null,
    },
    isMutedPermanently: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // إذا الباسورد ممتغير، اخرج من الدالة فوراً
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(DEFAULT_VALUES.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  // ماكو داعي نكتب next() هنا بمود الـ async
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
