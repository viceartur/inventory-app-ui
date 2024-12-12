"use client";
import { useEffect, useState } from "react";

export default function MainPage() {
  const [serverStatus, setServerStatus] = useState("Loading...");
  const [dbStatus, setDBstatus] = useState("Loading...");

  return (
    <section>
      <h2>Welcome to the Inventory Management App v2.0</h2>
      <p>
        If you have any questions please reach me out on
        <a href="https://outlook.office.com/mail/">asopov@tagsystems.net</a>
      </p>
    </section>
  );
}
