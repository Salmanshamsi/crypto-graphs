import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChartArea,
} from "lucide-react";
import { UserContext } from "@/context/logged-in-user";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import CustomButton from "../custom-button";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
}) => {
  const { logout } = useContext(UserContext);
  const logoutLoading = useSelector<RootState, boolean>(
    (state) => state.auth.logoutLoading
  );
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    {id:"chart1", label:"Chart1", icon:ChartArea, path:"/chart-1"},
    {id:"chart2", label:"Chart2", icon:ChartArea, path:"/chart-2"},
    {id:"chart3", label:"Chart3", icon:ChartArea, path:"/chart-3"},
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 
        ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* {!collapsed ? (
            <div className="text-xl font-bold text-[#2d3b4e]">
              <span>SPO</span>
              <span className="text-[#5ad0c6]">K</span>
              <span>Y</span>
              <span className="text-[#5ad0c6]">N</span>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <div className="h-8 w-8 rounded-full bg-[#5ad0c6] flex items-center justify-center text-white font-bold">
                S
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button> */}
          BLOCKCHAIN
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ id, label, icon: Icon, path }) => {
              const isActive = location.pathname === path;

              return (
                <li key={id}>
                  <Link
                    to={path}
                    className={`flex items-center px-4 py-3 w-full rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-[#edf7f7] text-[#5ad0c6]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        {/* <div className="mt-auto border-t border-gray-200">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center w-full px-4 py-3 text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut size={20} className="mr-3" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div> */}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-3">
              <CustomButton
                isDisabled={logoutLoading}
                onClick={() => setShowLogoutConfirm(false)}
                isDefaultStyleInclude={false}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={logout}
                isLoading={logoutLoading}
                variant="primary"
                isDefaultStyleInclude={false}
                className="px-4 py-2 rounded-md text-white bg-[#5ad0c6] hover:bg-[#48b0a7] border-transparent focus:ring-[#5ad0c6]"
              >
                Logout
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
