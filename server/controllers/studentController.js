import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectService from "../services/projectServices.js";

export const getStudentProject = asyncHandler(async (req, res, next) =>{
    const studentId = req.user._id;

    const {project} = await projectService.getProjectByStudentId(studentId);

    const project = 
});