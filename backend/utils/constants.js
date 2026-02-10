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
  PENDING: "pending", // قيد الانتظار ⏳
  ACCEPTED: "accepted", // تم القبول ✅
  REJECTED: "rejected", // مرفوض ❌
  CANCELLED: "cancelled", // ملغى من الراكب 🚫
  EXPELLED: "expelled", // مطرود من السائق ⛔
};

// ============================================
// 💬 CHAT CONSTANTS
// ============================================
export const CHAT_MESSAGE_TYPES = {
  TEXT: "TEXT", // رسالة عادية 💬
  BOOKING_REQUEST: "REQUEST", // طلب حجز من داخل الشات 🎫
  SYSTEM: "SYSTEM", // رسالة من النظام (مثل: السايق انطلق) 🤖
};

export const CHAT_TYPES = {
  PRIVATE: "private",
  GROUP: "group",
};

// ============================================
// 🌐 API ROUTES
// ============================================
export const API_ROUTES = {
  // Auth
  AUTH: {
    BASE: "/api/auth",
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    USER_STATUS: "/api/auth/userStatus",
  },
  // Admin
  ADMIN: {
    BASE: "/api/admin",
    PENDING_DRIVERS: "/api/admin/pending-drivers",
    VERIFY_DRIVER: "/api/admin/verify-driver",
    STATS: "/api/admin/stats",
    TOGGLE_STATUS: "/api/admin/toggle-status",
    USERS: "/api/admin/users",
  },
  // Routes
  ROUTES: {
    BASE: "/api/routes",
    ADD: "/api/routes/add",
    SEARCH: "/api/routes/search",
    MY_ROUTES: "/api/routes/my-routes",
    UPDATE_STATUS: "/api/routes/updateRouteStatus",
    BY_ID: "/api/routes/:id",
  },
  // Bookings
  BOOKINGS: {
    BASE: "/api/bookings",
    REQUEST: "/api/bookings/request",
    STATUS: "/api/bookings/status",
    DRIVER: "/api/bookings/driver",
    MY_BOOKINGS: "/api/bookings/my-bookings",
  },
  // User
  USER: {
    BASE: "/api/user",
    BY_ID: "/api/user/:id",
  },
  // Chat
  CHAT: {
    BASE: "/api/chat",
    SEND: "/api/chat/send",
    CONVERSATIONS: "/api/chat/conversations",
    MY_CONVERSATIONS: "/api/chat/my-conversations",
    HISTORY: "/api/chat/history",
  },
};

// ============================================
// 🔢 HTTP STATUS CODES
// ============================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// 🎨 DEFAULT VALUES
// ============================================
export const DEFAULT_VALUES = {
  PROFILE_IMAGE:
    "https://static.vecteezy.com/system/resources/previews/068/404/150/large_2x/minimalist-user-grey-avatar-icon-silhouette-for-profile-picture-website-app-ui-ux-placeholder-account-identification-or-contact-graphic-resource-free-vector.jpg",
  BCRYPT_SALT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 11,
};

// ============================================
// ✅ VALIDATION RULES
// ============================================
export const VALIDATION = {
  PHONE_REGEX: /^07[785]\d{8}$/,
  PHONE_ERROR_MESSAGE: "الرجاء إدخال رقم عراقي صحيح (آسيا، زين، كورك) 🇮🇶",
  PHONE_LENGTH_ERROR: "رقم الهاتف العراقي لازم 11 رقم 📏",
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
