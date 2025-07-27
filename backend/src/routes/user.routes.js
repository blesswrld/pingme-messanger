import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    searchUsers,
    getConversationPartners,
    getUserProfile,
    updatePrivacySettings,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/contacts", protectRoute, getConversationPartners);
router.get("/profile/:id", protectRoute, getUserProfile);
router.put("/privacy", protectRoute, updatePrivacySettings);

export default router;
