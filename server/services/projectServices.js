import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/project.js"; 

export const getProjectByStudentId = async (studentId) => {
    return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
};

export const createProject = async (projectData) => {
    const project = new Project(projectData);
    await project.save();
    return project;
};

export const getProjectById = async (id) => {
    const project = await Project.findById(id).populate("student", "name email").populate("supervisor", "name email");

    if(!project){
        throw new Error("Project not found", 400);
    }
    return project;
};

export const addFilesToProject = async (projectId, files) => {
    const project = await Project.findById(projectId)

    if(!project){
        throw new ErrorHandler("Project not found", 400);
    }
    const fileMetadata = files.map(file => ({
        fileType: file.mimetype,
        fileUrl: file.path,
        originalName: file.originalname,
        uploadedAt: new Date(),
    }));
    project.files.push(...fileMetadata);
    await project.save();
    return project;
};

export const getAllProjects = async() => {
    const projects = await Project.find();
    return projects;
};