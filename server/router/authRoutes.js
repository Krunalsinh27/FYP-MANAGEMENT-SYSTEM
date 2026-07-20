import express from "express";
import { 
    registerStudent,
    registerTeacher,
    verifyEmail,
    resendVerificationEmail,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Registration Routes
router.post("/register/student", registerStudent);
router.post("/register/teacher", registerTeacher);

// Email Verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Authentication Routes
router.post("/login", login);
router.get("/me", isAuthenticated, getMe);
router.get("/logout", isAuthenticated, logout);

// Password Reset Routes
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;