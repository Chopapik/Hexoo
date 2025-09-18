import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./modules/App";
import "./index.css";
import { initTheme, setTheme } from "./utils/theme";

// Initialize theme before React mounts to avoid FOUC
initTheme();

setTheme("dark");

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
