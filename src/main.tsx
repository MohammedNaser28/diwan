import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PoemVaultProvider } from "./context/PoemVaultContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PoemVaultProvider>
      <App />
    </PoemVaultProvider>
  </React.StrictMode>,
);
