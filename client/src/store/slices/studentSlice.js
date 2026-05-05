import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProjectProposal = createAsyncThunk("student/submitProjectProposal", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/student/project-proposal", data);
    toast.success("Project proposal submitted successfully");
    return res.data.data?.project || res.data.data || res.data;
  } catch (error) {
      toast.error(error.response.data.message || "Failed to submit project proposal");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default studentSlice.reducer;
