import express from "express";
const router = express.Router();
import { getDriverBookingsController, getPassengerBookingsController, requestBookingController, updateBookingStatusController } from "../controllers/bookingController.js";
import { protectMidleware } from "../middleware/authMiddleware.js";

router.post("/request", protectMidleware, requestBookingController);
router.patch("/status/:id", protectMidleware, updateBookingStatusController);
router.get("/driver/", protectMidleware, getDriverBookingsController);
router.get('/my-bookings', protectMidleware, getPassengerBookingsController);

export default router;
