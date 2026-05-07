import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectService from "../services/projectServices.js";

export const getStudentProject = asyncHandler(async (req, res, next) =>{
    const studentId = req.user._id;

    const project = await projectService.getProjectByStudentId(studentId);

    if(!project){
        return res.status(200).json({
            success: true,
            data: { project: null },
            message: "No project found for the student"
        });
    }
    res.status(200).json({
        success: true,
        data: { project },
    });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
    const {title, description} = req.body;
    const studentId = req.user._id;

    const existingProject = await projectService.getProjectByStudentId(studentId);

    if (existingProject && existingProject.status !== "rejected") {
        return next(new ErrorHandler("You already have an active project. You can only submit a new proposal if the previous one was rejected.", 400));
    }

    const projectData = {
        student: studentId,
        title,
        description,
    };

    const project = await projectService.createProject(projectData);

    await User.findByIdAndUpdate(studentId, { project: project._id });

    res.status(201).json({
        success: true,
        data: { project },
        message: "Project proposal submitted successfully"
    });
});

export const uploadFiles = asyncHandler(async (req, res, next) => {
    const {projectId} = req.params;
    const studentId = req.user._id;
    const project = await projectService.getProjectById(projectId);

    if(!project || project.student.toString() !== studentId.toString()){
        return next(new ErrorHandler("Not authorized to upload files for this project", 403));
    }
    if(!req.files || req.files.length === 0){
        return next(new ErrorHandler("No files uploaded", 400));
    }
    const updatedProject = await projectService.addFilesToProject(projectId, req.files);
    
    res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        data: { project: updatedProject },
    });
});

export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
    const supervisors = await User.find({ role: "Teacher"}).select("name email department expertise").lean();
    res.status(200).json({
        success: true,
        data: { supervisors },
        message: "Available supervisors fetched successfully",
    });
});