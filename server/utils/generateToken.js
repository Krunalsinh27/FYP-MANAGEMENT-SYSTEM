export const generateToken = (user, statusCode, message, res) => {
    const token = user.generateToken();

    const isProd = process.env.NODE_ENV === 'production';
    const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 7;

    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd, // secure cookies only in production (HTTPS)
        path: "/",
    }).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
            token,
        }
    });
};