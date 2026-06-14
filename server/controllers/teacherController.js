import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectServices from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import * as fileServices from "../services/fileServices.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";
import { sendEmail } from "../services/emailService.js";
import { generateRequestAcceptedTemplate, generateRequestRejectedTemplate } from "../utils/emailTemplates.js";


export const getTeacherDashboardStats = asyncHandler(async (req, res, next) => {
    const teacherId = req.user._id;

    const totalPendingRequests = await SupervisorRequest.countDocuments({
        supervisor: teacherId,
        status: "pending",
    });
    const completedProjects = await SupervisorRequest.countDocuments({
        supervisor: teacherId,
        status: "completed",
    });
    const recentNotifications = await Notification.find({
        user: teacherId,
    }).sort({ createdAt: -1 }).limit(5);

    const dashboardStats = {
        totalPendingRequests,
        completedProjects,
        recentNotifications,
    };

    res.status(200).json({
        success: "true",
        message: "Dashboard stas fetched for teacher successfully",
        data: { dashboardStats },
    });
});


export const getRequest = asyncHandler(async (req, res, next) => {

    const { supervisor } = req.query;

    const filters = {};
    if (supervisor) filters.supervisor = supervisor;

    const { requests, total } = await requestServices.getAllRequests(filters);

    const updatedRequests = await Promise.all(requests.map(async (reqObj) => {
        const requestObj = reqObj.toObject ? reqObj.toObject() : reqObj;
        if (requestObj?.student?._id) {
            const latestProject = await Project.findOne({
                student: requestObj.student._id,
            }).sort({ createdAt: -1 }).lean();

            return { ...requestObj, latestProject };
        }
        return requestObj;
    })
    );

    res.status(200).json({
        success: true,
        message: "Requests fetched successfully",
        data: {
            requests: updatedRequests,
            total,
        }
    })

})

export const acceptRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const teacherId = req.user._id;

    const request = await requestServices.acceptRequest(requestId, teacherId);
    if (!request) return next(new ErrorHandler("Request not found", 404));

    await notificationServices.notifyUser(
        request.student._id,
        `Your supervisor request has been accepted by ${req.user.name}`,
        "approval",
        "/students/status",
        "low"
    );


    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestAcceptedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail,
        subject: "FYP SYSTEM -✅ Your supervisor request has been Accepted",
        message,
    });

    res.status(200).json({
        success: true,
        message: "Request accepted successfully",
        data: { request },
    });
});


export const rejectRequest = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const teacherId = req.user._id;

    const request = await requestServices.rejectRequest(requestId, teacherId);
    if (!request) return next(new ErrorHandler("Request not found", 404));

    await notificationServices.notifyUser(
        request.student._id,
        `Your supervisor request has been rejected by ${req.user.name}`,
        "rejection",
        "/students/status",
        "high"
    );

    const student = await User.findById(request.student._id);
    const studentEmail = student.email;
    const message = generateRequestRejectedTemplate(req.user.name);
    await sendEmail({
        to: studentEmail,
        subject: "FYP SYSTEM - ❌ Your supervisor request has been Rejected",
        message,
    });

    res.status(200).json({
        success: true,
        message: "Request rejected",
        data: { request },
    });
})

export const getAssignedStudents = asyncHandler(async (req, res, next) => {
    const teacherId = req.user._id;
    const students = await User.find({ supervisor: teacherId }).populate("project").sort({ createdAt: -1 });

    const total = await User.countDocuments({ supervisor: teacherId });

    res.status(200).json({
        success: true,
        data: {
            students,
            total,
        },
    });
});

export const markComplete = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const teacherId = req.user._id;

    const project = await projectServices.getProjectById(projectId);

    if (!project) return next(new ErrorHandler("Project not found", 404));
    if (project.supervisor._id.toString() !== teacherId.toString()) {
        return next(new ErrorHandler("Not authorized to mark complete", 403));
    }

    const updatedProject = await projectServices.markComplete(projectId);

    await notificationServices.notifyUser(
        project.student._id,
        `Your project has been marked as completed by your supervisor (${req.user.name})`,
        "general",
        "/students/status",
        "low"
    );

    res.status(200).json({
        success: true,
        data: {
            project: updatedProject,
        },
        message: "Project marked as completed",
    });
});

export const addFeedback = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const teacherId = req.user._id;
    const { message, title, type } = req.body;

    const project = await projectServices.getProjectById(projectId);
    if (!project) return next(new ErrorHandler("Project not found", 404));
    if (project.supervisor._id.toString() !== teacherId.toString()) {
        return next(new ErrorHandler("Not authorized to mark complete", 403));
    }

    if (!message || !title) return next(new ErrorHandler("Feedback title and message are required", 400));

    const { peoject: updatedProject, latestFeedback } =
        await projectServices.addFeedback(
            projectId,
            teacherId,
            message,
            title,
            type
        );

    await notificationServices.notifyUser(
        project.student._id,
        `New feedback from your supervisor (${req.user.name})`,
        "feedback",
        "/students/feedback",
        type === "possitive" ? "low" : type === "negative" ? "high" : "low"
    );

    res.status(200).json({
        succes: true,
        message: "Feedback posted successfully",
        data: { project: updatedProject, feedback: latestFeedback },
    });
});

export const getFiles = asyncHandler(async (req, res, next) => {
    const teacherId = req.user._id;

    const projects = await projectServices.getProjectBySupervisor(teacherId);

    const allFiles = projects.flatMap((project) =>
        project.files.map((file) => ({
            ...file.toObject(),
            projectId: project._id,
            projectTitle: project.title,
            studentName: project.student.name,
            studentEmail: project.student.email,
        }))
    );

    const total = allFiles.length;

    res.status(200).json({
        success: true,
        message: "File fetched",
        data: {
            files: allFiles,
            total,
        },
    });
});


export const downloadFile = asyncHandler(async(req, res, next) => {
    const { projectId, fileId } = req.params;
    const supervisorId = req.user._id;

    const project = await projectServices.getProjectById(projectId);
    if(!project) return next(new ErrorHandler("Project not found", 404));
    if(project.supervisor._id.toString() !== supervisorId.toString()){
        return next(new ErrorHandler("Not authorized to download file", 403))
    }
    const file = project.files.id(fileId);
    if(!file) return next(new ErrorHandler("File not found", 404));

    fileServices.streamDownload(file.fileUrl, res, file.originalName);
});