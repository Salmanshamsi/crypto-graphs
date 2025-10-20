import instance from "./request";
import { IQueryParams } from "@/types/general.types";
import {
  createUserProfileDTO,
  updateUserProfileDTO,
  updateUserStatusRequestDTO,
} from "@/types/req.types";

export const getAllProfilesRequest = async (params: IQueryParams) => {
  return instance.get("/user-profiles", { params });
};

export const getAllAnalyticsRequest = async () => {
  return instance.get("/user-profiles/analytics");
};

export const createUserRequest = async (body: createUserProfileDTO) => {
  return instance.post("/users/create", body);
};

export const updateUserRequest = async (body: updateUserProfileDTO) => {
  const { id, ...rest } = body;
  return instance.put(`/user-profiles/${id}`, rest);
};

export const updateUserStatusRequest = async (
  body: updateUserStatusRequestDTO
) => {
  const { id, ...rest } = body;
  return instance.put(`/user-profiles/${id}`, rest);
};
