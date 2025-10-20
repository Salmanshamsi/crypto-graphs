import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorSnackbar?: boolean;
    showSuccessToast?: boolean | string;
  }
}
