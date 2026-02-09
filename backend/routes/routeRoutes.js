import express from "express";
import { addRouteController, searchRouteController, getMyRoutesController, updateRouteStatus } from "../controllers/routeController.js";
import { protectMidleware } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/add", protectMidleware, addRouteController);
router.get("/search", searchRouteController);
router.get("/my-routes", protectMidleware, getMyRoutesController);
router.get("/update-status", protectMidleware, updateRouteStatus);


export default router;
