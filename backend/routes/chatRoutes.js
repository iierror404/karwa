import express from "express";
import { protectMidleware } from "../middleware/authMiddleware.js";
import {
  getChatHistory,
  sendMessage,
  getDriverConversations,
  getPassengerConversations,
  markMessagesAsRead,
  deleteConversationController, // 👈 الإضافة هنا
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", protectMidleware, sendMessage);
router.get("/conversations", protectMidleware, getDriverConversations);
router.get("/my-conversations", protectMidleware, getPassengerConversations); // للركاب
router.get("/history/:routeId", protectMidleware, getChatHistory);
router.put("/mark-read/:routeId", protectMidleware, markMessagesAsRead);
router.delete(
  "/conversation/:routeId",
  protectMidleware,
  deleteConversationController,
); // 👈 إضافة روت الحذف

export default router;
