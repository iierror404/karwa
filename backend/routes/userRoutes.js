import express from "express"
import { deleteUserAccount, updateUserProfile } from "../controllers/userController.js";
import {protectMidleware} from "../middleware/authMiddleware.js";
const router = express.Router();

router.put("/profile/update", protectMidleware, updateUserProfile);
router.delete("/profile/delete", protectMidleware, deleteUserAccount);

export default router;
