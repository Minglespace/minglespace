import React from "react";
import root from "./router/root";
import { RouterProvider } from "react-router-dom";
import { WebSocketProvider } from "./chat/context/WebSocketContext";

const App = () => {

  return (
    <>
      <WebSocketProvider>
        <RouterProvider router={root} />;
      </WebSocketProvider>
    </>
  );
};

export default App;
