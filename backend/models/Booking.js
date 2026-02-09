import mongoose from "mongoose";
import { BOOKING_STATUS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.ObjectId,
      ref: "Route",
      required: true,
    },
    status: {
      type: String,
      enm: Object.values(BOOKING_STATUS),
      default: "pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    message: {
      // 💬 رسالة اختيارية من الراكب (مثلاً: "عندي طفل وياي")
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ passengerId: 1, routeId: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
