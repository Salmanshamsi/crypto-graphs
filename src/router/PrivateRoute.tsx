import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  component: React.ComponentType<{ children?: React.ReactNode }>;
}

export const PrivateRoute = ({ component: Component }: PrivateRouteProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Component>
      <Outlet />
    </Component>
  );
};
