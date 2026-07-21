import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate, generateOTPEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import { verifyOTPHash } from "../utils/otpHelper.js";
import crypto from "crypto";

const getFrontendUrl = () => {
    const url = process.env.FRONTEND_URL || "http://localhost:5173";
    return url.replace(/\/+$/, "");
};

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
    const user = new User({
        name,
        enrollmentNumber,
        email,
        password,
        department,
        semester,
        mobileNumber,
        role: "Student",
        isEmailVerified: false,
    });

    // Generate 6-digit OTP
    const otp = user.generateOTP();
    await user.save();

    // Verification URL pointing to frontend /verify-email page
    const verificationUrl = `${getFrontendUrl()}/verify-email?email=${encodeURIComponent(user.email)}`;
    const message = generateOTPEmailTemplate({
        name: user.name,
        otp,
        verificationUrl,
    });

    try {
        await sendEmail({
            to: user.email,
            subject: "Email Verification OTP - FYP Management System",
            message,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful! A 6-digit OTP has been sent to your email.",
            data: {
                email: user.email,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                }
            }
        });
    } catch (error) {
        user.otpHash = undefined;
        user.otpExpire = undefined;
        await user.save();

        return next(new ErrorHandler("Verification email could not be sent. Please check your email address.", 500));
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
    const user = new User({
        name,
        employeeId,
        email,
        password,
        department,
        designation,
        mobileNumber,
        expertise: Array.isArray(expertise) ? expertise : [],
        role: "Teacher",
        isEmailVerified: false,
        maxStudents: 10,
    });

    // Generate 6-digit OTP
    const otp = user.generateOTP();
    await user.save();

    // Verification URL pointing to frontend /verify-email page
    const verificationUrl = `${getFrontendUrl()}/verify-email?email=${encodeURIComponent(user.email)}`;
    const message = generateOTPEmailTemplate({
        name: user.name,
        otp,
        verificationUrl,
    });

    try {
        await sendEmail({
            to: user.email,
            subject: "Email Verification OTP - FYP Management System",
            message,
        });

        res.status(201).json({
            success: true,
            message: "Registration successful! A 6-digit OTP has been sent to your email.",
            data: {
                email: user.email,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                }
            }
        });
    } catch (error) {
        user.otpHash = undefined;
        user.otpExpire = undefined;
        await user.save();

        return next(new ErrorHandler("Verification email could not be sent. Please check your email address.", 500));
    }
});

// Verify OTP
export const verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler("Please provide email and 6-digit OTP", 400));
    }

    const cleanOtp = otp.toString().trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return next(new ErrorHandler("OTP must be a 6-digit number", 400));
    }

    const user = await User.findOne({ email }).select("+otpHash");

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role === "Admin") {
        return next(new ErrorHandler("Admin accounts do not require email verification", 400));
    }

    if (user.isEmailVerified) {
        return next(new ErrorHandler("Email is already verified. You can log in.", 400));
    }

    if (!user.otpHash || !user.otpExpire) {
        return next(new ErrorHandler("No active OTP found. Please request a new OTP.", 400));
    }

    // Expiry check
    if (Date.now() > user.otpExpire) {
        return next(new ErrorHandler("OTP has expired. Please request a new OTP.", 400));
    }

    // Max 5 attempts check
    if (user.otpAttempts >= 5) {
        return next(new ErrorHandler("Maximum verification attempts exceeded (5/5). Please request a new OTP.", 400));
    }

    // Verify OTP Hash
    const isMatch = verifyOTPHash(cleanOtp, user.otpHash);

    if (!isMatch) {
        user.otpAttempts += 1;
        await user.save();

        const attemptsLeft = 5 - user.otpAttempts;
        if (attemptsLeft <= 0) {
            return next(new ErrorHandler("Maximum verification attempts reached. Please request a new OTP.", 400));
        }
        return next(new ErrorHandler(`Invalid OTP. ${attemptsLeft} attempt(s) remaining.`, 400));
    }

    // Successful OTP verification
    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    user.otpResendCount = 0;
    user.otpResendLastAt = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully! You can now log in immediately.",
    });
});

// Legacy Endpoint Alias for Link Verification
export const verifyEmail = asyncHandler(async (req, res, next) => {
    // If token passed in params, redirect frontend to /verify-email
    return res.status(200).json({
        success: true,
        message: "Please enter your 6-digit OTP on the verification page.",
    });
});

// Resend OTP
export const resendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide email address", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    if (user.role === "Admin") {
        return next(new ErrorHandler("Admin accounts do not require email verification", 400));
    }

    if (user.isEmailVerified) {
        return next(new ErrorHandler("Email is already verified. You can log in.", 400));
    }

    // 60-Second Cooldown Rate Limiting
    if (user.otpResendLastAt && (Date.now() - new Date(user.otpResendLastAt).getTime() < 60 * 1000)) {
        const secondsLeft = Math.ceil((60000 - (Date.now() - new Date(user.otpResendLastAt).getTime())) / 1000);
        return next(new ErrorHandler(`Please wait ${secondsLeft} second(s) before requesting another OTP.`, 429));
    }

    // Reset resend count if OTP expired
    if (user.otpExpire && Date.now() > user.otpExpire) {
        user.otpResendCount = 0;
    }

    // Max 3 resend attempts per session
    if (user.otpResendCount >= 3) {
        return next(new ErrorHandler("Maximum OTP resend limit reached (3/3). Please wait until current OTP expires (10 mins) or try again later.", 429));
    }

    // Generate new OTP
    const otp = user.generateOTP();
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    user.otpResendLastAt = new Date();
    await user.save();

    const verificationUrl = `${getFrontendUrl()}/verify-email?email=${encodeURIComponent(user.email)}`;
    const message = generateOTPEmailTemplate({
        name: user.name,
        otp,
        verificationUrl,
    });

    try {
        await sendEmail({
            to: user.email,
            subject: "New Email Verification OTP - FYP Management System",
            message,
        });

        res.status(200).json({
            success: true,
            message: "A new 6-digit OTP has been sent to your email address.",
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to send OTP email. Please try again later.", 500));
    }
});

// Send OTP (alias for resendOTP)
export const sendOTP = resendOTP;
export const resendVerificationEmail = resendOTP;

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

    // Check email verification: Admin skips email verification; Student and Teacher require email verification
    if (user.role !== "Admin" && !user.isEmailVerified) {
        return next(new ErrorHandler("Please verify your email before logging in", 403));
    }

    // Generate token & set cookie (NO admin approval checks)
    generateToken(user, 200, "Logged in successfully", res);
});

// Get Current User
export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .populate("supervisor", "name email department")
        .populate("project");

    res.status(200).json({
        success: true,
        data: { user },
        user,
    });
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
    const isProd = process.env.NODE_ENV === "production";
    res.status(200)
        .cookie("token", "", {
            expires: new Date(0),
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            path: "/",
        })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new ErrorHandler("Please enter your email address.", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email.", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;
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
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message || "Cannot send email.", 500));
    }
});

// Reset Password
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