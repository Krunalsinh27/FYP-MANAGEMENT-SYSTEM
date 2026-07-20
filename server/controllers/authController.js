// import { asyncHandler } from "../middlewares/asyncHandler.js";
// import ErrorHandler from "../middlewares/error.js";
// import { User } from "../models/user.js";
// import { sendEmail } from "../services/emailService.js";
// import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
// import { generateToken } from "../utils/generateToken.js";
// import crypto from "crypto";

// // REGISTER USER
// export const registerUser = asyncHandler(async (req, res, next) => {
//     const { name, email, password, role } = req.body;
//     if (!name || !email || !password || !role) {
//         return next(new ErrorHandler("Please enter all required fields.", 400));
//     }
//     let user = await User.findOne({ email });
//     if (user) {
//         return next(new ErrorHandler("User already exists.", 400));
//     }
//     user = new User({ name, email, password, role });
//     await user.save();
//     generateToken(user, 201, "User registered successfully.", res);
// });

// export const loginUser = asyncHandler(async (req, res, next) => {
//     const { email, password, role } = req.body;
//     if (!email || !password || !role) {
//         return next(new ErrorHandler("Please enter all required fields.", 400));
//     }
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//         return next(new ErrorHandler("Invalid email, password or role.", 401));
//     }
//     if (user.role.toLowerCase() !== role.toLowerCase()) {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid role"
//         });
//     }
//     const isPasswordMatched = await user.comparePassword(password);
//     if (!isPasswordMatched) {
//         return next(new ErrorHandler("Invalid email, password or role.", 401));
//     }
//     generateToken(user, 200, "logged in successfully.", res);
// });

// export const logout = asyncHandler(async (req, res, next) => {
//     const isProd = process.env.NODE_ENV === 'production';
//     res.status(200).cookie("token", "", {
//         expires: new Date(Date.now()),
//         httpOnly: true,
//         sameSite: 'none',
//         secure: isProd,
//         path: '/',
//     }).json({
//         success: true,
//         message: "Logged out successfully.",
//     });
// });

// export const getUser = asyncHandler(async (req, res, next) => {
//     const user = req.user;
//     res.status(200).json({
//         success: true,
//         user,
//     });
// });


import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";

// Register Student
export const registerStudent = asyncHandler(async (req, res, next) => {
    const {
        name,
        enrollmentNumber,
        email,
        password,
        confirmPassword,
        department,
        semester,
        mobileNumber
    } = req.body;

    // Validation
    if (!name || !enrollmentNumber || !email || !password || !confirmPassword || !department || !semester || !mobileNumber) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return next(new ErrorHandler("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character", 400));
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return next(new ErrorHandler("Email already registered", 400));
    }

    // Check if enrollment number already exists
    const existingEnrollment = await User.findOne({ enrollmentNumber });
    if (existingEnrollment) {
        return next(new ErrorHandler("Enrollment number already exists", 400));
    }

    // Create user
    const user = await User.create({
        name,
        enrollmentNumber,
        email,
        password,
        department,
        semester,
        mobileNumber,
        role: "Student",
        accountStatus: "pending",
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`;
    const message = `
        <h1>Welcome to FYP Management System</h1>
        <p>Hello ${name},</p>
        <p>Thank you for registering! Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "Email Verification - FYP Management System",
            message,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for verification link.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accountStatus: user.accountStatus,
                }
            }
        });
    } catch (error) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        return next(new ErrorHandler("Email could not be sent. Please contact support.", 500));
    }
});

// Register Teacher
export const registerTeacher = asyncHandler(async (req, res, next) => {
    const {
        name,
        employeeId,
        email,
        password,
        confirmPassword,
        department,
        designation,
        mobileNumber,
        expertise
    } = req.body;

    // Validation
    if (!name || !employeeId || !email || !password || !confirmPassword || !department || !designation || !mobileNumber) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return next(new ErrorHandler("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character", 400));
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return next(new ErrorHandler("Email already registered", 400));
    }

    // Check if employee ID already exists
    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
        return next(new ErrorHandler("Employee ID already exists", 400));
    }

    // Create user
    const user = await User.create({
        name,
        employeeId,
        email,
        password,
        department,
        designation,
        mobileNumber,
        expertise: Array.isArray(expertise) ? expertise : [],
        role: "Teacher",
        accountStatus: "pending",
        maxStudents: 10,
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`;
    const message = `
        <h1>Welcome to FYP Management System</h1>
        <p>Hello ${name},</p>
        <p>Thank you for registering as a Teacher! Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>Your account is pending admin approval. You will be notified once approved.</p>
        <p>If you did not create an account, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "Email Verification - FYP Management System",
            message,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for verification link.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accountStatus: user.accountStatus,
                }
            }
        });
    } catch (error) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        return next(new ErrorHandler("Email could not be sent. Please contact support.", 500));
    }
});

// Verify Email
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    const emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        emailVerificationToken,
        emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired verification token", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now login after admin approval.",
    });
});

// Resend Verification Email
export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide email", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.isEmailVerified) {
        return next(new ErrorHandler("Email already verified", 400));
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`;
    const message = `
        <h1>Email Verification</h1>
        <p>Hello ${user.name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: "Email Verification - FYP Management System",
            message,
        });

        res.status(200).json({
            success: true,
            message: "Verification email sent successfully!",
        });
    } catch (error) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        return next(new ErrorHandler("Email could not be sent", 500));
    }
});

// Login
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Check email verification
    if (!user.isEmailVerified) {
        return next(new ErrorHandler("Please verify your email before logging in", 403));
    }

    // Check account status
    if (user.accountStatus === "pending") {
        return next(new ErrorHandler("Your account is pending admin approval", 403));
    }

    if (user.accountStatus === "rejected") {
        return next(new ErrorHandler(`Your account has been rejected. Reason: ${user.rejectionReason || "Not specified"}`, 403));
    }

    if (user.accountStatus === "suspended") {
        return next(new ErrorHandler("Your account has been suspended. Please contact admin.", 403));
    }

    const token = user.generateToken();

    res.status(200)
        .cookie("token", token, {
            expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
        .json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    accountStatus: user.accountStatus,
                },
                token,
            },
        });
});

// Get Current User
export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .populate("supervisor", "name email department")
        .populate("project");

    res.status(200).json({
        success: true,
        data: { user },
    });
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
    res.status(200)
        .cookie("token", "", {
            expires: new Date(0),
            httpOnly: true,
        })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email.", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            to: user.email,
            subject: "FYP SYSTEM - Password Reset Request",
            message,
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message || "Cannot send email.", 500));
    }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });


    if (!user) {
        return next(new ErrorHandler("Invalid or expired reset password token.", 400));
    }
    if (!req.body.password || !req.body.confirmPassword) {
        return next(new ErrorHandler("Please provide all required fields.", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not match.", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    generateToken(user, 200, "Password reset successfully.", res);
});