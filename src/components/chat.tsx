"use client";

import { useSocket } from "context/socket-context";
import { useEffect, useState } from "react";

export function Chat() {
  const socket = useSocket();
  const [messages, setMessages] = useState([""]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    console.log("Chat socket:", socket);
    if (socket) {
      socket.onmessage = (event: any) => {
        const response = JSON.parse(event.data);
        console.log("Received message:", response);
        if (response.type === "chatMessage") {
          console.log("Updating messages state:", response.data);
          setMessages((prevMessages) => [...prevMessages, response.data]);
        }
      };
    }
  }, [socket]);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleClick = () => {
    console.log("Input value:", inputValue);
    socket?.send(inputValue);
  };

  return (
    <section>
      <h2>Chat with support:</h2>
      {messages.map((message, i) => (
        <p key={i}>{message}</p>
      ))}
      <input type="text" value={inputValue} onChange={handleInputChange} />
      <button onClick={handleClick}>Send Message</button>
    </section>
  );
}
