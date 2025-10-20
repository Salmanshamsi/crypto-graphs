export enum userStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  WARNING = "WARNING",
}

export enum userGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum userType {
  USER = "USER",
  ENTITY = "ENTITY",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum EntityType {
  COMPANY = "COMPANY",
  NON_PROFIT_ORGANIZATION = "NON_PROFIT_ORGANIZATION",
  CITY = "CITY",
  ARTIST = "ARTIST",
  TEAM = "TEAM",
  EDUCATIONAL_INSTITUTION = "EDUCATIONAL_INSTITUTION",
  GOVERNMENT_AGENCY = "GOVERNMENT_AGENCY",
  OTHER = "OTHER",
}

export enum EntityStatus {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export enum EntityPlan {
  FREE = "FREE",
  PRO = "PRO",
}

export enum EntityClaim {
  CREATED = "CREATED",
  CLAIMED = "CLAIMED",
}

export enum EntityDetailTabs {
  overview = "overview",
  proposal = "proposals",
  admin = "admins",
  request = "requests",
  billing = "billing",
  api = "api",
  settings = "settings",
}

export enum SettingsTabs {
  profile = "profile",
  admin = "admin",
  security = "security",
}

export const entityTypeObj = {
  [EntityType.COMPANY]: "Company",
  [EntityType.NON_PROFIT_ORGANIZATION]: "Non Profit Organization",
  [EntityType.CITY]: "City",
  [EntityType.ARTIST]: "Artist",
  [EntityType.TEAM]: "Team",
  [EntityType.EDUCATIONAL_INSTITUTION]: "Educational Institution",
  [EntityType.GOVERNMENT_AGENCY]: "Government Agency",
  [EntityType.OTHER]: "Other",
};

export const adminTypes: { [key: string]: string } = {
  [userType.ADMIN]: "Admin",
  [userType.SUPER_ADMIN]: "Super Admin",
};