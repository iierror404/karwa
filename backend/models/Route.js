import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    province: {
      // المحافظة
      type: String,
      required: true,
      trim: true,
    },
    fromArea: {
      type: String,
      required: true,
      trim: true,
    },
    toArea: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    days: {
      type: String,
      required: true,
    },
    time: {
      // وقت الخط
      type: String,
      required: true,
    },
    avilableSeats: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    carType: {
      // اسم السيارة كوستر, هايسا...
      type: String,
      required: true,
    },
    carNumber: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Route = mongoose.model("Route", routeSchema);

export default Route;
