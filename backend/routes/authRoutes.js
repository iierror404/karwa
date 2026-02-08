import express from "express";
import { registerController, loginController, userStatusController, logout, getMe } from "../controllers/authController.js";
import { protectMidleware } from "../middleware/authMiddleware.js"

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    تسجيل مستخدم جديد مع رفع ملفات (للسواق)
 * @access  Public 🌍
 */
router.post("/register", registerController);

/**
 * @route   POST /api/auth/login
 * @desc    تسجيل دخول المستخدم وجلب التوكن
 * @access  Public 🌍
 */
router.post("/login", loginController);
router.post("/logout", logout);

router.get("/me", protectMidleware, getMe);

/**
 * @route   POST /api/auth/userStatus/:id
 * @desc    تسجيل دخول المستخدم وجلب التوكن
 * @access  Signed Users 🌍
 */
router.get("/userStatus/:id", protectMidleware, userStatusController);

export default router;
