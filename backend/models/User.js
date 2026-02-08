import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      match: [
        /^07[785]\d{8}$/,
        "الرجاء إدخال رقم عراقي صحيح (آسيا، زين، كورك) 🇮🇶",
      ],
      minlength: [11, "رقم الهاتف العراقي لازم 11 رقم 📏"],
      maxlength: [11, "رقم الهاتف العراقي لازم 11 رقم 📏"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      // Admin, Driver, Passenger
      type: String,
      enum: ["passenger", "driver", "admin"],
      required: true,
      default: "passenger",
    },
    accountStatus: {
      type: String,
      required: true,
      enum: ["pending", "approved", "banned", "rejected"],
      default: "pending",
    },
    profileImg: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/068/404/150/large_2x/minimalist-user-grey-avatar-icon-silhouette-for-profile-picture-website-app-ui-ux-placeholder-account-identification-or-contact-graphic-resource-free-vector.jpg", // صورة مؤقتة
    },
    documents: {
      // اذا كان سائق
      nationalCardFront: { type: String, default: "" }, // رابط الصورة من Cloudinary
      nationalCardBack: { type: String, default: "" },
      residencyCardFront: { type: String, default: "" },
      residencyCardBack: { type: String, default: "" },
    },
    message: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // إذا الباسورد ممتغير، اخرج من الدالة فوراً
  if (!this.isModified("password")) return; 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // ماكو داعي نكتب next() هنا بمود الـ async
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
