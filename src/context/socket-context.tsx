import { createContext, useContext } from "react";

export const SocketContext = createContext<WebSocket | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  socket: WebSocket | null;
}

export const SocketProvider = ({ children, socket }: SocketProviderProps) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
