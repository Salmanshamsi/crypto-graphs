export interface IBinanceKlineParams {
  symbol: string;
  interval: string;
  limit: number;
  isBaseUrlIncluded?: boolean;
}
