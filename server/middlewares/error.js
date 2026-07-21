class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        const formattedField = field === "enrollmentNumber" 
            ? "Enrollment number" 
            : field === "employeeId" 
            ? "Employee ID" 
            : field.charAt(0).toUpperCase() + field.slice(1);
        const message = `${formattedField} already exists.`;
        err = new ErrorHandler(message, 400);
    }

    if(err.name === "JsonWebTokenError"){
        const message = "Json Web Token is invalid. Try again.";
        err = new ErrorHandler(message, 400);
    }
    if(err.name === "TokenExpiredError"){
        const message = "Json Web Token is expired. Try again.";
        err = new ErrorHandler(message, 400);
    }
    if(err.name === "CastError"){
        const message = "Resource not found. Invalid: " + err.path;
        err = new ErrorHandler(message, 400);
    }

    const errorMessage = err.errors 
        ? Object.values(err.errors)
            .map((value) => value.message)
            .join(", ") 
        : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

export default ErrorHandler;