import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, persistor } from "@/store";
import { Loader } from "@/components/custom-loading-spinner";
import { useToast } from "../toast-alert";
import { getMe, logout, logoutUser } from "@/store/auth";
import { IMe } from "@/types/user.types";

interface UserContextType {
  user: IMe | null;
  isLoading: boolean;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  logout: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector<RootState, IMe | null>((state) => state.auth.user);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsLoading(true);
      await dispatch(getMe()).unwrap();
    } catch {
      toast.error(
        "Session Expired",
        "Your session has ended. Please log in again to continue."
      );
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser() as any).unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      // Clear localStorage completely
      localStorage.clear();
      sessionStorage.clear();
      
      // Dispatch logout action to reset all Redux slices
      dispatch(logout());
      
      // Purge redux-persist
      await persistor.purge();
      
      toast.success("You have been logged out", "Logout Successful");
      navigate("/auth/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (isLoading && !user) {
    return <Loader fullScreen />;
  }

  return (
    <UserContext.Provider value={{ user, isLoading, logout: handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};
