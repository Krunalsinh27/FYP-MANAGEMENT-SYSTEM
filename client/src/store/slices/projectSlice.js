import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const downloadProjectFile = createAsyncThunk("downloadProjectFile", async ({ projectId, fileId }, thunkAPI) => {
  try {
    const res = await axiosInstance.get(`/project/${projectId}/files/${fileId}/download`, { responseType: "blob" });
    return { projectId, fileId, success: true };
  } catch (error) {
    const message = error.response?.data?.message || "Failed to download file";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }

})

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
  },
  reducers: {},
  extraReducers: (builder) => {},
});

export default projectSlice.reducer;
