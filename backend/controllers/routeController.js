import { getIO } from "../config/socket.js";
import Route from "../models/Route.js";
import { ROUTE_STATUS, USER_ROLES } from "../utils/constants.js";

/**
 * @desc    إضافة خط جديد (خاص بالسائق)
 * @route   POST /api/routes/add
 */
export const addRouteController = async (req, res) => {
  try {
    const {
      province,
      fromArea,
      toArea,
      price,
      time,
      days,
      totalSeats,
      carNumber,
      carType,
    } = req.body;

    const newRoute = await Route.create({
      driverId: req.user.id,
      province,
      fromArea,
      toArea,
      price,
      time,
      days,
      totalSeats,
      avilableSeats: totalSeats,
      carType,
      carNumber,
    });

    if (req.user.role !== "driver")
      return res.status(400).json({
        success: false,
        msg: "فقط السائقين يمكنهم انشاء خط جديد 🚘",
      });
    res.status(201).json({ success: true, data: newRoute });
    console.log(`🚐 خط جديد انضاف: من ${fromArea} إلى ${toArea}`);
  } catch (err) {
    res.status(500).json({ msg: "فشل إضافة الخط! 🔥", error: err.message });
  }
};

/**
 * @desc    البحث عن خطوط (خاص بالراكب)
 * @route   GET /api/routes/search
 */
export const searchRouteController = async (req, res) => {
  try {
    const { province, fromArea, toArea } = req.query;

    // 🏗️ الهيكل الجديد للفلترة
    let filter = {
      "routeStatus.status": "active", // نطلع بس الخطوط النشطة ✅
      "routeStatus.isDriverAvilable": true, // والسايق لازم يكون متوفر 🚐
    };

    // 💡 استخدام Regex للبحث المرن مع إزالة الفراغات
    if (province) {
      filter.province = { $regex: province.trim(), $options: "i" };
    }

    if (fromArea) {
      filter.fromArea = { $regex: fromArea.trim(), $options: "i" };
    }

    if (toArea) {
      filter.toArea = { $regex: toArea.trim(), $options: "i" };
    }

    // 🏎️ تنفيذ الاستعلام مع الـ Populate والترتيب
    const routes = await Route.find(filter)
      .populate("driverId", "fullName phone profileImg carDetails") // ضفت carDetails تفيدك بالبحث
      .sort({
        createdAt: -1, // الأحدث أولاً 🆕
      });

    // الرد على الفرونت أند
    res.status(200).json({
      success: true,
      results: routes.length,
      data: routes,
    });

    console.log(
      `🔎 بحث جديد في ${province || "كل المناطق"} - النتائج: ${routes.length} 🚐✨`,
    );
  } catch (error) {
    console.log("❌ Search Route Error: \n", error);
    res.status(500).json({
      success: false,
      msg: "صار خلل بالبحث، حاول مرة ثانية! 🔍",
      error: error.message,
    });
  }
};

/**
 * @desc    جلب خطوط السائق نفسه
 * @route   GET /api/routes/my-routes
 */
export const getMyRoutesController = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.DRIVER)
      return res.status(400).json({
        success: false,
        msg: "غير مصرح لك بالدخول ❗",
      });
    const routes = await Route.find({ driverId: req.user.id });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ msg: "فشل جلب خطوطك! ❌" });
  }
};

/**
 * @desc    تحديث حالة الخط (نشط، مفول، متوقف)
 * @route   PUT /api/routes/updateRouteStatus
 */
export const updateRouteStatus = async (req, res) => {
  try {
    const { routeId, newStatus, noteMessage, isDriverAvilable } = req.body;

    // 1. التحديث لازم يستهدف الحقول داخل routeStatus 🎯
    const updatedRoute = await Route.findByIdAndUpdate(
      routeId,
      {
        $set: {
          "routeStatus.status": newStatus,
          "routeStatus.noteMessage": noteMessage || "",
          "routeStatus.isDriverAvailable":
            isDriverAvilable !== undefined ? isDriverAvilable : true,
        },
      },
      { new: true },
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "الخط غير موجود! ❌" });
    }

    // 2. إرسال التحديث بالـ Socket ⚡
    const io = getIO();
    io.emit("route_status_updated", {
      routeId: updatedRoute._id,
      newStatus: updatedRoute.routeStatus.status,
      noteMessage: updatedRoute.routeStatus.noteMessage,
      isDriverAvailable: updatedRoute.routeStatus.isDriverAvilable,
    });

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الخط بنجاح! ✅",
      updatedRoute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "صار خلل بتحديث الحالة 🤦‍♂️",
      error: error.message,
    });
    console.log(error);
  }
};
/**
 * @desc    جلب تفاصيل خط معين (مفيد للشات وغيره)
 * @route   GET /api/routes/:id
 */
export const getRouteByIdController = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate(
      "driverId",
      "fullName phone profileImg carDetails",
    );

    if (!route) {
      return res.status(404).json({ msg: "الخط غير موجود 🤷‍♂️" });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ msg: "فشل جلب تفاصيل الخط 💥" });
  }
};
