import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    searchUsers,
    getConversationPartners,
    getUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/contacts", protectRoute, getConversationPartners);
router.get("/profile/:id", protectRoute, getUserProfile);

export default router;
