import {
  createUserRequest,
  getAllAnalyticsRequest,
  getAllProfilesRequest,
  updateUserRequest,
  updateUserStatusRequest,
} from "@/services/user";
import {
  createUserProfileDTO,
  FETCH_ANALYTICS,
  FETCH_PROFILES,
  IFetchUsersParam,
  updateUserProfileDTO,
  updateUserStatusRequestDTO,
} from "@/types/req.types";
import { IProfile } from "@/types/user.types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logout } from "../auth";

interface UserState {
  profiles: FETCH_PROFILES;
  analytics: FETCH_ANALYTICS | null;
}

const initialState: UserState = {
  profiles: {
    docs: null,
    meta: null,
  },
  analytics: null,
};

export const getAllProfiles = createAsyncThunk(
  "get/profiles",
  async (params: IFetchUsersParam) => {
    try {
      const response = await getAllProfilesRequest(params);
      return { ...response.data, success: true };
    } catch (error) {
      return error;
    }
  }
);

export const getUserAnalaytics = createAsyncThunk("get/analytics", async () => {
  try {
    const response = await getAllAnalyticsRequest();
    return { ...response.data, success: true };
  } catch (error) {
    return error;
  }
});

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async (body: updateUserStatusRequestDTO, { rejectWithValue }) => {
    try {
      const response = await updateUserStatusRequest(body);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "create/users",
  async (body: createUserProfileDTO, { rejectWithValue }) => {
    try {
      const response = await createUserRequest(body);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "update/users",
  async (body: updateUserProfileDTO, { rejectWithValue }) => {
    try {
      const response = await updateUserRequest(body);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    updateProfileState: (
      state,
      action: PayloadAction<Partial<updateUserProfileDTO> & { id: number }>
    ) => {
      if (!state.profiles?.docs) return;

      state.profiles.docs = state.profiles.docs.map((profile: IProfile) => {
        if (profile.id === action.payload.id) {
          return {
            ...profile,
            ...action.payload,
            user: {
              ...profile.user,
              ...(action.payload.user ?? {}),
            },
          };
        }
        return profile;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProfiles.fulfilled, (state, action) => {
      state.profiles = action.payload as FETCH_PROFILES;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      if (state.profiles.docs) {
        const { media, profile, ...user } = action.payload;
        state.profiles.docs = [
          {
            ...profile,
            user: {
              ...user,
              profileMedia: media,
            },
          },
          ...state.profiles.docs,
        ];
      }
    });
    builder.addCase(getUserAnalaytics.fulfilled, (state, action) => {
      state.analytics = action.payload as FETCH_ANALYTICS;
    });
    builder.addCase(logout, () => initialState);
  },
});

export const { updateProfileState } = userSlice.actions;

export default userSlice.reducer;
