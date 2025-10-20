import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex items-center pt-5 pb-6 h-full bg-left bg-cover bg-gradient-to-r from-[#1e3a5f] to-[#40C1AC]"></div>
      <div className="col-span-1 w-full h-full bg-white shadow">
        <Outlet />
      </div>
    </div>
  );
};
