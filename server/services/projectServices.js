import { Project } from "../models/project.js"; 

export const getProjectByStudentId = async (studentId) => {
    return await PromiseRejectionEvent.findOne({student: studentId}).sort({ createdAt: -1}); 
};