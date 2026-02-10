import Message from "../models/Message.js";
import Route from "../models/Route.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";
import { CHAT_MESSAGE_TYPES } from "../utils/constants.js";

/**
 * @desc ارسال رسالة جديدة
 * @route POST /api/chat/send
 */
export const sendMessage = async (req, res) => {
  try {
    const {
      routeId,
      receiverId,
      content,
      messageType,
      chatType = "private",
    } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      route: routeId,
      sender: senderId,
      receiver: receiverId, // ممكن يكون null في حالة القروب
      content,
      messageType: messageType || CHAT_MESSAGE_TYPES.TEXT,
      chatType,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate(
      "sender",
      "fullName profileImg",
    );
    const io = getIO();

    // 🎯 تحديد الغرفة بناءً على نوع الشات
    if (chatType === "group") {
      // شات القروب: الكل يسمع
      io.to(`route_${routeId}`).emit("new_message", populatedMessage);

      // 🔔 إرسال إشعارات لكل المشتركين في الخط
      try {
        const route = await Route.findById(routeId).select(
          "driverId fromArea toArea",
        );
        if (route) {
          const routeName = `${route.fromArea} ⬅ ${route.toArea}`;

          // جلب كل الركاب المقبولين في هذا الخط
          const acceptedBookings = await Booking.find({
            routeId,
            status: "accepted",
          }).select("passengerId");

          const passengerIds = acceptedBookings.map((b) =>
            b.passengerId.toString(),
          );
          const driverId = route.driverId.toString();

          // قائمة كل المستلمين المحتملين (سائق + ركاب)
          const allParticipants = [driverId, ...passengerIds];

          // فلترة المرسل من قائمة الحاصلين على الإشعار
          const notificationRecipients = allParticipants.filter(
            (id) => id !== senderId.toString(),
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
                title: `رسالة جماعية في خط: ${routeName}`,
                body: `${req.user.fullName}: ${content}`,
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
      } catch (err) {
        console.error("Error sending group notifications:", err);
      }
    } else {
      // شات خاص (تفاوض)

      let passengerIdInRoom = senderId.toString();

      if (req.user.role === "driver") {
        passengerIdInRoom = receiverId ? receiverId.toString() : null;
      }

      // 1. إرسال الرسالة لغرفة الشات المفتوحة (للي فاتح الشات حالياً)
      if (passengerIdInRoom) {
        const roomName = `negotiation_${routeId}_${passengerIdInRoom}`;
        io.to(roomName).emit("new_message", populatedMessage);
      }

      // 2. 🔔 إرسال إشعار للطرف الثاني
      if (receiverId) {
        let routeName = "";

        // التحقق من الاشتراك (اذا الراكب مشترك بالخط)
        // المستخدم الحالي هو المرسل. اذا كان سائق، والمستلم راكب، نشيك اذا الراكب مشترك
        if (req.user.role === "driver") {
          const isSubscribed = await Booking.exists({
            routeId,
            passengerId: receiverId,
            status: "accepted",
          });

          if (isSubscribed) {
            const routeDetails =
              await Route.findById(routeId).select("fromArea toArea");
            routeName = routeDetails
              ? `${routeDetails.fromArea} ⬅ ${routeDetails.toArea}`
              : "";
          }
        } else {
          // اذا المرسل راكب، يرسل للسائق، السائق دائماً يشوف اسم الخط لان هو خطه
          const routeDetails =
            await Route.findById(routeId).select("fromArea toArea");
          routeName = routeDetails
            ? `${routeDetails.fromArea} ⬅ ${routeDetails.toArea}`
            : "";
        }

        const recipient = await User.findById(receiverId).select(
          "muteNotificationsUntil isMutedPermanently",
        );
        const now = new Date();
        const isMuted =
          recipient?.isMutedPermanently ||
          (recipient?.muteNotificationsUntil &&
            recipient.muteNotificationsUntil > now);

        if (!isMuted) {
          io.to(`user_${receiverId}`).emit("message_notification", {
            title: `رسالة جديدة من ${req.user.fullName}`,
            body: content,
            routeId,
            chatType,
            senderId: senderId,
            senderName: req.user.fullName,
            senderImage: req.user.profileImg,
            routeName,
            type: "message",
          });
        }
      }
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.log("error in send Message controller: \n", error);
    res.status(500).json({ success: false, message: "مشكلة بالسيرفر" });
  }
};

/**
 * @desc جلب قائمة المحادثات (للسائق)
 * @route GET /api/chat/conversations
 */
export const getDriverConversations = async (req, res) => {
  try {
    const driverId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          chatType: "private",
          $or: [{ sender: driverId }, { receiver: driverId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            otherPerson: {
              $cond: {
                if: { $eq: ["$sender", driverId] },
                then: "$receiver",
                else: "$sender",
              },
            },
            route: "$route",
          },
          lastMessage: { $first: "$$ROOT" },
          // حساب عدد الرسائل غير المقروءة (المستلم هو السائق الحالي)
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", driverId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherPerson",
          foreignField: "_id",
          as: "otherPersonDetails",
        },
      },
      {
        $lookup: {
          from: "routes",
          localField: "_id.route",
          foreignField: "_id",
          as: "routeDetails",
        },
      },
      {
        $project: {
          otherPerson: { $arrayElemAt: ["$otherPersonDetails", 0] },
          route: { $arrayElemAt: ["$routeDetails", 0] },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      // ترتيب المحادثات: الأحدث أولاً
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل جلب المحادثات" });
  }
};

/**
 * @desc جلب قائمة محادثات الراكب (My Inbox)
 * @route GET /api/chat/my-conversations
 */
export const getPassengerConversations = async (req, res) => {
  try {
    const passengerId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          chatType: "private",
          $or: [{ sender: passengerId }, { receiver: passengerId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            otherPerson: {
              $cond: {
                if: { $eq: ["$sender", passengerId] },
                then: "$receiver",
                else: "$sender",
              },
            },
            route: "$route",
          },
          lastMessage: { $first: "$$ROOT" },
          // حساب عدد الرسائل غير المقروءة (المستلم هو الراكب الحالي)
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", passengerId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherPerson",
          foreignField: "_id",
          as: "otherPersonDetails",
        },
      },
      {
        $lookup: {
          from: "routes",
          localField: "_id.route",
          foreignField: "_id",
          as: "routeDetails",
        },
      },
      {
        $project: {
          otherPerson: { $arrayElemAt: ["$otherPersonDetails", 0] },
          route: { $arrayElemAt: ["$routeDetails", 0] },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      // ترتيب المحادثات: الأحدث أولاً
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل جلب المحادثات" });
  }
};

/**
 * @desc جلب تاريخ المحادثة
 * @route GET /api/chat/history/:routerId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { chatType = "private", otherUserId } = req.query;
    const currentUserId = req.user._id;

    let query = { route: routeId, chatType };

    if (chatType === "private") {
      // اذا شات خاص، لازم نرجع الرسايل اللي بيني وبين الطرف الثاني فقط
      if (otherUserId) {
        query.$or = [
          { sender: currentUserId, receiver: otherUserId },
          { sender: otherUserId, receiver: currentUserId },
        ];
      } else {
        // اذا ماكو طرف ثاني محدد (حالة نادرة المفروض ما تصير اذا الفرونت شغال صح)
        // نرجع الرسايل اللي اني طرف بيها
        query.$or = [{ sender: currentUserId }, { receiver: currentUserId }];
      }
    }

    // نجيب الرسايل الخاصة بهذا الخط والاشخاص المعنيين
    const messages = await Message.find(query)
      .populate("sender", "fullName profileImg")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل جلب الرسايل 📉" });
  }
};

/**
 * @desc تحديث الرسائل كمقروءة عند فتح المحادثة
 * @route PUT /api/chat/mark-read/:routeId
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { otherUserId } = req.query;
    const currentUserId = req.user._id;

    // تحديث جميع الرسائل غير المقروءة في هذه المحادثة
    // (الرسائل التي أنا المستلم فيها)
    const updateQuery = {
      route: routeId,
      receiver: currentUserId,
      isRead: false,
    };

    // إذا كان هناك طرف ثاني محدد (شات خاص)
    if (otherUserId) {
      updateQuery.sender = otherUserId;
    }

    const result = await Message.updateMany(updateQuery, { isRead: true });

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الرسائل بنجاح",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل تحديث حالة الرسائل" });
  }
};

/**
 * @desc حذف المحادثة (من جهة واحدة أو حذف نهائي)
 * @route DELETE /api/chat/conversation/:routeId
 */
export const deleteConversationController = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { otherUserId } = req.query;
    const currentUserId = req.user._id;

    if (!otherUserId) {
      return res
        .status(400)
        .json({ success: false, message: "معرف الطرف الآخر مطلوب" });
    }

    // حذف كافة الرسائل الخاصة بين الطرفين في هذا الخط
    const result = await Message.deleteMany({
      route: routeId,
      chatType: "private",
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    });

    res.status(200).json({
      success: true,
      message: "تم حذف المحادثة بنجاح",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    res.status(500).json({ success: false, message: "فشل حذف المحادثة" });
  }
};
