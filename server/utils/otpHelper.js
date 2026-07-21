import crypto from "crypto";

/**
 * Generate a secure 6-digit numeric OTP.
 * @returns {string} 6-digit OTP string
 */
export const generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash an OTP string using SHA-256.
 * @param {string} otp 
 * @returns {string} SHA-256 hex string
 */
export const hashOTP = (otp) => {
    if (!otp) return "";
    return crypto.createHash("sha256").update(otp.toString().trim()).digest("hex");
};

/**
 * Compare candidate OTP with stored OTP hash.
 * @param {string} candidateOTP 
 * @param {string} storedHash 
 * @returns {boolean}
 */
export const verifyOTPHash = (candidateOTP, storedHash) => {
    if (!candidateOTP || !storedHash) return false;
    const candidateHash = hashOTP(candidateOTP);
    return crypto.timingSafeEqual(Buffer.from(candidateHash), Buffer.from(storedHash));
};
