import { userType } from "@/constants";

export interface ITimeStamp {
  createdAt: string;
  updatedAt: string;
}

export interface IProfileMedia extends ITimeStamp {
  id?: number;
  mediaUrl: string;
  metadata?: object;
}

export interface IPagination {
  totalDocs: number;
  totalPages: number;
  page: number;
}

export interface IQueryParams {
  page: number;
  limit: number;
  search?: string;
}

export interface IUser {
  id: number;
  email: string;
  isEmailVerified: boolean;
  role: userType;
  password?: string;
  profileMediaId?: number;
  profileMedia?: IProfileMedia;
}


export interface ParsedBinanceKline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteAssetVolume: number;
  numberOfTrades: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
}
