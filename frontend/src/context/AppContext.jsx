import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [mySubscribers, setMySubscribers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // تحديث قائمة المشتركين للسائق
  const updateSubscribers = (data) => {
    setMySubscribers(data);
  };

  return (
    <AppContext.Provider
      value={{
        mySubscribers,
        setMySubscribers,
        updateSubscribers,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
