"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { SocketProvider } from "context/socket-context";
import { NavLinks } from "../components/nav-links";
import { WS } from "utils/constants";
import { Footer } from "components/footer";

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!session?.user.role) return;

    const wsUrl = `${WS}/${session.user.role}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      ws.send("materialsUpdated");
      ws.send("vaultUpdated");
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
      setSocket(null);
    };
  }, [session?.user.role]);

  return (
    <SocketProvider socket={socket}>
      <div className="layout-container">
        <NavLinks />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </SocketProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <InnerLayout>{children}</InnerLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
