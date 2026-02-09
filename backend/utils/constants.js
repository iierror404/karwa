export const USER_ROLES = {
  ADMIN: "admin",
  DRIVER: "driver",
  PASSENGER: "passenger",
};

export const ACCOUNT_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  BANNED: "banned",
};

export const ROUTE_STATUS = {
  ACTIVE: "active",
  FULL: "full",
  INACTIVE: "inactive"
}

export const BOOKING_STATUS = {
    PENDING: 'pending',        // قيد الانتظار ⏳
    ACCEPTED: 'accepted',      // تم القبول ✅
    REJECTED: 'rejected',      // مرفوض ❌
};

export const CHAT_MESSAGE_TYPES = {
    TEXT: 'TEXT',              // رسالة عادية 💬
    BOOKING_REQUEST: 'REQUEST', // طلب حجز من داخل الشات 🎫
    SYSTEM: 'SYSTEM'           // رسالة من النظام (مثل: السايق انطلق) 🤖
};
