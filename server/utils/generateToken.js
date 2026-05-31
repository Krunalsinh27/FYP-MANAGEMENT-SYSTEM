export const generateToken = (user, statusCode, message, res) => {
    const token = user.generateToken();

    const isProd = process.env.NODE_ENV === 'production';

    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd, // secure cookies only in production (HTTPS)
        path: "/",
    }).json({
        success: true,
        user,
        message,
        token,
    });
};