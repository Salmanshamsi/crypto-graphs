import { baseURL } from "@/config";
import { toastService } from "@/context/toast-alert";
import Axios, { AxiosResponse } from "axios";
import { store, persistor } from "@/store";
import { logout } from "@/store/auth";

const baseUrl = baseURL.url;
const JSON_HEADER = "application/json";
const REQ_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const instance = Axios.create({
  baseURL: baseUrl,
  timeout: REQ_TIMEOUT,
});

instance.defaults.headers.common.Accept = JSON_HEADER;
// instance.defaults.headers.common["Content-Type"] = JSON_HEADER;
instance.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
instance.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isFormData = config.data instanceof FormData;
    if (!isFormData) {
      config.headers["Content-Type"] = JSON_HEADER;
    }

    // Check if baseURL should be excluded
    const isBaseUrlIncluded = config.params?.isBaseUrlIncluded ?? true;
    if (!isBaseUrlIncluded) {
      config.baseURL = '';
    }
    delete config.params?.isBaseUrlIncluded;

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const errorMsg =
      error?.response?.data?.message || error?.message || "An error occurred";
    const errorStatusCode = error?.response?.status;

    toastService.error(errorMsg, "Error");

    if (errorStatusCode === 401) {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Dispatch logout to reset all Redux slices
      store.dispatch(logout());
      
      // Purge redux-persist
      persistor.purge();
      
      // Redirect to login page
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
