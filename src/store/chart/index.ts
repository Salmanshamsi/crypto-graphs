import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChartLineVisibility {
  showProfitLine: boolean;
  showLossLine: boolean;
  showAvgLine: boolean;
}

interface ChartState {
  lineVisibility: ChartLineVisibility;
  showDots: boolean;
  enableScreenCapture: boolean;
  yAxisPosition: "left" | "right";
  baseSymbol: string;
  destinationSymbol: string;
}

const initialState: ChartState = {
  lineVisibility: {
    showProfitLine: true,
    showLossLine: true,
    showAvgLine: false,
  },
  showDots: true,
  enableScreenCapture: false,
  yAxisPosition: "left",
  baseSymbol: "BTC",
  destinationSymbol: "USD",
};

export const chartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    setLineVisibility: (state, action: PayloadAction<Partial<ChartLineVisibility>>) => {
      state.lineVisibility = { ...state.lineVisibility, ...action.payload };
    },
    setShowDots: (state, action: PayloadAction<boolean>) => {
      state.showDots = action.payload;
    },
    setEnableScreenCapture: (state, action: PayloadAction<boolean>) => {
      state.enableScreenCapture = action.payload;
    },
    setYAxisPosition: (state, action: PayloadAction<"left" | "right">) => {
      state.yAxisPosition = action.payload;
    },
    setBaseSymbol: (state, action: PayloadAction<string>) => {
      state.baseSymbol = action.payload;
    },
    setDestinationSymbol: (state, action: PayloadAction<string>) => {
      state.destinationSymbol = action.payload;
    },
    resetChartConfig: () => initialState,
  },
});

export const {
  setLineVisibility,
  setShowDots,
  setEnableScreenCapture,
  setYAxisPosition,
  setBaseSymbol,
  setDestinationSymbol,
  resetChartConfig,
} = chartSlice.actions;

export default chartSlice.reducer;

