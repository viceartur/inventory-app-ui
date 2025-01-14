let socket: WebSocket;

export function wsConnect(): WebSocket {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket("ws://127.0.0.1:8080/ws");

  socket.onopen = () => {
    console.log("WS: connection openned");
    socket.send("sendMaterial");
  };

  socket.onclose = (event) => {
    console.log("WS: connection closed", event);
    socket.send("Client Closed!");
  };

  socket.onerror = (error) => {
    console.log("WS: connection error: ", error);
  };

  return socket;
}

export const wsOnMessage = (socket: WebSocket, eventHandler: Function) => {
  socket.onmessage = (event) => {
    console.log("WS event from the server:", event);

    const response = JSON.parse(event.data);
    switch (response.type) {
      case "incomingMaterialsQty":
        eventHandler(response.data);
        break;
      default:
        console.log("No socket handlers defined for the type:", response.type);
    }
  };
};

export const wsSendMessage = (socket: WebSocket, message: string) => {
  socket.send(message);
};
