import { EntityClaim, EntityPlan, EntityStatus, userStatus } from "@/constants";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";

export const getStatusBadge = (status: userStatus) => {
  switch (status) {
    case userStatus.ACTIVE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Active
        </span>
      );
    case userStatus.INACTIVE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock size={12} className="mr-1" />
          Inactive
        </span>
      );
    case userStatus.WARNING:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle size={12} className="mr-1" />
          Warning
        </span>
      );
    case userStatus.SUSPENDED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" />
          Suspended
        </span>
      );
    // case "blocked":
    //   return (
    //     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
    //       <ShieldOff size={12} className="mr-1" />
    //       Blocked
    //     </span>
    //   );
    default:
      return null;
  }
};

export const getEntityStatusBadge = (status: string) => {
  switch (status) {
    case EntityStatus.VERIFIED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Verified
        </span>
      );
    case EntityStatus.PENDING:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" />
          Pending
        </span>
      );
    case EntityStatus.SUSPENDED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" />
          Suspended
        </span>
      );
    default:
      return null;
  }
};

export const getEntityPlanBadge = (status: string) => {
  switch (status) {
    case EntityPlan.FREE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle size={12} className="mr-1" />
          Free
        </span>
      );
    case EntityPlan.PRO:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Clock size={12} className="mr-1" />
          Pro
        </span>
      );
    default:
      return null;
  }
};

export const getEntityClaimBadge = (status: string) => {
  switch (status) {
    case EntityClaim.CLAIMED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle size={12} className="mr-1" />
          Claimed
        </span>
      );
    case EntityClaim.CREATED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock size={12} className="mr-1" />
          Created
        </span>
      );
    default:
      return null;
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

export function removeEmptyStrings<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== "")
  ) as Partial<T>;
}

export function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: T
): Partial<T> {
  const changes: Partial<T> = {};

  Object.keys(updated).forEach((key) => {
    const oVal = original[key];
    const uVal = updated[key];

    if (oVal !== uVal) {
      changes[key as keyof T] = uVal;
    }
  });

  return changes;
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const getToastIcon = (type: string) => {
  switch (type) {
    case "success":
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "info":
    default:
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

export const getToastClasses = (type: string, animationClasses: string) => {
  const baseClasses =
    "flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow-lg transform transition-all duration-300";

  let typeClasses = "";
  switch (type) {
    case "success":
      typeClasses =
        "text-green-800 bg-green-100 dark:bg-green-800 dark:text-green-200";
      break;
    case "error":
      typeClasses = "text-red-800 bg-red-100 dark:bg-red-800 dark:text-red-200";
      break;
    case "warning":
      typeClasses =
        "text-yellow-800 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-200";
      break;
    case "info":
    default:
      typeClasses =
        "text-blue-800 bg-blue-100 dark:bg-blue-800 dark:text-blue-200";
      break;
  }

  return `${baseClasses} ${typeClasses} ${animationClasses}`;
};

export const getCity = (countryString: string): string => {
  if (!countryString) return '';
  const city = countryString.split(/[-_]/)[0].trim();
  return city.charAt(0).toUpperCase() + city.slice(1);
};

export const renderColumnLabel = (icon: React.ReactNode, label: string) => (
  <div className="flex items-center gap-1">
    {icon}
    <span>{label}</span>
  </div>
);

