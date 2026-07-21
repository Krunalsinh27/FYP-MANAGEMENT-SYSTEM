import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");

export const axiosInstance = axios.create({
    baseURL: `${cleanApiUrl}/api/v1`,
    withCredentials: true,
});