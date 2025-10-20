import { getToastClasses, getToastIcon } from "@/utils";
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: number;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: number) => void;
}

interface ToastData {
  id: number;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    setTimeout(() => setIsVisible(true), 10);

    if (duration > 0) {
      const timer = setTimeout(() => {
        // Start exit animation
        setIsExiting(true);

        // Wait for animation to complete before removing
        setTimeout(() => {
          onClose(id);
        }, 300); // Animation duration
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [id, duration, onClose]);

  // Add animation classes
  const animationClasses = isVisible
    ? isExiting
      ? "translate-y-0 opacity-0" // Exit animation
      : "translate-y-0 opacity-100" // Fully visible
    : "-translate-y-full opacity-0"; // Initial state (hidden above)

  return (
    <div
      id={`toast-${id}`}
      className={getToastClasses(type, animationClasses)}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {getToastIcon(type)}
      </div>
      <div className="ml-3 text-sm font-normal">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div>{message}</div>
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

interface ToastContextProps {
  showToast: (
    title: string | undefined,
    message: string,
    type: ToastType,
    duration?: number
  ) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback(
    (
      title: string | undefined,
      message: string,
      type: ToastType,
      duration = 5000
    ) => {
      const id = Date.now();
      setToast({ id, title, message, type, duration });
      return id;
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToast((prev) => (prev?.id === id ? null : prev));
  }, []);

  useEffect(() => {
    const unsubscribe = toastEmitter.subscribe((event) => {
      showToast(event.title, event.message, event.type, event.duration);
    });
    return unsubscribe;
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center">
        {toast && (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { showToast } = context;

  return {
    toast: (
      title: string | undefined,
      message: string,
      type: ToastType,
      duration?: number
    ) => showToast(title, message, type, duration),
    success: (message: string, title?: string, duration?: number) =>
      showToast(title, message, "success", duration),
    error: (message: string, title?: string, duration?: number) =>
      showToast(title, message, "error", duration),
    warning: (message: string, title?: string, duration?: number) =>
      showToast(title, message, "warning", duration),
    info: (message: string, title?: string, duration?: number) =>
      showToast(title, message, "info", duration),
  };
};

type ToastEvent = {
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
};

class ToastEventEmitter {
  private listeners: Array<(event: ToastEvent) => void> = [];

  subscribe(listener: (event: ToastEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: ToastEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}
const toastEmitter = new ToastEventEmitter();

export const toastService = {
  success(message: string, title?: string, duration?: number) {
    toastEmitter.emit({ title, message, type: "success", duration });
  },

  error(message: string, title?: string, duration?: number) {
    toastEmitter.emit({ title, message, type: "error", duration });
  },

  warning(message: string, title?: string, duration?: number) {
    toastEmitter.emit({ title, message, type: "warning", duration });
  },

  info(message: string, title?: string, duration?: number) {
    toastEmitter.emit({ title, message, type: "info", duration });
  },

  toast(
    title: string | undefined,
    message: string,
    type: ToastType,
    duration?: number
  ) {
    toastEmitter.emit({ title, message, type, duration });
  },
};
