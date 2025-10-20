import {
  createEntityProfileDTO,
  IFetchEntitiesParam,
  updateEntityProfileDTO,
} from "@/types/req.types";
import instance from "./request";

export const getAllEntitiesRequest = async (params: IFetchEntitiesParam) => {
  return instance.get("/entity", { params });
};

export const getAllEntitiesAnalyticsRequest = async () => {
  return instance.get("/entity/analytics");
};

export const getEntityRequest = async (id: string) => {
  return instance.get(`/entity/${id}`);
};

export const createEntityRequest = async (body: createEntityProfileDTO) => {
  return instance.post("/users/create", body);
};

export const updateEntityRequest = async (body: updateEntityProfileDTO) => {
  const { id, ...rest } = body;
  return instance.put(`/entity/${id}`, rest);
};
