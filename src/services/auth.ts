import {
  changePasswordDto,
  IForgetPasswordReq,
  ILoginReq,
  IResetPasswordReq,
} from "@/types/req.types";
import instance from "./request";

export const loginRequest = async (credentials: ILoginReq) => {
  return instance.post("/auth/login", credentials);
};

export const logoutRequest = async () => {
  return instance.post("/auth/logout");
};

export const getMeRequest = async () => {
  return instance.get("/auth/me");
};

export const forgetPasswordRequest = async (creds: IForgetPasswordReq) => {
  return instance.post("/auth/forgot-password", creds);
};

export const resetPasswordRequest = async (creds: IResetPasswordReq) => {
  return instance.post("/auth/reset-password", creds);
};

export const uplaodMedia = async (formData: FormData) => {
  return instance.post("/media/upload", formData);
};

export const updateMe = async (data: any) => {
  const { id, ...rest } = data;
  return instance.put(`/user-profiles/${id}`, rest);
};

export const changePasswordRequest = async (credentials: changePasswordDto) => {
  return instance.post("/auth/change-password", credentials);
};
