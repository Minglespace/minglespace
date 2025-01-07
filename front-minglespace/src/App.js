import React from "react";
import root from "./router/root";
import { RouterProvider } from "react-router-dom";

if (process.env.NODE_ENV === "production") {
  console.log = function () { };
}

const App = () => {
  return (
    <>
      <RouterProvider router={root} />
    </>
  );
};

export default App;
