import { scan } from "react-scan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: <intended>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

scan({
  enabled: true,
});
