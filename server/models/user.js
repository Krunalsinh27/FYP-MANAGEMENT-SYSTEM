// import bcrypt from "bcrypt";
// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";

// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, "Name is required"],
//             trim: true,
//             maxlength: [50, "Name cannot exceed 50 characters"],
//         },
//         email: {
//             type: String,
//             required: [true, "Email is required"],
//             unique: true,
//             lowercase: true,
//             match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
//         },
//         password: {
//             type: String,
//             required: [true, "Password is required"],
//             select: false,
//             minlength: [8, "Password must be at least 8 characters long"],
//         },
//         role: {
//             type: String,
//             default: "Student",
//             enum: ["Student", "Supervisor", "Admin", "Teacher"],
//         },
//         resetPasswordToken: String,
//         resetPasswordExpire: Date,

//         department: {
//             type: String,
//             trim: true,
//             default: null,
//         },
//         expertise: {
//             type: [String],
//             default: [],
//         },
//         maxStudents: {
//             type: Number,
//             default: function() {
//                 return this.role === "Teacher" || this.role === "Supervisor" ? 10 : undefined;
//             },
//             min: [1, "Min students must be at least 1"],
//         },
//         assignedStudents: [{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         }],
//         supervisor: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null,
//         },
//         project: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Project",
//             default: null,
//         },
//     }, 
//     { 
//         timestamps: true,     
//     }
// );

// userSchema.pre("save", async function() {
//     if (!this.isModified("password")) {
//         return;
//     }
//     this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.generateToken = function() {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE,
//     });
// };

// userSchema.methods.comparePassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// userSchema.methods.hasCapacity = function() {
//     if (this.role !== "Teacher") return false;
//     return this.assignedStudents.length < this.maxStudents;
// };

// userSchema.methods.getResetPasswordToken = function() {
//     const resetToken = crypto.randomBytes(20).toString("hex");

//     this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//     return resetToken;
// };

// export const User = mongoose.model("User", userSchema);

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateRandomOTP, hashOTP } from "../utils/otpHelper.js";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
            minlength: [8, "Password must be at least 8 characters long"],
        },
        role: {
            type: String,
            default: "Student",
            enum: ["Student", "Supervisor", "Admin", "Teacher"],
        },
        
        // Email Verification & OTP Management
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        otpHash: {
            type: String,
            select: false,
        },
        otpExpire: Date,
        otpAttempts: {
            type: Number,
            default: 0,
        },
        otpResendCount: {
            type: Number,
            default: 0,
        },
        otpResendLastAt: Date,
        
        // Password Reset
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Student/Teacher Specific Fields
        enrollmentNumber: {
            type: String,
            sparse: true,
            unique: true,
        },
        employeeId: {
            type: String,
            sparse: true,
            unique: true,
        },
        mobileNumber: {
            type: String,
            trim: true,
        },
        semester: {
            type: Number,
            min: 1,
            max: 8,
        },
        designation: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
            default: null,
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        profilePicture: {
            type: String,
            default: null,
        },
        expertise: {
            type: [String],
            default: [],
        },
        maxStudents: {
            type: Number,
            default: function() {
                return this.role === "Teacher" || this.role === "Supervisor" ? 10 : undefined;
            },
            min: [1, "Min students must be at least 1"],
        },
        assignedStudents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },
    }, 
    { 
        timestamps: true,     
    }
);

userSchema.pre("save", async function() {
    if (this.role === "Admin") {
        this.isEmailVerified = true;
    }
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.hasCapacity = function() {
    if (this.role !== "Teacher") return false;
    return this.assignedStudents.length < this.maxStudents;
};

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

userSchema.methods.generateOTP = function() {
    const otp = generateRandomOTP();
    this.otpHash = hashOTP(otp);
    this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otpAttempts = 0;
    return otp;
};

export const User = mongoose.model("User", userSchema);