import React, { forwardRef, ReactElement } from "react";

interface TextFieldProps {
  id: string;
  name: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "search"
    | "number"
    | "date";
  label?: string;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  multiline?: boolean;
  rows?: number;
  icon?: ReactElement; 
  iconPosition?: "left" | "right"; 
  onIconClick?: () => void;
}

const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>(
  (
    {
      id,
      name,
      type = "text",
      label,
      value,
      onChange,
      placeholder,
      required = false,
      autoComplete,
      isLoading = false,
      isDisabled = false,
      error,
      helperText,
      className = "",
      inputClassName = "",
      labelClassName = "",
      multiline = false,
      rows = 4,
      icon,
      iconPosition = "right",
      onIconClick,
    },
    ref
  ) => {
    const baseInputClasses =
      "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors duration-200";

    const getInputClasses = () => {
      let classes = baseInputClasses;

      if (error) {
        classes += " border-red-300 focus:ring-red-500 focus:border-red-500";
      } else {
        classes +=
          " border-gray-300 focus:ring-[#40C1AC] focus:border-[#40C1AC]";
      }

      if (isDisabled || isLoading) {
        classes += " bg-gray-100 cursor-not-allowed opacity-60";
      } else {
        classes += " bg-white";
      }

      // Adjust date & number input styling
      if (!multiline && (type === "date" || type === "number")) {
        classes += " pr-10"; // space for icons/spinners
      }

      // Adjust for icon padding
      if (icon && !multiline) {
        classes += iconPosition === "left" ? " pl-10" : " pr-10";
      }

      return `${classes} ${inputClassName}`;
    };

    const getLabelClasses = () => {
      let classes = "block text-sm font-medium";

      if (error) {
        classes += " text-red-700";
      } else {
        classes += " text-gray-700";
      }

      return `${classes} ${labelClassName}`;
    };

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label htmlFor={id} className={getLabelClasses()}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={id}
              name={name}
              value={value as string}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              autoComplete={autoComplete}
              disabled={isDisabled || isLoading}
              rows={rows}
              className={getInputClasses()}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${id}-error` : helperText ? `${id}-helper` : undefined
              }
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={id}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={type === "date" ? undefined : placeholder}
              required={required}
              autoComplete={autoComplete}
              disabled={isDisabled || isLoading}
              className={getInputClasses()}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${id}-error` : helperText ? `${id}-helper` : undefined
              }
            />
          )}

          {/* Optional icon */}
          {icon && !multiline && (
            <div
              className={`absolute inset-y-0 flex items-center ${
                iconPosition === "right" ? "right-0 pr-3" : "left-0 pl-3"
              } ${onIconClick ? "cursor-pointer" : "pointer-events-none"}`}
              onClick={onIconClick}
            >
              {icon}
            </div>
          )}

          {/* Loading spinner */}
          {isLoading && !multiline && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin h-4 w-4 border-2 border-[#40C1AC] border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
