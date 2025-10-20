import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  form?: string;
  isDefaultStyleInclude?: boolean;
  loadingColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  onClick,
  className = "",
  fullWidth = false,
  leftIcon,
  rightIcon,
  loadingText,
  form,
  isDefaultStyleInclude = true,
}) => {
  const getBaseClasses = () => {
    return `
      inline-flex items-center justify-center font-medium transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed
      ${fullWidth ? "w-full" : ""}
    `.trim();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm rounded-md";
      case "lg":
        return "px-6 py-3 text-lg rounded-lg";
      default:
        return "px-4 py-2.5 text-base rounded-full";
    }
  };

  const getVariantClasses = () => {
    let variantClasses = "";

    switch (variant) {
      case "primary":
        variantClasses = `
          text-white bg-gradient-to-r from-[#1e3a5f] to-[#40C1AC] 
          hover:shadow-md focus:ring-[#40C1AC] border border-transparent
        `.trim();
        break;
      case "secondary":
        variantClasses = `
          text-gray-700 bg-gray-100 hover:bg-gray-200 
          focus:ring-gray-500 border border-gray-300
        `.trim();
        break;
      case "danger":
        variantClasses = `
          text-white bg-red-600 hover:bg-red-700 
          focus:ring-red-500 border border-transparent
        `.trim();
        break;
      case "outline":
        variantClasses = `
          text-[#40C1AC] bg-transparent hover:bg-[#40C1AC] hover:text-white 
          focus:ring-[#40C1AC] border border-[#40C1AC]
        `.trim();
        break;
      case "ghost":
        variantClasses = `
          text-gray-700 bg-transparent hover:bg-gray-100 
          focus:ring-gray-500 border border-transparent
        `.trim();
        break;
      default:
        variantClasses = `
          text-white bg-gradient-to-r from-[#1e3a5f] to-[#40C1AC] 
          hover:shadow-md focus:ring-[#40C1AC] border border-transparent
        `.trim();
    }

    if (isDisabled || isLoading) {
      variantClasses += " opacity-60 cursor-not-allowed pointer-events-none";
      variantClasses += " hover:shadow-none hover:bg-inherit";
    }

    return variantClasses;
  };

  const renderLoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#5ad0c6]"></div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center">
          {renderLoadingSpinner()}
          {loadingText && <span className="ml-2">{loadingText}</span>}
        </div>
      );
    }

    return (
      <div className="flex items-center">
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
    );
  };

  const buttonClasses = isDefaultStyleInclude
    ? `
        ${getBaseClasses()}
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()
    : className;

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={buttonClasses}
    >
      {renderContent()}
    </button>
  );
};

export default CustomButton;
