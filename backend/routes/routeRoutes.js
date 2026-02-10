import express from "express";
import {
  addRouteController,
  searchRouteController,
  getMyRoutesController,
  updateRouteStatus,
  getRouteByIdController,
} from "../controllers/routeController.js";
import { protectMidleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protectMidleware, addRouteController);
router.get("/search", searchRouteController);
router.get("/my-routes", protectMidleware, getMyRoutesController);
router.put("/update-status", protectMidleware, updateRouteStatus);
router.get("/:id", protectMidleware, getRouteByIdController);

export default router;
