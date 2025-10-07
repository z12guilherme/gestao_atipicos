import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
<<<<<<< HEAD

createRoot(document.getElementById("root")!).render(<App />);
=======
import { ThemeProvider } from "../theme-provider.tsx";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
>>>>>>> 79cda45 (Dark Mode)
