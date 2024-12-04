import React from "react";
import root from "./router/root";
import { RouterProvider } from "react-router-dom";
// import PocketBase from "pocketbase";

const App = () => {
  // const pb = new PocketBase("http://localhost:3000");
  // const me = "user1";

  return (
    <>
      <RouterProvider router={root} />;{/* <chatList me={me} /> */}
    </>
  );
};

export default App;
