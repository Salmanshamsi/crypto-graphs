import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#5ad0c6] hover:bg-[#48b0a7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ad0c6] transition-colors"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ad0c6] transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
