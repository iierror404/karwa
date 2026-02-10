import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [mySubscribers, setMySubscribers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // { routeId, chatType, otherParticipantId }

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
        activeChat,
        setActiveChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
