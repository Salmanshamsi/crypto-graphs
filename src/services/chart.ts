import { IBinanceKlineParams } from "@/types/chart.types";
import axios from "axios";

export const getCryptoDataRequest = async (params: IBinanceKlineParams) => {
  return axios.get("https://api.binance.com/api/v3/klines", {
    params,
  });
};

