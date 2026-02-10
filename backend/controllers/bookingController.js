import { getIO } from "../config/socket.js";
import Booking from "../models/Booking.js";
import Route from "../models/Route.js";
import Message from "../models/Message.js";

/**
 * @desc    إرسال طلب حجز (من الراكب) + تنبيه السائق
 * @route   POST /api/bookings/request
 */
export const requestBookingController = async (req, res) => {
  try {
    const { routeId, message } = req.body;

    if (!routeId)
      return res.status(400).json({
        success: false,
        msg: "يجب ارسال معرف الخط، يرجى اعادة المحاولة",
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
    const driver = await User.findById(route.driverId).select(
      "muteNotificationsUntil isMutedPermanently",
    );

    const now = new Date();
    const isMuted =
      driver?.isMutedPermanently ||
      (driver?.muteNotificationsUntil && driver.muteNotificationsUntil > now);

    if (!isMuted) {
      io.to(`user_${route.driverId}`).emit(
        `new_booking_notification_${route.driverId}`,
        {
          msg: `وصلك طلب حجز جديد من ${req.user.fullName} 🎫`,
          booking: populatedBooking,
        },
      );
    } else {
      console.log(
        `🔕 Notification suppressed for muted driver: ${route.driverId}`,
      );
    }

    res.status(201).json({ success: true, booking: populatedBooking });
    console.log(
      `📩 طلب حجز جديد لخط: ${route.fromArea} من الراكب: ${req.user.fullName} 🚗`,
    );
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
      return res
        .status(403)
        .json({ msg: "غير مسموح لك بتغيير حالة هذا الحجز! ✋" });
    }

    if (status === "accepted" && booking.status !== "accepted") {
      const route = await Route.findById(booking.routeId);
      if (route.avilableSeats > 0) {
        route.avilableSeats -= 1;
        await route.save();
      } else {
        return res
          .status(400)
          .json({ msg: "لا توجد مقاعد كافية للموافقة! ⚠️" });
      }
    }

    booking.status = status;
    await booking.save();

    // ⚡ تنبيه الراكب: نبلغه إذا انقبل حكزه أو انرفض بلحظتها
    const io = getIO();
    io.emit(`booking_status_updated_${booking.passengerId}`, {
      bookingId: booking._id,
      status: status,
      msg:
        status === "accepted"
          ? "تم قبول حجزك بنجاح! ✅"
          : "نعتذر، تم رفض طلب الحجز. ❌",
    });

    res.json({
      success: true,
      msg: `تم ${status === "accepted" ? "قبول" : "رفض"} الحجز بنجاح ✅`,
      booking,
    });
  } catch (error) {
    console.log("error in update booking status controller: \n", error);
    res.status(500).json({ msg: "فشل تحديث الحالة! 🔥" });
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
      .populate(
        "routeId",
        "fromArea toArea province price carType carNumber time",
      )
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

/**
 * @desc    إبلاغ السائق بالغياب (أني باجر معطل)
 * @route   POST /api/bookings/report-absence
 */
export const reportAbsenceController = async (req, res) => {
  try {
    const { driverId, routeId } = req.body;
    const senderId = req.user.id;

    if (!routeId) {
      return res.status(400).json({ msg: "معرف الخط مطلوب" });
    }

    // 1. إنشاء رسالة في قاعدة البيانات
    const content = "اني باجر معطل، لا تمر عليه ✋";
    const newMessage = new Message({
      route: routeId,
      sender: senderId,
      content,
      chatType: "group",
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate(
      "sender",
      "fullName profileImg",
    );

    const io = getIO();

    // 2. إرسال الرسالة لغرفة الخط (للي فاتح الشات حالياً)
    console.log(`📤 Emitting new_message to room: route_${routeId}`);
    io.to(`route_${routeId}`).emit("new_message", populatedMessage);

    // 3. 🔔 إشعار السائق والركاب المشتركين
    const route = await Route.findById(routeId).select(
      "fromArea toArea driverId",
    );

    if (route) {
      const routeName = `${route.fromArea} ⬅ ${route.toArea}`;

      // جلب معرفات الركاب المشتركين
      const acceptedBookings = await Booking.find({
        routeId,
        status: "accepted",
      }).select("passengerId");

      const passengerIds = acceptedBookings.map((b) =>
        b.passengerId.toString(),
      );
      const driverIdStr = route.driverId.toString();

      // قائمة المستلمين (السائق + الركاب) ما عدا المرسل
      const allParticipants = [driverIdStr, ...passengerIds];
      const notificationRecipients = allParticipants.filter(
        (id) => id !== senderId.toString(),
      );

      console.log(
        `🔔 Sending absence notifications to ${notificationRecipients.length} recipients`,
      );

      for (const recipientId of notificationRecipients) {
        const recipient = await User.findById(recipientId).select(
          "muteNotificationsUntil isMutedPermanently",
        );
        const now = new Date();
        const isMuted =
          recipient?.isMutedPermanently ||
          (recipient?.muteNotificationsUntil &&
            recipient.muteNotificationsUntil > now);

        if (!isMuted) {
          io.to(`user_${recipientId}`).emit("message_notification", {
            title: `بلاغ غياب: ${req.user.fullName}`,
            body: content,
            routeId,
            chatType: "group",
            senderId: senderId,
            senderName: req.user.fullName,
            senderImage: req.user.profileImg,
            routeName,
            type: "message",
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      msg: "تم إبلاغ الجميع بنجاح ✅",
    });

    console.log(
      `🚫 الراكب ${req.user.fullName} أبلغ عن غيابه في خط: ${routeId}`,
    );
  } catch (error) {
    console.error("Report Absence Error:", error);
    res.status(500).json({ msg: "فشل في إرسال البلاغ" });
  }
};

/**
 * @desc    إلغاء حجز (من قبل الراكب)
 * @route   POST /api/bookings/cancel
 */
export const cancelBookingController = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ msg: "الحجز غير موجود! 🔍" });

    // التأكد إن الحجز يخص هذا الراكب
    if (booking.passengerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "غير مسموح لك بإلغاء هذا الحجز! ✋" });
    }

    const prevStatus = booking.status;
    booking.status = "cancelled";
    await booking.save();

    // إذا كان الحجز مقبولاً، نعيد المقعد المتاح للخط
    if (prevStatus === "accepted") {
      const route = await Route.findById(booking.routeId);
      if (route) {
        route.avilableSeats += 1;
        await route.save();
      }
    }

    // تنبيه السائق
    const io = getIO();
    io.to(`user_${booking.driverId}`).emit(`booking_updated_for_driver`, {
      bookingId: booking._id,
      status: "cancelled",
      msg: `قام ${req.user.fullName} بإلغاء حجزه ❌`,
    });

    res.json({ success: true, msg: "تم إلغاء الحجز بنجاح ✅" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ msg: "فشل إلغاء الحجز! 🔥" });
  }
};

/**
 * @desc    طرد راكب من الخط (من قبل السائق)
 * @route   POST /api/bookings/expel
 */
export const expelPassengerController = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate(
      "passengerId",
      "fullName",
    );

    if (!booking) return res.status(404).json({ msg: "الحجز غير موجود! 🔍" });

    // التأكد إن اللي جاي يحدث هو السايق صاحب الخط
    if (booking.driverId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "غير مسموح لك بطرد هذا الراكب! ✋" });
    }

    const prevStatus = booking.status;
    booking.status = "expelled";
    await booking.save();

    // إذا كان الحجز مقبولاً، نعيد المقعد المتاح للخط
    if (prevStatus === "accepted") {
      const route = await Route.findById(booking.routeId);
      if (route) {
        route.avilableSeats += 1;
        await route.save();
      }
    }

    // تنبيه الراكب
    const io = getIO();
    io.to(`user_${booking.passengerId._id}`).emit(
      `booking_status_updated_${booking.passengerId._id}`,
      {
        bookingId: booking._id,
        status: "expelled",
        msg: "تم استبعادك من الخط من قبل السائق! 🚫",
      },
    );

    res.json({ success: true, msg: "تم طرد الراكب بنجاح ✅" });
  } catch (error) {
    console.error("Expel Passenger Error:", error);
    res.status(500).json({ msg: "فشل استبعاد الراكب! 🔥" });
  }
};
