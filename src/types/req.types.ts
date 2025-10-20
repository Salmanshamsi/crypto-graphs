import {
  EntityStatus,
  EntityType,
  userGender,
  userStatus,
  userType,
} from "@/constants";
import { IPagination, IProfileMedia, IQueryParams } from "./general.types";
import { IEntity, IProfile } from "./user.types";

export interface ILoginReq {
  email: string;
  password: string;
  appType: string;
}

export interface IForgetPasswordReq {
  email: string;
}

export interface IResetPasswordReq {
  token: string;
  password: string;
}

export interface IFetchUsersParam extends IQueryParams {
  status: userStatus;
}

export interface IFetchEntitiesParam extends IQueryParams {
  status: EntityStatus;
  type: EntityType;
}

export interface FETCH_PROFILES {
  docs: IProfile[] | null;
  meta: IPagination | null;
  success?: boolean;
}

export interface FETCH_ENTITIES {
  docs: IEntity[] | null;
  meta: IPagination | null;
  success?: boolean;
}

export interface FETCH_ANALYTICS {
  totalUsers: number;
  activeUsers: number;
  warningUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
}

export interface FETCH_ANALYTICS_ENTITIES {
  pendingEntities: number;
  verifiedEntities: number;
  newEntities: number;
  suspendedEntities: number;
}

export interface createEntityProfileDTO {
  name?: string;
  email: string;
  role: userType;
  password: string;
  entityName: string;
  entityType: EntityType;
  status?: EntityStatus;
  phoneNumber: string;
  country: string;
  companySize: string;
  website: string;
  description: string;
  annualRevenue: number;
  profileMediaId?: number;
  bannerMediaId?: number;
  numberOfEmployees: number;
  industry: string;
}

export interface createUserProfileDTO {
  email: string;
  password?: string;
  role: userType;
  username: string;
  name?: string;
  entityName?: string;
  entityType?: string;
  phoneNumber?: string;
  country: string;
  city: string;
  gender?: userGender;
  status?: userStatus;
  dateOfBirth: string;
  profileMediaId?: number;
}

export interface updateUserProfileDTO {
  id?: number;
  userId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: userGender;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  bio?: string;
  status?: userStatus;
  profileMediaId?: number;
  media?: IProfileMedia;
  role?: userType;
  user?: {
    email?: string;
    role?: userType;
  };
}

export interface updateEntityProfileDTO {
  id?: number;
  name?: string;
  entityName?: string;
  entityType?: EntityType;
  phoneNumber?: string;
  country?: string;
  companySize?: string;
  website?: string;
  description?: string;
  annualRevenue?: number;
  profileMediaId?: number;
  bannerMediaId?: number;
  media?: IProfileMedia;
  numberOfEmployees?: number;
  industry?: string;
  status?: EntityStatus;
  isEmailVerified?: boolean;
  email?: string;
}

export interface updateUserStatusRequestDTO {
  id: number;
  status: userStatus;
}

export interface mediaUploadRequest {
  file?: File | null;
}

export interface mediaUploadResponse {
  id: number;
  mediaUrl: string;
  updatedAt: string;
  createdAt: string;
  metadata: null;
}

export interface changePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface updateMeReqDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: userType;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  bio: string;
  name?: string;
  entityType?: EntityType;
  phoneNumber?: string;
  website?: string;
  description?: string;
  profileMediaId?: 0;
}
