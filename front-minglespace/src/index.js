import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./asset/scss/style.scss";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="font">
      <App />
    </div>
  </React.StrictMode>
);
