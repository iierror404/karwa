// ============================================
// 👤 USER & ACCOUNT CONSTANTS
// ============================================
export const USER_ROLES = {
  ADMIN: "admin",
  DRIVER: "driver",
  PASSENGER: "passenger",
};

export const ACCOUNT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  BANNED: "banned",
};

// ============================================
// 🚗 ROUTE & BOOKING CONSTANTS
// ============================================
export const ROUTE_STATUS = {
  ACTIVE: "active",
  FULL: "full",
  INACTIVE: "inactive",
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

export const CHAT_TYPES = {
  PRIVATE: "private",
  GROUP: "group",
};

// ============================================
// 🌐 API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    USER_STATUS: "/auth/userStatus",
  },
  // Admin
  ADMIN: {
    PENDING_DRIVERS: "/admin/pending-drivers",
    VERIFY_DRIVER: "/admin/verify-driver",
    STATS: "/admin/stats",
    TOGGLE_STATUS: "/admin/toggle-status",
    USERS: "/admin/users",
  },
  // Routes
  ROUTES: {
    ADD: "/routes/add",
    SEARCH: "/routes/search",
    MY_ROUTES: "/routes/my-routes",
    UPDATE_STATUS: "/routes/updateRouteStatus",
    BY_ID: (id) => `/routes/${id}`,
  },
  // Bookings
  BOOKINGS: {
    REQUEST: "/bookings/request",
    STATUS: (id) => `/bookings/status/${id}`,
    DRIVER: "/bookings/driver",
    MY_BOOKINGS: "/bookings/my-bookings",
  },
  // User
  USER: {
    BY_ID: (id) => `/user/${id}`,
  },
  // Chat
  CHAT: {
    SEND: "/chat/send",
    CONVERSATIONS: "/chat/conversations",
    MY_CONVERSATIONS: "/chat/my-conversations",
    HISTORY: (routeId) => `/chat/history/${routeId}`,
  },
};

// ============================================
// 🎨 UI CONSTANTS
// ============================================
export const UI_COLORS = {
  PRIMARY: "#FACC15",
  PRIMARY_DARK: "#eab308",
  BACKGROUND: "#0F172A",
  CARD_BG: "#1E293B",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#9CA3AF",
  BORDER: "#374151",
};

export const AVATAR_API_URL = "https://ui-avatars.com/api/";

export const DEFAULT_IMAGES = {
  PROFILE:
    "https://static.vecteezy.com/system/resources/previews/068/404/150/large_2x/minimalist-user-grey-avatar-icon-silhouette-for-profile-picture-website-app-ui-ux-placeholder-account-identification-or-contact-graphic-resource-free-vector.jpg",
};

// Helper function to generate avatar URL
export const getAvatarUrl = (name, background = "random", color = "fff") => {
  return `${AVATAR_API_URL}?name=${encodeURIComponent(name)}&background=${background}&color=${color}`;
};

// ============================================
// ✅ VALIDATION RULES
// ============================================
export const VALIDATION = {
  PHONE_REGEX: /^07[785]\d{8}$/,
  PHONE_ERROR_MESSAGE: "الرجاء إدخال رقم عراقي صحيح (آسيا، زين، كورك) 🇮🇶",
  PHONE_LENGTH: 11,
  PASSWORD_MIN_LENGTH: 8,
};

// ============================================
// 📝 MESSAGES (Arabic)
// ============================================
export const ERROR_MESSAGES = {
  // Auth
  USER_EXISTS: "المستخدم موجود مسبقاً ❌",
  INVALID_CREDENTIALS: "رقم الهاتف أو كلمة المرور غير صحيحة ❌",
  UNAUTHORIZED: "غير مصرح لك بالدخول 🚫",
  ACCOUNT_PENDING: "حسابك قيد المراجعة ⏳",
  ACCOUNT_REJECTED: "تم رفض حسابك ❌",
  ACCOUNT_BANNED: "تم حظر حسابك 🚫",

  // General
  SERVER_ERROR: "اكو مشكلة بالسيرفر 🛑",
  NOT_FOUND: "غير موجود ❌",
  MISSING_FIELDS: "الرجاء ملء جميع الحقول المطلوبة 📝",

  // Routes
  ROUTE_NOT_FOUND: "الخط غير موجود ❌",
  NO_SEATS_AVAILABLE: "ما اكو مقاعد متاحة 🚫",

  // Bookings
  BOOKING_EXISTS: "عندك حجز مسبق على هذا الخط ⚠️",
  BOOKING_NOT_FOUND: "الحجز غير موجود ❌",

  // Chat
  CHAT_SEND_FAILED: "فشل الإرسال ❌",
  CHAT_LOAD_FAILED: "فشل تحميل المحادثة",
};

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: "تم التسجيل بنجاح ✅",
  LOGIN_SUCCESS: "تم تسجيل الدخول بنجاح ✅",

  // Routes
  ROUTE_ADDED: "تم إضافة الخط بنجاح ✅",
  ROUTE_UPDATED: "تم تحديث الخط بنجاح ✅",

  // Bookings
  BOOKING_CREATED: "تم إرسال طلب الحجز ✅",
  BOOKING_ACCEPTED: "تم قبول الحجز ✅",
  BOOKING_REJECTED: "تم رفض الحجز ❌",

  // Admin
  DRIVER_VERIFIED: "تم التحقق من السائق ✅",
  STATUS_UPDATED: "تم تحديث الحالة ✅",
};

// ============================================
// 🔔 SOCKET EVENTS
// ============================================
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  NEW_MESSAGE: "new_message",
  NEW_BOOKING: "new_booking",
  BOOKING_STATUS_UPDATE: "booking_status_update",
  ROUTE_UPDATE: "route_update",
};
