import { Navigate, useRoutes } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { NotFound } from "@/pages/NotFound";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import ForgetPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import Login from "@/pages/Auth/Login/";
import ChartOne from "@/pages/admin/chart-one";
import ChartTwo from "@/pages/admin/chart-two";
import ChartThree from "@/pages/admin/chart-three";


const AppRoutes = () => {
  const routes = [
    {
      path: "/auth",
      element: <PublicRoute component={AuthLayout} />,
      children: [
        { path: "login", element: <Login /> },
        { path: "forget-password", element: <ForgetPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
      ],
    },
    {
      path: "/",
      element: <PrivateRoute component={MainLayout} />,
      children: [
        { index: true, element: <Navigate to="chart-1" replace /> },
        { path: "chart-1", element: <ChartOne /> },
        // { path: "chart-2", element: <ChartTwo /> },
        // { path: "chart-3", element: <ChartThree /> },
      ],
    },
    { path: "/404", element: <NotFound /> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ];

  return useRoutes(routes);
};

export default AppRoutes;
