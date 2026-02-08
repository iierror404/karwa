import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RouteProvider } from "./context/RouteContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AdminProvider>
        {/* 👈 ضيفه هنا، حتى الأدمين يقدر يوصل لبيانات الـ Auth إذا احتاج */}
        <RouteProvider>
          <BookingProvider>
            <AppProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AppProvider>
          </BookingProvider>
        </RouteProvider>
      </AdminProvider>
    </AuthProvider>
  </StrictMode>,
);

