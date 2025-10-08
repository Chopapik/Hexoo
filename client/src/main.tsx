import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./modules/App";
import "./styles/index.css";
import "./styles/scrollbar.css";
import { initTheme, setTheme } from "./utils/theme";
import dayjs from "dayjs";
import "dayjs/locale/pl";

initTheme();

setTheme("dark");

dayjs.locale("pl");

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
