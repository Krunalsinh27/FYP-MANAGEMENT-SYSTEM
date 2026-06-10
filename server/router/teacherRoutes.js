import express from "express";
import { getTeacherDashboardStats, acceptRequest, getRequest, rejectRequest, addFeedback, markComplete, getAssignedStudents } from "../controllers/teacherController.js";
import {
    isAuthenticated,
    isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
    "/fetch-dashboard-stats",
    isAuthenticated,
    isAuthorized("Teacher"),
    getTeacherDashboardStats
);

router.get(
    "/requests",
    isAuthenticated,
    isAuthorized("Teacher"),
    getRequest
);

router.put(
    "/requests/:requestId/accept",
    isAuthenticated,
    isAuthorized("Teacher"),
    acceptRequest
);

router.put(
    "/requests/:requestId/reject",
    isAuthenticated,
    isAuthorized("Teacher"),
    rejectRequest
);

router.post(
    "/feedback/:projectId",
    isAuthenticated,
    isAuthorized("Teacher"),
    addFeedback
);

router.post(
    "/mark-complete/:projectId",
    isAuthenticated,
    isAuthorized("Teacher"),
    markComplete
);

router.get(
    "/assigned-students",
    isAuthenticated,
    isAuthorized("Teacher"),
    getAssignedStudents
);

export default router;