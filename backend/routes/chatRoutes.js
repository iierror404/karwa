import express from "express";
import { protectMidleware } from "../middleware/authMiddleware"
import { getChatHistory, sendMessage } from "../controllers/chatController";

const router = express.Router();

router.post("/send", protectMidleware, sendMessage);
router.get("/history/:routerId", protectMidleware, getChatHistory);

export default router;
