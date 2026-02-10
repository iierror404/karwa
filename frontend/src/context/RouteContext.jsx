import { createContext, useContext, useState } from "react";
import api from "../api/axios"; // افترضت عندك ملف axios جاهز

export const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/routes/my-routes");
      setRoutes(res.data);
      console.log(res.data)
    } catch (err) {
      console.error("Error fetching routes 🛑", err);
    }
  };

  return (
    <RouteContext.Provider value={{ routes, setRoutes, fetchRoutes, activeRoute, setActiveRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoutes = () => useContext(RouteContext);