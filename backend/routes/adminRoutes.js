import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getPendingDriversController,
  toggleUserStatus,
  verifyDriverController,
} from "../controllers/adminController.js";
import {
  adminProtect,
  protectMidleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @desc — جلب قائمة السواق اللي مستمسكاتهم قيد المراجعة
 * @route — GET /api/admin/pending-drivers

 */
router.get(
  "/pending-drivers",
  protectMidleware,
  adminProtect,
  getPendingDriversController,
);

/**
 * @desc — الموافقة على السائق أو رفضه
 * @route — PATCH /api/admin/verify-driver/:id
 */
router.patch(
  "/verify-driver/:id",
  protectMidleware,
  adminProtect,
  verifyDriverController,
);

router.get("/stats", protectMidleware, adminProtect, getAdminStats);
router.get("/users", protectMidleware, adminProtect, getAllUsers);
router.patch(
  "/toggle-status/:id",
  protectMidleware,
  adminProtect,
  toggleUserStatus,
);

export default router;
