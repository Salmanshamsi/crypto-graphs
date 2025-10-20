import { RootState } from "@/store";
import { Bell, Search, User } from "lucide-react";
import { useSelector } from "react-redux";

interface TopNavProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<TopNavProps> = () => {
  const user = useSelector((state: RootState) => state?.auth?.user);

  console.log(user, "user from navbar");
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Left: Logo + (Optional) Mobile Menu */}
      <div className="flex items-center">
        {/* Example: Uncomment if you need a menu button */}
        {/* <button
          onClick={onMenuClick}
          className="p-1 mr-2 rounded-md hover:bg-gray-100 md:hidden"
        >
          <Menu size={20} />
        </button> */}
        {/* <img
          src="/vector-01_%281%29.png"
          alt="Spokyn Logo"
          className="h-8 mr-4"
        /> */}
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-[#5ad0c6] focus:border-[#5ad0c6]"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Profile */}
        {/* <div className="flex items-center space-x-2">
          {user?.profileMedia?.mediaUrl ? (
            <img
              src={user.profileMedia.mediaUrl}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="flex items-center justify-center w-9 h-9 text-white rounded-full bg-gradient-to-r from-[#2d3b4e] to-[#5ad0c6]">
              <User size={18} />
            </div>
          )}
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-800">
              {(user?.profile?.firstName || user?.profile?.lastName)
                ? `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim()
                : (user?.role?.replace(/_/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim() || "")}
            </div>
            <div className="text-xs text-gray-500">{user?.email || ""}</div>
          </div>
        </div> */}
      </div>
    </header>
  );
};
