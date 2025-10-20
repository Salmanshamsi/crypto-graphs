import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router";
import { ToastProvider } from "./context/toast-alert";
import { UserProvider } from "./context/logged-in-user";

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
