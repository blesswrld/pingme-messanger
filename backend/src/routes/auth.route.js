import express from "express";
import {
    checkAuth,
    login,
    logout,
    signup,
    updateProfile,
    updateProfileTheme,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.post("/update-theme", protectRoute, updateProfileTheme);

router.get("/check", protectRoute, checkAuth);

export default router;
