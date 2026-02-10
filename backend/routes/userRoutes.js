import {
  deleteUserAccount,
  updateUserProfile,
  getUserById,
  muteNotifications,
} from "../controllers/userController.js";
import { protectMidleware } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.put("/profile/update", protectMidleware, updateUserProfile);
router.delete("/profile/delete", protectMidleware, deleteUserAccount);
router.post("/mute-notifications", protectMidleware, muteNotifications);
router.get("/:id", protectMidleware, getUserById);

export default router;
