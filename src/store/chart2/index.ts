import { getCryptoDataRequest } from "@/services/chart";
import { mapBinanceKline } from "@/utils/generateChartData";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ChartDataState {
  cryptoData: any | null;
}

const initialState: ChartDataState = {
  cryptoData: null,
};

export const getCryptoData = createAsyncThunk(
  "get/crypto-data",
  async (params: any) => {
    try {
      const response = await getCryptoDataRequest(params);
      return { ...response.data, success: true };
    } catch (error) {
      return error;
    }
  }
);

export const chartDataSlice = createSlice({
  name: "chartData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCryptoData.fulfilled, (state, action) => {
      const dataArray = Array.isArray(action.payload) 
        ? action.payload 
        : Object.values(action.payload);
      state.cryptoData = dataArray.map((item:any)=>{
        return mapBinanceKline(item)
      });
    });
  },
});

export const {} = chartDataSlice.actions;

export default chartDataSlice.reducer;
