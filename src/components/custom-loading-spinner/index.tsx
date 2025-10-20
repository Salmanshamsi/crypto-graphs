import React from "react";

interface LoaderProps {
  size?: number; 
  color?: string;
  center?: boolean; 
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 48,
  color = "#5ad0c6",
  center = true,
  fullScreen = false,
}) => {
  const spinner = (
    <div
      className="animate-spin rounded-full border-t-2 border-b-2"
      style={{
        width: size,
        height: size,
        borderColor: color,
      }}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white/70 z-50">
        {spinner}
      </div>
    );
  }

  if (center) {
    return (
      <div className="flex justify-center items-center h-64">{spinner}</div>
    );
  }

  return spinner;
};
