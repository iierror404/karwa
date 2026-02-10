import express from "express";
const router = express.Router();
import {
  getDriverBookingsController,
  getPassengerBookingsController,
  requestBookingController,
  updateBookingStatusController,
  reportAbsenceController, // 👈 الإضافة هنا
  cancelBookingController,
  expelPassengerController,
} from "../controllers/bookingController.js";
import { protectMidleware } from "../middleware/authMiddleware.js";

router.post("/request", protectMidleware, requestBookingController);
router.post("/report-absence", protectMidleware, reportAbsenceController); // 👈 إضافة المسار
router.patch("/status/:id", protectMidleware, updateBookingStatusController);
router.get("/driver/", protectMidleware, getDriverBookingsController);
router.get("/my-bookings", protectMidleware, getPassengerBookingsController);
router.post("/cancel", protectMidleware, cancelBookingController); // 👈 إضافة روت الإلغاء
router.post("/expel", protectMidleware, expelPassengerController); // 👈 إضافة روت الطرد

export default router;
