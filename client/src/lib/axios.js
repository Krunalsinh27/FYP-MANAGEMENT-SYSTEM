import axios from "axios";

const API = axios.create({
  baseURL: "https://fyp-backend-n8r0.onrender.com/api/v1",
  withCredentials: true,
});

export default API;