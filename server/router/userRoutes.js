import express from "express";
import { 
    registerUser, 
    forgotPassword, 
    getUser, 
    loginUser, 
    logout, 
    resetPassword, 
} from "../controllers/authController.js";
import multer from "multer";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me",isAuthenticated, getUser);
router.get("/logout",isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);


export default router;
