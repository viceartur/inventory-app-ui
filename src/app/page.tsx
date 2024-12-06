"use client";
import { useEffect, useState } from "react";

export default function MainPage() {
  const [serverStatus, setServerStatus] = useState("Loading...");
  const [dbStatus, setDBstatus] = useState("Loading...");

  return (
    <>
      <h1>Welcome to the main page</h1>
      <h3>Server status:</h3> {serverStatus}
      <h3>DataBase connection:</h3> {dbStatus}
    </>
  );
}
