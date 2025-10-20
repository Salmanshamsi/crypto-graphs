import { EntityPlan, EntityStatus, EntityType, userGender, userStatus } from "@/constants";
import { IProfileMedia, ITimeStamp, IUser } from "./general.types";

export interface IProfile extends ITimeStamp {
  firstName: string;
  lastName: string;
  id: number;
  userId: number;
  username: string;
  gender: userGender;
  phoneNumber: string;
  bio: string;
  status: userStatus;
  dateOfBirth: string;
  country: string;
  city: string;
  user: IUser;
  followers: number;
  following: number;
  registrationDate: string;
  lastlogin: string;
}

export interface IEntity extends ITimeStamp {
  id: number;
  email?: string;
  userId: number;
  name: string;
  entityName: string;
  entityType: EntityType;
  phoneNumber: string;
  country: string;
  companySize?: string;
  website?: string;
  description?: string;
  industry?: string;
  plan: EntityPlan;
  numberOfEmployees?: number;
  annualRevenue?: number;
  status: EntityStatus;
  user: IUser;
  bannerMediaId?: number;
  bannerMedia?: IProfileMedia;
}

export interface IMe extends ITimeStamp {
  id: number;
  email: string;
  isEmailVerified: boolean;
  role: string;
  lastLogin: string;
  profileMediaId: number;
  profileMedia: IProfileMedia;
  profile: IProfile;
  password?: string;
}
