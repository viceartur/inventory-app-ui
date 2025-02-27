"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "context/socket-context";
import { NavLinks } from "../components/nav-links";
import { WS } from "utils/constants";
import { Footer } from "components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS);
    ws.onopen = () => {
      console.log("WS connection openned");
      ws.send("materialsUpdated");
    };
    ws.onclose = () => {
      console.log("WS connection closed");
    };
    setSocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SocketProvider socket={socket}>
            <div className="layout-container">
              <NavLinks />
              <main className="main-content">{children}</main>
              <Footer />
            </div>
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
