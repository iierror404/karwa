import express from "express";
import { protectMidleware } from "../middleware/authMiddleware.js";
import {
  getChatHistory,
  sendMessage,
  getDriverConversations,
  getPassengerConversations,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", protectMidleware, sendMessage);
router.get("/conversations", protectMidleware, getDriverConversations);
router.get("/my-conversations", protectMidleware, getPassengerConversations); // للركاب
router.get("/history/:routeId", protectMidleware, getChatHistory);

export default router;
