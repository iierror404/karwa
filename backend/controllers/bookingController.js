import { getIO } from "../config/socket.js";
import Booking from "../models/Booking.js";
import Route from "../models/Route.js";

/**
 * @desc    إرسال طلب حجز (من الراكب) + تنبيه السائق
 * @route   POST /api/bookings/request
 */
export const requestBookingController = async (req, res) => {
  try {
    const { routeId, message } = req.body;

    if (!routeId) return res.status(400).json({
      success: false,
      msg: "يجب ارسال معرف الخط، يرجى اعادة المحاولة"
    });

    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ msg: "الخط غير موجود! ❌" });

    if (route.avilableSeats <= 0) {
      return res.status(400).json({ msg: "عذراً، هذا الخط مكتمل (فول)! 🚫" });
    }

    // إنشاء الحجز
    const booking = await Booking.create({
      passengerId: req.user.id,
      routeId: routeId,
      driverId: route.driverId,
      message,
    });

    // جلب بيانات الراكب والخط لإرسالها عبر السوكيت 📡
    const populatedBooking = await Booking.findById(booking._id)
      .populate("passengerId", "fullName profileImg phone")
      .populate("routeId", "fromArea toArea");

    // ⚡ تنبيه السايق: نرسل الإشعار لغرفة السايق الخاصة
    const io = getIO();
    io.emit(`new_booking_notification_${route.driverId}`, {
      msg: `وصلك طلب حجز جديد من ${req.user.fullName} 🎫`,
      booking: populatedBooking
    });

    res.status(201).json({ success: true, booking: populatedBooking });
    console.log(`📩 طلب حجز جديد لخط: ${route.fromArea} من الراكب: ${req.user.fullName} 🚗`);
    
  } catch (error) {
    console.log("RequestBookingController Error: \n", error);
    res.status(500).json({ msg: "فشل إرسال الطلب! 🔥" });
  }
};

/**
 * @desc    تحديث حالة الحجز (من قبل السائق) + تنبيه الراكب
 * @route   PATCH /api/bookings/status/:id
 */
export const updateBookingStatusController = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ msg: "الحجز غير موجود! 🔍" });

    // التأكد إن اللي جاي يحدث هو السايق صاحب الخط
    if (booking.driverId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "غير مسموح لك بتغيير حالة هذا الحجز! ✋" });
    }

    if (status === "accepted" && booking.status !== "accepted") {
      const route = await Route.findById(booking.routeId);
      if (route.avilableSeats > 0) {
        route.avilableSeats -= 1;
        await route.save();
      } else {
        return res.status(400).json({ msg: 'لا توجد مقاعد كافية للموافقة! ⚠️' });
      }
    }

    booking.status = status;
    await booking.save();

    // ⚡ تنبيه الراكب: نبلغه إذا انقبل حكزه أو انرفض بلحظتها
    const io = getIO();
    io.emit(`booking_status_updated_${booking.passengerId}`, {
      bookingId: booking._id,
      status: status,
      msg: status === 'accepted' ? 'تم قبول حجزك بنجاح! ✅' : 'نعتذر، تم رفض طلب الحجز. ❌'
    });

    res.json({ 
      success: true, 
      msg: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} الحجز بنجاح ✅`, 
      booking 
    });

  } catch (error) {
    console.log("error in update booking status controller: \n", error)
    res.status(500).json({ msg: 'فشل تحديث الحالة! 🔥' });
  }
};

/**
 * @desc    جلب كافة طلبات الحجز الخاصة بالسائق الحالي
 * @route   GET /api/bookings/driver
 */
export const getDriverBookingsController = async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.user.id })
      .populate("passengerId", "fullName phone profileImg")
      .populate("routeId", "fromArea toArea")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ msg: "فشل جلب الطلبات! 🔥" });
  }
};

/**
 * @desc    جلب حجوزات الراكب الحالي (اشتراكاتي)
 * @route   GET /api/bookings/my-bookings
 */
export const getPassengerBookingsController = async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.user.id })
      .populate("routeId", "fromArea toArea province price")
      .populate("driverId", "fullName phone profileImg") // ضفتلك تفاصيل السيارة هنا 🏎️
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Error in getPassengerBookings: ", error);
    res.status(500).json({ msg: "فشل في جلب حجوزاتك! 🔥" });
  }
};