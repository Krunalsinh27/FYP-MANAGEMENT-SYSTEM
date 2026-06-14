import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as notificationServices from "../services/notificationServices.js";
import * as projectServices from "../services/projectServices.js";
import { Project } from "../models/project.js";
import { SupervisorRequest } from "../models/supervisorRequest.js";

export const createStudent = asyncHandler(async (req, res, next) => {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password || !department) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const user = await userServices.createUser({
        name,
        email,
        password,
        department,
        role: "Student",
    });
    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: { user },
    });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.role; //Prevent role update
    delete updateData.password

    const user = await userServices.updateUser(id, updateData);
    if (!user) {
        return next(new ErrorHandler("Student not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: { user },
    });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if (!user) {
        return next(new ErrorHandler("Student not found", 404));
    }

    if (user.role !== "Student") {
        return next(new ErrorHandler("User is not a student", 400));
    }

    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
    });
});

export const createTeacher = asyncHandler(async (req, res, next) => {
    const { name, email, password, department, maxStudents, expertise, experties } = req.body;
    const expertiseValue = expertise ?? experties;
    if (!name || !email || !password || !department || !maxStudents || !expertiseValue) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const user = await userServices.createUser({
        name,
        email,
        password,
        department,
        maxStudents,
        expertise: Array.isArray(expertiseValue)
            ? expertiseValue
            : typeof expertiseValue === "string" && expertiseValue.trim() !== ""
                ? expertiseValue.split(",").map((s) => s.trim())
                : [],
        role: "Teacher",
    });
    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: { user },
    });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.role; //Prevent role update

    const user = await userServices.updateUser(id, updateData);
    if (!user) {
        return next(new ErrorHandler("Teacher not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: { user },
    });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userServices.getUserById(id);
    if (!user) {
        return next(new ErrorHandler("Teacher not found", 404));
    }

    if (user.role !== "Teacher") {
        return next(new ErrorHandler("User is not a student", 400));
    }

    await userServices.deleteUser(id);
    res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
    });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await userServices.getAllUsers();
    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: { users },
    });
});


export const getAllProjects = asyncHandler(async (req, res, next) => {
    const projects = await projectServices.getAllProjects();
    res.json({
        success: true,
        message: "Project fetch successfully",
        data: { projects },
    })
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
    const [
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingRequests,
        completedProjects,
        pendingProjects,
    ] = await Promise.all([
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Teacher" }),
        Project.countDocuments(),
        SupervisorRequest.countDocuments({ status: "pending" }),
        Project.countDocuments({ status: "completed" }),
        Project.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
        success: true,
        message: "Admin Dashboard stats fetched",
        data: {
            stats: {
                totalStudents,
                totalTeachers,
                totalProjects,
                pendingRequests,
                completedProjects,
                pendingProjects,
            },
        },
    });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
    const { studentId, supervisorId } = req.body;

    if (!studentId || !supervisorId) {
        return next(new ErrorHandler("Student ID and Supervisor ID are required", 400));
    }

    const project = await Project.findOne({ student: studentId });

    if (!project) {
        return next(new ErrorHandler("Project not found", 404))
    }


    if (project.supervisor !== null) {
        return next(new ErrorHandler("Supervisor already assigned", 400));
    }

    if (project.status != "approved") {
        return next(new ErrorHandler("Project not approved yet", 400));
    } else if (project.status === "pending" || project.status === "rejected") {
        return next(new ErrorHandler("Project is in pending state or rejected", 400));
    }

    const { student, supervisor } = await userServices.assignSupervisorDirectly(studentId, supervisorId);

    project.supervisor = supervisor;
    await project.save();

    await notificationServices.notifyUser(
        studentId,
        `You have been assigned a supervisor ${supervisor.name}`,
        "approval",
        "/students/status",
        "low"
    );

    await notificationServices.notifyUser(
        supervisorId,
        `The student ${student.name} has been officially assigned to you for FYP supervision.`,
        "general",
        "/teachers/status",
        "low"
    );

    res.status(200).json({
        success: true,
        message: "Supervisor assigned successfully",
        data: { student, supervisor },
    });
});

export const getProject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const project = await projectServices.getProjectById(id);

    if(!project){
        return next(new ErrorHandler("Project not found", 404));
    }

    const user = req.user;
    const userRole = (user.role || "").toLowerCase();
    const userId = user._id?.toString() || user.id;
    const hasAccess = userRole === "admin" || project.student._id.toString() === userId || (project.supervisor && project.supervisor._id.toString() === userId);

    if(!hasAccess){
        return next(new ErrorHandler("Not authorized to fetch project", 403));
    }

    return res.status(200).json({
        success: true,
        data: { project },
    });
});

export const updateProjectStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;
    const user = req.user;
    const project = await projectServices.getProjectById(id);

    if(!project){
        return next(new ErrorHandler("Project not found", 404));
    }  
    
    const userRole = (user.role || "").toLowerCase();
    const userId = user._id?.toString() || user.id;
    const hasAccess = userRole === "admin" || project.student._id.toString() === userId || (project.supervisor && project.supervisor._id.toString() === userId);

    if(!hasAccess){
        return next(new ErrorHandler("Not authorized to update project status", 403));
    }

    const updatedProject = await projectServices.updateProject(id, updatedData);

    return res.status(200).json({
        success: true,
        message: "Project status updated successsfully",
        data: { project: updatedProject },
    });
});


