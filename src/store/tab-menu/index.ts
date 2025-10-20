import { EntityDetailTabs, SettingsTabs } from "@/constants";
import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth";

interface TabMenuState {
  SettingsTab: SettingsTabs;
  EntityDetailTab: EntityDetailTabs;
}

const initialState: TabMenuState = {
  SettingsTab: SettingsTabs.profile,
  EntityDetailTab: EntityDetailTabs.overview,
};

export const TabMenuSlice = createSlice({
  name: "TabsMenu",
  initialState,
  reducers: {
    setSettingsTab: (state, action) => {
      state.SettingsTab = action.payload;
    },
    setEntityDetailTab: (state, action) => {
      state.EntityDetailTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const { setSettingsTab, setEntityDetailTab } = TabMenuSlice.actions;

export default TabMenuSlice.reducer;
