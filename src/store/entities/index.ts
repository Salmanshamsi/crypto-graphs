import {
  createEntityRequest,
  getAllEntitiesAnalyticsRequest,
  getAllEntitiesRequest,
  getEntityRequest,
  updateEntityRequest,
} from "@/services/entities";
import {
  createEntityProfileDTO,
  FETCH_ANALYTICS_ENTITIES,
  FETCH_ENTITIES,
  IFetchEntitiesParam,
  updateEntityProfileDTO,
} from "@/types/req.types";
import { IEntity } from "@/types/user.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth";

interface EntityState {
  entities: FETCH_ENTITIES;
  entitiesAnalytics: FETCH_ANALYTICS_ENTITIES | null;
  entity: IEntity | null;
}

const initialState: EntityState = {
  entities: {
    docs: null,
    meta: null,
  },
  entitiesAnalytics: null,
  entity: null,
};

export const getAllEntities = createAsyncThunk(
  "get/entities",
  async (params: IFetchEntitiesParam) => {
    try {
      const response = await getAllEntitiesRequest(params);
      return { ...response.data, success: true };
    } catch (error) {
      return error;
    }
  }
);

export const getAllEntitiesAnalytics = createAsyncThunk(
  "get/Analytics",
  async () => {
    try {
      const response = await getAllEntitiesAnalyticsRequest();
      return { ...response.data, success: true };
    } catch (error) {
      return error;
    }
  }
);

export const createEntity = createAsyncThunk(
  "create/entity",
  async (body: createEntityProfileDTO, { rejectWithValue }) => {
    try {
      const response = await createEntityRequest(body);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const updateEntity = createAsyncThunk(
  "update/entity",
  async (body: updateEntityProfileDTO, { rejectWithValue }) => {
    try {
      const response = await updateEntityRequest(body);
      return { ...response.data, success: true };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const getEntity = createAsyncThunk("get/entity", async (id: string) => {
  try {
    const response = await getEntityRequest(id);
    return { ...response.data, success: true };
  } catch (error) {
    return error;
  }
});

export const EntitySlice = createSlice({
  name: "Entity",
  initialState,
  reducers: {
    updateEntityState: (state, action: { payload: IEntity | null }) => {
      state.entity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllEntities.fulfilled, (state, action) => {
      state.entities = action.payload as FETCH_ENTITIES;
    });
    builder.addCase(getEntity.fulfilled, (state, action) => {
      state.entity = action.payload as IEntity;
    });
    builder.addCase(getAllEntitiesAnalytics.fulfilled, (state, action) => {
      state.entitiesAnalytics = action.payload as FETCH_ANALYTICS_ENTITIES;
    });
    builder.addCase(createEntity.fulfilled, (state, action) => {
      if (state.entities.docs) {
        const { media, profile, ...user } = action.payload;
        state.entities.docs = [
          {
            ...profile,
            user: {
              ...user,
              profileMedia: media,
            },
          },
          ...state.entities.docs,
        ];
      }
    });
    builder.addCase(logout, () => initialState);
  },
});

export const { updateEntityState } = EntitySlice.actions;

export default EntitySlice.reducer;
