import {
  deleteUserAccount,
  updateUserProfile,
  getUserById,
} from "../controllers/userController.js";
import { protectMidleware } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

router.put("/profile/update", protectMidleware, updateUserProfile);
router.delete("/profile/delete", protectMidleware, deleteUserAccount);
router.get("/:id", protectMidleware, getUserById);

export default router;
