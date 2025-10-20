import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

interface PublicRouteProps {
  component: React.ComponentType<{ children?: React.ReactNode }>;
}

export const PublicRoute = ({ component: Component }: PublicRouteProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Navigate to="/users" replace />;
  }

  return (
    <Component>
      <Outlet />
    </Component>
  );
};
