import express from "express";
import { addRouteController, searchRouteController, getMyRoutesController } from "../controllers/routeController.js";
import { protectMidleware } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/add", protectMidleware, addRouteController);
router.get("/search", searchRouteController);
router.get("/my-routes", protectMidleware, getMyRoutesController);


export default router;
