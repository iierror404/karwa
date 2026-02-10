// backend/models/Message.js
import mongoose from "mongoose";
import { CHAT_MESSAGE_TYPES } from "../utils/constants.js";

const messageSchema = new mongoose.Schema(
  {
    route: {
      // الرسالة مرتبطة بيا خط؟
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    sender: {
      // منو دز الرسالة؟
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      // لمنو رايحة؟ (اختياري في حالة الشات العام للخط)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: Object.values(CHAT_MESSAGE_TYPES),
      default: CHAT_MESSAGE_TYPES.TEXT,
    },
    chatType: {
      // نوع الشات: خاص (تفاوض) أو عام (قروب الخط)
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
