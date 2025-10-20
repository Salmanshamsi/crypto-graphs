import {
  changePasswordRequest,
  forgetPasswordRequest,
  getMeRequest,
  loginRequest,
  logoutRequest,
  resetPasswordRequest,
  updateMe,
  uplaodMedia,
} from "@/services/auth";
import {
  changePasswordDto,
  IForgetPasswordReq,
  ILoginReq,
  IResetPasswordReq,
  mediaUploadRequest,
} from "@/types/req.types";
import { IMe } from "@/types/user.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

interface AuthState {
  user: IMe | null;
  forgetEmail: string | null;
  logoutLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  forgetEmail: null,
  logoutLoading: false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (creds: ILoginReq, { rejectWithValue }) => {
    try {
      const response = await loginRequest(creds);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutRequest();
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const forgetPassword = createAsyncThunk(
  "auth/forget-password",
  async (creds: IForgetPasswordReq, { rejectWithValue }) => {
    try {
      const response = await forgetPasswordRequest(creds);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/reset-password",
  async (creds: IResetPasswordReq, { rejectWithValue }) => {
    try {
      const response = await resetPasswordRequest(creds);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const getMe = createAsyncThunk("auth/getMe", async () => {
  const response = await getMeRequest();
  return response.data;
});

export const mediaUploadReq = createAsyncThunk(
  "media/upload",
  async ({ file }: mediaUploadRequest, { rejectWithValue }) => {
    try {
      if (!file) {
        throw new Error("No file provided");
      }
      const formData = new FormData();
      formData.append("file", file);
      const response = await uplaodMedia(formData);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || "Something went wrong.");
    }
  }
);

export const meUpdationRequest = createAsyncThunk(
  "users/update",
  async (payload: any) => {
    try {
      const response = await updateMe(payload);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return error;
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/change-password",
  async (credentials: changePasswordDto, { rejectWithValue }) => {
    try {
      const response = await changePasswordRequest(credentials);
      return { ...response.data, success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(error.response?.data?.message || "Unknown error");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateProfileState: (state, action: { payload: IMe }) => {
      state.user = action.payload;
    },
    logout: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    builder.addCase(logoutUser.pending, (state) => {
      state.logoutLoading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.logoutLoading = false;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.logoutLoading = false;
    });
  },
});

export const { logout, updateProfileState } = authSlice.actions;

export default authSlice.reducer;
